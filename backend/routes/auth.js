const express = require('express');
const jwt = require('jsonwebtoken');
const { findByUsername, findByEmail, createUser, updateLastLogin } = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate input
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await findByUsername(username) || await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Create new user
    const user = await createUser({
      username,
      email,
      password,
      displayName
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await updateLastLogin(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find user by username or email
    const user = await findByUsername(username) || await findByEmail(username);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await updateLastLogin(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
};

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { findById } = require('../models/User');
    const user = await findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user' 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logged out successfully' 
  });
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: 'Simple auth system is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      me: 'GET /auth/me',
      logout: 'POST /auth/logout'
    }
  });
});

module.exports = { router, verifyToken }; 