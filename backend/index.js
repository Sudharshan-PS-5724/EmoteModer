require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const chatbotRoute = require('./routes/chatbot');
const sentimentAnalysis = require('./services/sentimentAnalysis');
const requireAuth = require('./middleware/requireAuth');
const userRateLimit = require('./middleware/userRateLimit');
const { validateBoard, parsePage, encodeCursor } = require('./lib/boardValidation');

const app = express();
mongoose.set('bufferCommands', false);
app.disable('x-powered-by');

// Persistence is explicit: application records never fall back to process memory.
const connectMongoDB = async () => {
  if (!process.env.MONGO_URI) {
    if (process.env.NODE_ENV === 'production') throw new Error('MONGO_URI is required in production');
    console.warn('MONGO_URI is unset; database-backed routes will be unavailable until MongoDB is configured.');
    return;
  }
  await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 10, minPoolSize: 0, maxIdleTimeMS: 60000, waitQueueTimeoutMS: 5000, serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
if (process.env.NODE_ENV !== 'production') allowedOrigins.push('http://localhost:5173', 'http://localhost:5174');
app.use(cors({ origin: allowedOrigins, allowedHeaders: ['Content-Type', 'Authorization'], exposedHeaders: ['X-Next-Cursor', 'Retry-After'] }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// User routes
app.get('/api/user', requireAuth, (req, res) => {
  const { _id, firebaseUid, googleId, displayName, email, photo, createdAt } = req.user;
  res.json({ _id, firebaseUid, googleId, displayName, email, photo, createdAt });
});

function presentBoard(board, { publicView = false, preview = false } = {}) {
  const record = board && typeof board.toObject === 'function' ? board.toObject() : board;
  const result = { ...record, detectedEmotion: record.emotionAnalysis?.emotion || record.mood || 'neutral', emotionConfidence: record.emotionAnalysis?.confidence };
  if (preview) {
    result.itemCount = record.itemCount ?? record.items?.length ?? 0;
    result.items = (record.items || []).slice(0, 4).map((item) => ({
      ...item,
      ...(item.type === 'text' ? { content: String(item.content || '').slice(0, 240) } : {})
    }));
  }
  if (publicView) delete result.userId;
  return result;
}
function pageRequest(req, res, next) {
  try { req.page = parsePage(req.query); next(); }
  catch (error) { res.status(400).json({ message: error.message }); }
}
function sendBoardPage(res, boards, page, publicView = false) {
  const visible = boards.slice(0, page.limit);
  if (boards.length > page.limit) res.set('X-Next-Cursor', encodeCursor(visible[visible.length - 1]));
  res.json(visible.map((board) => presentBoard(board, { preview: true, publicView })));
}
// Mood board routes with sentiment analysis
app.get('/api/moodboards', requireAuth, pageRequest, async (req, res) => {
  try {
    const { getBoardsByUser } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.googleId || req.user.id;
    
    const boards = await getBoardsByUser(userId, req.page);
    
    sendBoardPage(res, boards, req.page);
  } catch (error) {
    console.error('Error fetching mood boards:', error);
    res.status(500).json({ message: 'Error fetching mood boards' });
  }
});

app.post('/api/moodboards', requireAuth, userRateLimit({ limit: 10, windowMs: 60_000, message: 'You have created several boards recently. Please wait a minute before trying again.' }), async (req, res) => {
  try {
    const { createBoard } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.googleId || req.user.id;
    
    const { title, description, mood, isPublic, items } = req.body || {};
    const validationError = validateBoard(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const boardData = { title: title.trim(), description, mood, isPublic: isPublic === true, items: items || [], userId };
    
    const board = await createBoard(boardData);
    
    let boardResponse = board.toObject ? board.toObject() : board;
    try {
      const emotionAnalysis = await sentimentAnalysis.analyzeMoodBoard(board);
      const savedAnalysis = await require('./models/MoodBoard').saveEmotionAnalysis(board._id, emotionAnalysis);
      boardResponse = {
        ...(savedAnalysis || boardResponse),
        detectedEmotion: emotionAnalysis.emotion,
        emotionConfidence: emotionAnalysis.confidence
      };
    } catch (analysisError) {
      // Board creation is already durable; optional analysis must not turn it into a reported failure.
      console.error('Moodboard created without emotion analysis:', analysisError.message);
      boardResponse = { ...boardResponse, detectedEmotion: board.mood || 'neutral' };
    }

    res.status(201).json({ ...boardResponse, createdAt: boardResponse.createdAt || new Date() });
  } catch (error) {
    console.error('Error creating mood board:', error);
    res.status(500).json({ message: 'Error creating mood board' });
  }
});

// Public mood boards route
app.get('/api/moodboards/public', pageRequest, async (req, res) => {
  try {
    const { getPublicBoards } = require('./models/MoodBoard');
    const boards = await getPublicBoards(req.page);
    
    sendBoardPage(res, boards, req.page, true);
  } catch (error) {
    console.error('Error fetching public mood boards:', error);
    res.status(500).json({ message: 'Error fetching public mood boards' });
  }
});

app.get('/api/moodboards/:id', requireAuth, async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid board ID provided' });
  try {
    const { getBoardById } = require('./models/MoodBoard');
    const board = await getBoardById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Mood board not found' });
    }
    
    const userId = req.user.googleId || req.user.id;
    if (board.userId !== userId) {
      return res.status(404).json({ message: 'Mood board not found' });
    }
    
    res.json(presentBoard(board));
  } catch (error) {
    console.error('Error fetching mood board:', error);
    res.status(500).json({ message: 'Error fetching mood board' });
  }
});

app.delete('/api/moodboards/:id', requireAuth, async (req, res) => {
  try {
    const { deleteBoard } = require('./models/MoodBoard');
    const userId = req.user.googleId || req.user.id;
    
    // Validate the ID parameter
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid board ID provided' });
    }
    
    const result = await deleteBoard(req.params.id, userId);
    
    if (result.deleted || result.deletedCount > 0) {
      res.json({ message: 'Mood board deleted' });
    } else {
      res.status(404).json({ message: 'Mood board not found' });
    }
  } catch (error) {
    console.error('Error deleting mood board:', error);
    res.status(500).json({ message: 'Error deleting mood board' });
  }
});

// Sentiment analysis endpoint
app.post('/api/analyze-emotion', requireAuth, userRateLimit({ limit: 10, windowMs: 60_000, message: 'Too many emotion analyses. Please wait a minute and try again.' }), async (req, res) => {
  try {
    const { text } = req.body || {};
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ message: 'Text is required' });
    if (text.length > 4000) return res.status(400).json({ message: 'Text must be 4000 characters or fewer' });
    
    const analysis = await sentimentAnalysis.analyzeText(text);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ message: 'Error analyzing emotion' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const firebaseAdminConfigured = Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  const ready = databaseReady && firebaseAdminConfigured;
  res.status(ready || process.env.NODE_ENV !== 'production' ? 200 : 503).json({
    status: ready ? 'OK' : 'DEGRADED',
    message: 'EmoteModer API',
    mongodb: {
      connected: databaseReady
    },
    firebaseAdminConfigured
  });
});


// Chatbot route
app.use('/api/chatbot', requireAuth,
  userRateLimit({ limit: 20, windowMs: 60_000, message: 'You have reached the chat limit for this minute. Please try again shortly.' }),
  userRateLimit({ limit: 200, windowMs: 86_400_000, message: 'You have reached the 200-message chat limit for today. Please return tomorrow.' }),
  chatbotRoute
);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false, maxAge: '1y', immutable: true }));
  app.get('*', (req, res, next) => {
    if (!req.accepts('html')) return next();
    res.set('Cache-Control', 'no-store');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must contain valid JSON' });
  console.error('Request failed:', error.message);
  res.status(500).json({ message: 'The request could not be completed' });
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.NODE_ENV === 'production' && (!process.env.FRONTEND_URL || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID)) throw new Error('FRONTEND_URL and Firebase Admin credentials are required in production');
  try {
    await connectMongoDB();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn(`MongoDB is unavailable; starting API in degraded development mode (${error.code || error.name}). Database-backed routes will return an availability error until it reconnects.`);
  }

  console.log('Firestore records include expiresAt metadata. Managed Firestore TTL is intentionally not required on the no-cost Spark plan.');

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  });
  const stop = () => {
    const deadline = setTimeout(() => process.exit(1), 10_000);
    deadline.unref();
    server.close(async () => { await mongoose.disconnect(); clearTimeout(deadline); });
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  return server;
};

if (require.main === module) startServer().catch((error) => { console.error('Server startup failed:', error.message); process.exit(1); });
module.exports = { app, startServer };
