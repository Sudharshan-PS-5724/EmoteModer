const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, trim: true, unique: true, sparse: true },
  googleId: { type: String, required: true, unique: true, immutable: true, trim: true },
  displayName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  photo: { type: String, trim: true, maxlength: 2048 },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, versionKey: false });
userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function findOrCreateFromFirebase(decodedToken) {
  if (mongoose.connection.readyState !== 1) throw new Error('User storage is unavailable');
  if (!decodedToken?.uid || decodedToken.firebase?.sign_in_provider !== 'google.com' || decodedToken.email_verified !== true) {
    throw new Error('A verified Google sign-in is required');
  }

  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email?.trim().toLowerCase();
  const googleId = decodedToken.firebase?.identities?.['google.com']?.[0] || firebaseUid;
  const displayName = decodedToken.name?.trim().slice(0, 120) || email?.split('@')[0] || 'EmoteModer user';
  const photo = decodedToken.picture?.trim().slice(0, 2048);

  let user = await User.findOne({ firebaseUid });
  if (!user) user = await User.findOne({ googleId });
  if (!user && email) {
    const matchingProfiles = await User.find({ email }).limit(2);
    if (matchingProfiles.length > 1) throw new Error('This email matches multiple existing profiles; resolve the duplicate profiles before signing in');
    user = matchingProfiles[0] || null;
  }

  if (user) {
    if (user.firebaseUid && user.firebaseUid !== firebaseUid) throw new Error('This email is already linked to another Firebase account');
    const updates = { firebaseUid, displayName, ...(email ? { email } : {}), ...(photo ? { photo } : {}) };
    if (Object.entries(updates).every(([key, value]) => user[key] === value)) return user;
    // Claim an unlinked legacy profile atomically. Concurrent accounts may not overwrite its UID.
    const linked = await User.findOneAndUpdate({ _id: user._id, $or: [{ firebaseUid }, { firebaseUid: { $exists: false } }, { firebaseUid: null }] }, { $set: updates }, { new: true, runValidators: true });
    if (!linked) throw new Error('This email is already linked to another Firebase account');
    return linked;
  }

  try {
    return await User.create({ firebaseUid, googleId, displayName, email, photo });
  } catch (error) {
    if (error.code !== 11000) throw error;
    const racedUser = await User.findOne({ firebaseUid, googleId });
    if (!racedUser) throw new Error('This email is already linked to another Firebase account');
    return racedUser;
  }
}

module.exports = { User, findOrCreateFromFirebase };
