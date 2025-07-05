// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// In-memory fallback for dev/testing
const users = new Map();

async function findOrCreate(profile) {
  console.log('findOrCreate called with profile:', profile.id, profile.displayName);
  
  if (mongoose.connection.readyState === 1) {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value
      });
      console.log('Created new user in MongoDB:', user.googleId);
    } else {
      console.log('Found existing user in MongoDB:', user.googleId);
    }
    return user;
  } else {
    let user = users.get(profile.id);
    if (!user) {
      user = {
        id: profile.id, // MongoDB _id equivalent
        googleId: profile.id, // Ensure googleId is present
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        createdAt: new Date()
      };
      users.set(profile.id, user);
      console.log('Created new user in memory:', user.googleId);
    } else {
      console.log('Found existing user in memory:', user.googleId);
    }
    return user;
  }
}

async function findById(id) {
  console.log('findById called with id:', id);
  
  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ googleId: id });
    console.log('User found in MongoDB:', user ? user.googleId : 'not found');
    return user;
  } else {
    const user = users.get(id);
    console.log('User found in memory:', user ? user.googleId : 'not found');
    return user;
  }
}

module.exports = { User, findOrCreate, findById };