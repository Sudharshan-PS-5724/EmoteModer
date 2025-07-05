require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { createClient } = require('redis');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const { RedisStore } = require('connect-redis');
const ChatCleanupService = require('./services/chatCleanup');
const chatbotRoute = require('./routes/chatbot');
const sentimentAnalysis = require('./services/sentimentAnalysis');

require('./auth'); // Import passport config

const app = express();

// MongoDB Atlas connection with better error handling
const connectMongoDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      console.log('🔗 Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Atlas connected successfully!');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);
    } else {
      console.log('⚠️  No MONGO_URI found in environment variables');
      console.log('📝 Using in-memory storage for development');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('📝 Falling back to in-memory storage');
  }
};

// Initialize MongoDB connection
connectMongoDB();

// Create and connect Redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// Create RedisStore instance
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
  ttl: 86400
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// OAuth routes
app.use('/auth', require('./routes/auth'));

// User routes
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.user);
});

// Mood board routes with sentiment analysis
app.get('/api/moodboards', requireAuth, async (req, res) => {
  try {
    const { getBoardsByUser } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.googleId || req.user.id;
    console.log('User object:', req.user);
    console.log('Using userId for board retrieval:', userId);
    
    const boards = await getBoardsByUser(userId);
    
    // Analyze emotions for each board
    const boardsWithEmotions = await Promise.all(
      boards.map(async (board) => {
        const emotionAnalysis = await sentimentAnalysis.analyzeMoodBoard(board);
        return {
          ...board.toObject ? board.toObject() : board,
          detectedEmotion: emotionAnalysis.emotion,
          emotionConfidence: emotionAnalysis.confidence
        };
      })
    );
    
    res.json(boardsWithEmotions);
  } catch (error) {
    console.error('Error fetching mood boards:', error);
    res.status(500).json({ message: 'Error fetching mood boards' });
  }
});

app.post('/api/moodboards', requireAuth, async (req, res) => {
  try {
    const { createBoard } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.googleId || req.user.id;
    console.log('User object:', req.user);
    console.log('Using userId for board creation:', userId);
    
    // Ensure items have IDs
    const itemsWithId = (req.body.items || []).map(item => ({
      ...item,
      id: item.id || Date.now().toString() + Math.random().toString(36).slice(2)
    }));
    
    const boardData = {
      ...req.body,
      userId,
      items: itemsWithId
    };
    
    const board = await createBoard(boardData);
    
    // Analyze emotion for the new board
    const emotionAnalysis = await sentimentAnalysis.analyzeMoodBoard(board);
    
    // Ensure proper object conversion and createdAt field
    const boardResponse = {
      ...(board.toObject ? board.toObject() : board),
      detectedEmotion: emotionAnalysis.emotion,
      emotionConfidence: emotionAnalysis.confidence,
      createdAt: board.createdAt || new Date()
    };
    
    res.status(201).json(boardResponse);
  } catch (error) {
    console.error('Error creating mood board:', error);
    res.status(500).json({ message: 'Error creating mood board' });
  }
});

// Public mood boards route
app.get('/api/moodboards/public', async (req, res) => {
  try {
    const { getPublicBoards } = require('./models/MoodBoard');
    const boards = await getPublicBoards();
    
    // Analyze emotions for public boards
    const boardsWithEmotions = await Promise.all(
      boards.map(async (board) => {
        const emotionAnalysis = await sentimentAnalysis.analyzeMoodBoard(board);
        return {
          ...board.toObject ? board.toObject() : board,
          detectedEmotion: emotionAnalysis.emotion,
          emotionConfidence: emotionAnalysis.confidence
        };
      })
    );
    
    res.json(boardsWithEmotions);
  } catch (error) {
    console.error('Error fetching public mood boards:', error);
    res.status(500).json({ message: 'Error fetching public mood boards' });
  }
});

app.get('/api/moodboards/:id', requireAuth, async (req, res) => {
  try {
    const { getBoardById } = require('./models/MoodBoard');
    const board = await getBoardById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Mood board not found' });
    }
    
    const userId = req.user.googleId || req.user.id;
    if (board.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Analyze emotion for the board
    const emotionAnalysis = await sentimentAnalysis.analyzeMoodBoard(board);
    
    res.json({
      ...(board.toObject ? board.toObject() : board),
      detectedEmotion: emotionAnalysis.emotion,
      emotionConfidence: emotionAnalysis.confidence
    });
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
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
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
app.post('/api/analyze-emotion', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const analysis = await sentimentAnalysis.analyzeText(text);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ message: 'Error analyzing emotion' });
  }
});

// Mood history endpoint
app.get('/api/mood-history', requireAuth, async (req, res) => {
  try {
    const { getMoodHistory } = require('./models/User');
    const userId = req.user.googleId || req.user.id;
    const history = await getMoodHistory(userId);
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ message: 'Error fetching mood history' });
  }
});

// Storage monitoring endpoint
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    let stats = {
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        storageSize: 0,
        collections: 0,
        users: 0,
        boards: 0
      },
      system: {
        timestamp: new Date(),
        uptime: process.uptime()
      }
    };

    if (mongoose.connection.readyState === 1) {
      const dbStats = await mongoose.connection.db.stats();
      const { User } = require('./models/User');
      const { MoodBoard } = require('./models/MoodBoard');
      
      stats.mongodb = {
        connected: true,
        storageSize: dbStats.dataSize,
        storageSizeMB: Math.round(dbStats.dataSize / (1024 * 1024) * 100) / 100,
        collections: dbStats.collections,
        users: await User.countDocuments(),
        boards: await MoodBoard.countDocuments(),
        database: mongoose.connection.name,
        host: mongoose.connection.host
      };

      // Calculate usage percentage (assuming 512MB free tier limit)
      const freeTierLimit = 512 * 1024 * 1024; // 512MB in bytes
      stats.mongodb.usagePercent = Math.round((dbStats.dataSize / freeTierLimit) * 100);
      
      // Warning if usage is high
      if (stats.mongodb.usagePercent > 80) {
        console.warn(`⚠️ HIGH STORAGE USAGE: ${stats.mongodb.usagePercent}% (${stats.mongodb.storageSizeMB}MB used)`);
      }
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MoodBoard Me API is running',
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    },
    authenticated: req.isAuthenticated(),
    user: req.user ? req.user.displayName : null
  });
});

// Debug endpoint to check session
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionID: req.sessionID,
    authenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user.id,
      googleId: req.user.googleId,
      displayName: req.user.displayName,
      email: req.user.email
    } : null,
    sessionData: req.session
  });
});

// Session cleanup endpoint
app.post('/api/debug/clear-session', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to clear session' });
      }
      res.json({ message: 'Session cleared successfully' });
    });
  } else {
    res.json({ message: 'No session to clear' });
  }
});

// Chat cleanup endpoint (for manual triggering)
app.post('/api/admin/cleanup', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // In a real app, you'd check if the user is an admin
  const cleanupService = new ChatCleanupService();
  cleanupService.manualCleanup()
    .then(() => {
      res.json({ message: 'Chat cleanup completed successfully' });
    })
    .catch((error) => {
      console.error('Manual cleanup failed:', error);
      res.status(500).json({ error: 'Cleanup failed' });
    });
});

// Chatbot route
app.use('/api/chatbot', chatbotRoute);

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMongoDB();
  
  // Start chat cleanup service
  if (process.env.FIREBASE_API_KEY) {
    const cleanupService = new ChatCleanupService();
    cleanupService.startScheduler();
    console.log('✅ Chat cleanup service started');
  } else {
    console.log('⚠️  Firebase not configured, chat cleanup disabled');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🔐 OAuth endpoint: http://localhost:${PORT}/auth`);
    console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);