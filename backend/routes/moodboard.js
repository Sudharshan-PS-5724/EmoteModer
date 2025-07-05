const express = require('express');
const { createBoard, getBoardsByUser, getBoardById, deleteBoard, getPublicBoards } = require('../models/MoodBoard');
const router = express.Router();

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Not authenticated' });
}

// Get all mood boards for current user
router.get('/', requireAuth, async (req, res) => {
  const boards = await getBoardsByUser(req.user.googleId || req.user.id);
  res.json(boards);
});

// Create a new mood board
router.post('/', requireAuth, async (req, res) => {
  const board = await createBoard({
    ...req.body,
    userId: req.user.googleId || req.user.id
  });
  res.status(201).json(board);
});

// Get a single mood board by ID
router.get('/:id', requireAuth, async (req, res) => {
  const board = await getBoardById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Not found' });
  res.json(board);
});

// Delete a mood board
router.delete('/:id', requireAuth, async (req, res) => {
  const result = await deleteBoard(req.params.id, req.user.googleId || req.user.id);
  if (result.deleted || result.deletedCount) {
    res.json({ message: 'Deleted' });
  } else {
    res.status(404).json({ message: 'Not found or not authorized' });
  }
});

// Get all public mood boards
router.get('/public', async (req, res) => {
  const boards = await getPublicBoards();
  res.json(boards);
});

module.exports = router; 