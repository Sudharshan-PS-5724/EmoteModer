const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173');
  });
});

module.exports = router; 