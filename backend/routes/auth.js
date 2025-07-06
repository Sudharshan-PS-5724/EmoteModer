const express = require('express');
const passport = require('passport');
const router = express.Router();

// Debug OAuth configuration
router.get('/debug', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Start Google OAuth flow
router.get('/google',
  (req, res, next) => {
    console.log('🔐 Starting Google OAuth flow...');
    console.log('🔑 Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('🔑 Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('🔗 Callback URL:', process.env.GOOGLE_CALLBACK_URL || 'Not set');
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Handle OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    console.log('🔄 Google OAuth callback received');
    console.log('📝 Query params:', req.query);
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: '/',
    failureFlash: true
  }),
  (req, res) => {
    console.log('✅ OAuth successful, user:', req.user);
    // Get redirect URL from query parameter or use environment variable
    const redirectUrl = req.query.redirect || 
      (process.env.FRONTEND_URL || 
       (process.env.NODE_ENV === 'production' 
         ? 'https://emotemoder.vercel.app/dashboard'
         : 'http://localhost:5173/dashboard'));
    
    console.log('🔄 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

// Logout
router.get('/logout', (req, res) => {
  console.log('🚪 User logout requested');
  req.logout(() => {
    const redirectUrl = process.env.FRONTEND_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://emotemoder.vercel.app'
        : 'http://localhost:5173');
    console.log('🔄 Logout redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  });
});

module.exports = router; 