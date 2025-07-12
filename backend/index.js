require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');
const mongoose = require('mongoose');
const cors = require('cors');
const ChatCleanupService = require('./services/chatCleanup');
const chatbotRoute = require('./routes/chatbot');
const sentimentAnalysis = require('./services/sentimentAnalysis');
const { router: authRouter, verifyToken } = require('./routes/auth');

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

// Redis connection for caching (optional)
let redisClient;
const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      console.log('🔗 Connecting to Redis...');
      redisClient = createClient({ 
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis connection failed after 10 retries');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });
      
      await redisClient.connect();
      console.log('✅ Redis connected successfully!');
    } else {
      console.log('⚠️  No REDIS_URL found, Redis caching disabled');
      redisClient = null;
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('📝 Redis caching disabled');
    redisClient = null;
  }
};

// Initialize Redis connection
connectRedis();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://emote-moder.vercel.app',
        'https://emotemoder.vercel.app',
        'https://emotemoder-frontend.vercel.app',
        'https://emotemoder-git-main.vercel.app',
        'http://localhost:5173' // for development
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Emote Moder API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      debug: '/debug/env',
      auth: '/auth',
      api: '/api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'not set',
    MONGO_URI: process.env.MONGO_URI ? 'set' : 'not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
    PORT: process.env.PORT || 'not set',
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.use('/auth', authRouter);

// User routes with JWT authentication
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const { findById } = require('./models/User');
    const user = await findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Mood board routes with sentiment analysis
app.get('/api/moodboards', verifyToken, async (req, res) => {
  try {
    const { getBoardsByUser } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.userId;
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

app.post('/api/moodboards', verifyToken, async (req, res) => {
  try {
    const { createBoard } = require('./models/MoodBoard');
    // Ensure we use the correct user identifier
    const userId = req.user.userId;
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

app.get('/api/moodboards/:id', verifyToken, async (req, res) => {
  try {
    const { getBoardById } = require('./models/MoodBoard');
    const board = await getBoardById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Mood board not found' });
    }
    
    const userId = req.user.userId;
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

app.delete('/api/moodboards/:id', verifyToken, async (req, res) => {
  try {
    const { deleteBoard } = require('./models/MoodBoard');
    const userId = req.user.userId;
    
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
app.post('/api/analyze-emotion', verifyToken, async (req, res) => {
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
app.get('/api/mood-history', verifyToken, async (req, res) => {
  try {
    const { getMoodHistory } = require('./models/User');
    const userId = req.user.userId;
    const history = await getMoodHistory(userId);
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ message: 'Error fetching mood history' });
  }
});

// Storage monitoring endpoint
app.get('/api/stats', verifyToken, async (req, res) => {
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

// JWT token validation endpoint
app.get('/api/debug/token', verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
    tokenValid: true,
    timestamp: new Date().toISOString()
  });
});

// Chat cleanup endpoint (for manual triggering)
app.post('/api/admin/cleanup', verifyToken, async (req, res) => {
  try {
    // In a real app, you'd check if the user is an admin
    const cleanupService = new ChatCleanupService();
    await cleanupService.manualCleanup();
    res.json({ message: 'Chat cleanup completed successfully' });
  } catch (error) {
    console.error('Manual cleanup failed:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});
  
// Chatbot route
app.use('/api/chatbot', chatbotRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler caught:', err);
  console.error('❌ Error stack:', err.stack);
  console.error('❌ Request URL:', req.url);
  console.error('❌ Request method:', req.method);
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.url);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log('📊 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔗 MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('🔥 Firebase API Key:', process.env.FIREBASE_API_KEY ? 'Set' : 'Not set');
    
    await connectMongoDB();
    
    // Start chat cleanup service only if Firebase is configured
    if (process.env.FIREBASE_API_KEY) {
      const cleanupService = new ChatCleanupService();
      cleanupService.startScheduler();
      console.log('✅ Chat cleanup service started');
    } else {
      console.log('⚠️  Firebase not configured, chat cleanup disabled');
    }

app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
      console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch(console.error);
