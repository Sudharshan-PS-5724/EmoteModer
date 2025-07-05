const express = require('express');
const router = express.Router();

// Get current user info
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router; 