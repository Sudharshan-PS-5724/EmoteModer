const mongoose = require('mongoose');
const { analyzeMood } = require('../services/sentiment');

const moodBoardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  mood: String,
  isPublic: { type: Boolean, default: false },
  items: [
    {
      type: { type: String, enum: ['image', 'text', 'color'], required: true },
      content: String,
      name: String,
      isEditing: Boolean
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const MoodBoard = mongoose.models.MoodBoard || mongoose.model('MoodBoard', moodBoardSchema);

// In-memory fallback for dev/testing
const boards = [];

async function createBoard(data) {
  // Auto-analyze mood if not provided
  let mood = data.mood;
  if (!mood) {
    const text = (data.title || '') + ' ' + (data.description || '');
    mood = analyzeMood(text);
  }
  
  // Ensure userId is properly set
  const userId = data.userId;
  console.log('Creating board with userId:', userId);
  
  const boardData = { ...data, mood, isPublic: data.isPublic ?? false, userId };

  if (mongoose.connection.readyState === 1) {
    const board = await MoodBoard.create(boardData);
    console.log('Board created in MongoDB with ID:', board._id);
    return board;
  } else {
    const board = { ...boardData, id: Date.now().toString(), createdAt: new Date() };
    boards.push(board);
    console.log('Board created in memory with ID:', board.id);
    return board;
  }
}

async function getBoardsByUser(userId) {
  console.log('getBoardsByUser called for userId:', userId);
  console.log('MongoDB connection state:', mongoose.connection.readyState);
  
  if (mongoose.connection.readyState === 1) {
    console.log('Using MongoDB for board retrieval');
    const boards = await MoodBoard.find({ userId });
    console.log('Found boards in MongoDB:', boards.length);
    console.log('Board user IDs:', boards.map(b => b.userId));
    return boards;
  } else {
    console.log('Using in-memory storage for board retrieval');
    const userBoards = boards.filter(b => b.userId === userId);
    console.log('Found boards in memory:', userBoards.length);
    console.log('Board user IDs:', userBoards.map(b => b.userId));
    return userBoards;
  }
}

async function getBoardById(id) {
  if (mongoose.connection.readyState === 1) {
    return MoodBoard.findById(id);
  } else {
    return boards.find(b => b.id === id);
  }
}

async function deleteBoard(id, userId) {
  console.log('Deleting board with ID:', id, 'for userId:', userId);
  if (mongoose.connection.readyState === 1) {
    return MoodBoard.deleteOne({ _id: id, userId });
  } else {
    const idx = boards.findIndex(b => b.id === id && b.userId === userId);
    if (idx !== -1) boards.splice(idx, 1);
    return { deleted: idx !== -1 };
  }
}

async function getPublicBoards() {
  if (mongoose.connection.readyState === 1) {
    return MoodBoard.find({ isPublic: true });
  } else {
    return boards.filter(b => b.isPublic);
  }
}

module.exports = { MoodBoard, createBoard, getBoardsByUser, getBoardById, deleteBoard, getPublicBoards }; 