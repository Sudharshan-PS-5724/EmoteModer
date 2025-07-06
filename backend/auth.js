const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findOrCreate, findById } = require('./models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth callback with profile ID:', profile.id);
    const user = await findOrCreate(profile);
    console.log('User created/found:', user.googleId);
    done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    done(err);
  }
}));

passport.serializeUser((user, done) => {
  try {
    // Always use googleId as the primary identifier
    const id = user.googleId;
    console.log('Serializing user with googleId:', id);
    done(null, id);
  } catch (err) {
    console.error('Serialization error:', err);
    done(err);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with googleId:', id);
    if (!id) {
      console.log('No user ID provided for deserialization');
      return done(null, null);
    }
    
    const user = await findById(id);
    if (!user) {
      console.log('User not found during deserialization:', id);
      return done(null, null);
    }
    
    console.log('User deserialized successfully:', user.displayName, 'googleId:', user.googleId);
    done(null, user);
  } catch (err) {
    console.error('Deserialization error:', err);
    // Don't fail the request, just return null user
    done(null, null);
  }
});