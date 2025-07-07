// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  moodHistory: [{
    mood: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise'],
      required: true
    },
    confidence: {
      type: Number,
      default: 0.8
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user by ID
const findById = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

// Get user by username
const findByUsername = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
};

// Get user by email
const findByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

// Create new user
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user's last login
const updateLastLogin = async (userId) => {
  try {
    return await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  } catch (error) {
    console.error('Error updating last login:', error);
    return null;
  }
};

// Add mood to user's history
const addMoodToHistory = async (userId, mood, confidence = 0.8) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          moodHistory: {
            mood,
            confidence,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error adding mood to history:', error);
    return null;
  }
};

// Get user's mood history
const getMoodHistory = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user ? user.moodHistory : [];
  } catch (error) {
    console.error('Error getting mood history:', error);
    return [];
  }
};

const User = mongoose.model('User', userSchema);

module.exports = { 
  User, 
  findById, 
  findByUsername, 
  findByEmail, 
  createUser, 
  updateLastLogin,
  addMoodToHistory,
  getMoodHistory
};