const { getFirebaseAdminAuth } = require('../services/firebaseAdmin');
const { findOrCreateFromFirebase } = require('../models/User');

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) return res.status(401).json({ message: 'Sign in to continue.' });

  try {
    // Verify the Firebase token first; client-provided profile fields are never trusted.
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(match[1], true);
    req.firebaseUid = decodedToken.uid;
    req.user = await findOrCreateFromFirebase(decodedToken);
    next();
  } catch (error) {
    if (['auth/argument-error', 'auth/id-token-expired', 'auth/id-token-revoked', 'auth/invalid-id-token', 'auth/user-disabled', 'auth/user-not-found'].includes(error.code)) {
      return res.status(401).json({ message: 'Your sign-in expired. Please sign in again.' });
    }
    if (error.message === 'A verified Google sign-in is required') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === 'This email is already linked to another Firebase account') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === 'This email matches multiple existing profiles; resolve the duplicate profiles before signing in') {
      return res.status(409).json({ message: error.message });
    }

    // Configuration and database failures are retryable; do not mislabel them as bad user credentials.
    console.error('Firebase token verification failed:', error.message);
    res.status(503).json({ message: 'Authentication is temporarily unavailable. Check Firebase Admin configuration and database connectivity.' });
  }
}

module.exports = requireAuth;
