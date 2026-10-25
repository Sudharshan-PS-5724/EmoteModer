const mongoose = require('mongoose');
const { analyzeMood } = require('../services/sentiment');
const { validItem } = require('../lib/boardValidation');
const moodBoardItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'text', 'color'], required: true },
  content: { type: String, required: true, maxlength: 4000, validate: { validator: function () { return validItem(this.toObject()); }, message: 'Invalid content for this item type' } },
  name: { type: String, trim: true, maxlength: 120, default: '' },
  position: { x: { type: Number, min: 0, max: 10000 }, y: { type: Number, min: 0, max: 10000 } }
}, { _id: true, versionKey: false });
const moodBoardSchema = new mongoose.Schema({
  // Ownership comes from the verified API user and never from editable client data.
  userId: { type: String, required: true, immutable: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  mood: { type: String, enum: ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise', 'neutral'], default: 'neutral' },
  isPublic: { type: Boolean, default: false, index: true },
  items: { type: [moodBoardItemSchema], default: [], validate: [(items) => items.length <= 100, 'A moodboard can contain at most 100 items'] },
  emotionAnalysis: {
    emotion: { type: String, enum: ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise', 'neutral'] },
    confidence: { type: Number, min: 0, max: 1 },
    model: { type: String, maxlength: 120 },
    analyzedAt: Date
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, versionKey: false });
moodBoardSchema.index({ userId: 1, updatedAt: -1, _id: -1 });
moodBoardSchema.index({ isPublic: 1, updatedAt: -1, _id: -1 });
const MoodBoard = mongoose.models.MoodBoard || mongoose.model('MoodBoard', moodBoardSchema);
function requireDatabase() { if (mongoose.connection.readyState !== 1) throw new Error('Moodboard storage is unavailable'); }
async function createBoard(data) {
  requireDatabase();
  const mood = data.mood || analyzeMood(`${data.title || ''} ${data.description || ''}`);
  return MoodBoard.create({ userId: data.userId, title: data.title, description: data.description || '', mood, isPublic: data.isPublic === true, items: data.items || [] });
}
async function listBoards(filter, { limit = 30, cursor = null } = {}) {
  // Fetch one extra document so callers can render a reliable “load more” control.
  requireDatabase();
  if (cursor) filter = { ...filter, $or: [
    { updatedAt: { $lt: new Date(cursor.at) } },
    { updatedAt: new Date(cursor.at), _id: { $lt: new mongoose.Types.ObjectId(cursor.id) } }
  ] };
  return MoodBoard.aggregate([
    { $match: filter }, { $sort: { updatedAt: -1, _id: -1 } }, { $limit: limit + 1 },
    { $project: { title: 1, description: 1, mood: 1, isPublic: 1, emotionAnalysis: 1, createdAt: 1, updatedAt: 1,
      itemCount: { $size: { $ifNull: ['$items', []] } }, items: { $slice: [{ $ifNull: ['$items', []] }, 4] } } }
  ]);
}
async function getBoardsByUser(userId, page) { return listBoards({ userId }, page); }
async function getRecentBoardContext(userId, limit = 3) {
  requireDatabase();
  return MoodBoard.find({ userId })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(Math.min(Math.max(limit, 1), 3))
    .select({ title: 1, description: 1, mood: 1 })
    .lean();
}
async function getBoardById(id) { requireDatabase(); if (!mongoose.isValidObjectId(id)) return null; return MoodBoard.findById(id).lean(); }
async function deleteBoard(id, userId) { requireDatabase(); if (!mongoose.isValidObjectId(id)) return { deletedCount: 0 }; return MoodBoard.deleteOne({ _id: id, userId }); }
async function getPublicBoards(page) { return listBoards({ isPublic: true }, page); }
async function saveEmotionAnalysis(id, analysis) {
  requireDatabase();
  const model = analysis.model || 'local-lexicon-v1';
  return MoodBoard.findByIdAndUpdate(id, { $set: { emotionAnalysis: { emotion: analysis.emotion, confidence: analysis.confidence, model, analyzedAt: new Date() } } }, { new: true, runValidators: true }).lean();
}
module.exports = { MoodBoard, createBoard, getBoardsByUser, getRecentBoardContext, getBoardById, deleteBoard, getPublicBoards, saveEmotionAnalysis };
