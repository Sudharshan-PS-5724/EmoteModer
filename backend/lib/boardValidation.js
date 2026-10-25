const MOODS = ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise', 'neutral'];
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function isSafeImageUrl(value) {
  // Only durable HTTPS URLs are stored; browser blob URLs cannot be shared or restored later.
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.') && !url.username && !url.password;
  } catch { return false; }
}

function validItem(item) {
  if (!isRecord(item) || !['image', 'text', 'color'].includes(item.type) || typeof item.content !== 'string') return false;
  if (item.name != null && (typeof item.name !== 'string' || item.name.length > 120)) return false;
  if (item.position != null && (!isRecord(item.position) || Object.keys(item.position).some((axis) => !['x', 'y'].includes(axis)) || ['x', 'y'].some((axis) => item.position[axis] != null && (!Number.isFinite(item.position[axis]) || item.position[axis] < 0 || item.position[axis] > 10000)))) return false;
  if (item.type === 'text') return Boolean(item.content.trim()) && item.content.length <= 4000;
  if (item.type === 'image') return isSafeImageUrl(item.content);
  return /^#[0-9a-f]{6}$/i.test(item.content);
}

function validateBoard(body) {
  if (!isRecord(body)) return 'A moodboard must be a JSON object';
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 80) return 'Title must be between 1 and 80 characters';
  if (body.description != null && (typeof body.description !== 'string' || body.description.length > 500)) return 'Description must be 500 characters or fewer';
  if (body.mood != null && !MOODS.includes(body.mood)) return 'Mood is not supported';
  if (body.isPublic != null && typeof body.isPublic !== 'boolean') return 'Share setting must be true or false';
  if (body.items != null && (!Array.isArray(body.items) || body.items.length > 100)) return 'A moodboard can contain at most 100 items';
  if ((body.items || []).some((item) => !validItem(item))) return 'Each board item needs valid content, name, and position values';
  return null;
}

function parsePage(query, defaultLimit = 30) {
  // Cursors keep large collections stable without accepting arbitrary MongoDB query input.
  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);
  if ((query.limit !== undefined && (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit))) || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');
  let cursor = null;
  if (query.cursor !== undefined) {
    try {
      if (typeof query.cursor !== 'string' || query.cursor.length > 256) throw new Error();
      cursor = JSON.parse(Buffer.from(query.cursor, 'base64url').toString());
      if (!isRecord(cursor) || typeof cursor.at !== 'string' || !Number.isFinite(Date.parse(cursor.at)) || typeof cursor.id !== 'string' || !/^[a-f0-9]{24}$/i.test(cursor.id)) throw new Error();
    } catch { throw new Error('Invalid page cursor'); }
  }
  return { limit, cursor };
}
function encodeCursor(board) {
  return Buffer.from(JSON.stringify({ at: new Date(board.updatedAt).toISOString(), id: String(board._id) })).toString('base64url');
}

module.exports = { MOODS, validItem, validateBoard, parsePage, encodeCursor };
