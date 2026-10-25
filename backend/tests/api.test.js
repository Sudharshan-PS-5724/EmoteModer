const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Exercise the real Express handlers with isolated persistence and identity adapters.
const boardId = '507f1f77bcf86cd799439011';
let writes = 0;
let deletion;
const board = { _id: boardId, userId: 'owner', title: 'Board', mood: 'sad', isPublic: true, items: [], updatedAt: new Date('2026-01-01') };
function stub(path, exports) { require.cache[require.resolve(path)] = { id: require.resolve(path), filename: require.resolve(path), loaded: true, exports }; }
stub('../middleware/requireAuth', (req, res, next) => {
  const identity = req.get('authorization')?.replace('Bearer ', '');
  if (!identity) return res.status(401).json({ message: 'Sign in' });
  req.user = { googleId: identity }; req.firebaseUid = identity; next();
});
stub('../models/MoodBoard', {
  getBoardsByUser: async () => [board],
  getPublicBoards: async () => [board, { ...board, _id: '507f1f77bcf86cd799439012' }],
  getBoardById: async () => board,
  createBoard: async (data) => { writes++; return { ...board, ...data }; },
  saveEmotionAnalysis: async () => board,
  deleteBoard: async (id, owner) => { deletion = { id, owner }; return { deletedCount: owner === 'owner' ? 1 : 0 }; }
});
stub('../services/sentimentAnalysis', { analyzeMoodBoard: async () => ({ emotion: 'sad', confidence: 0.5 }) });
const { app } = require('../index');
let server; let base;
before(async () => { server = await new Promise((resolve) => { const running = app.listen(0, '127.0.0.1', () => resolve(running)); }); base = 'http://127.0.0.1:' + server.address().port; });
after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
const request = (path, options = {}) => fetch(base + path, { ...options, headers: { Authorization: 'Bearer owner', ...options.headers } });

test('private endpoints reject requests without identity', async () => {
  assert.equal((await fetch(base + '/api/moodboards')).status, 401);
});
test('falsy item is rejected before storage and valid board uses authenticated owner', async () => {
  let response = await request('/api/moodboards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Board', items: [null] }) });
  assert.equal(response.status, 400); assert.equal(writes, 0);
  response = await request('/api/moodboards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Board', userId: 'victim', items: [] }) });
  assert.equal(response.status, 201); assert.equal((await response.json()).userId, 'owner'); assert.equal(writes, 1);
});
test('foreign board cannot be read or deleted and invalid IDs return 400', async () => {
  assert.equal((await request('/api/moodboards/' + boardId, { headers: { Authorization: 'Bearer other' } })).status, 404);
  assert.equal((await request('/api/moodboards/' + boardId, { method: 'DELETE', headers: { Authorization: 'Bearer other' } })).status, 404);
  assert.deepEqual(deletion, { id: boardId, owner: 'other' });
  assert.equal((await request('/api/moodboards/not-an-id')).status, 400);
});
test('public pagination is bounded and hides ownership', async () => {
  const response = await request('/api/moodboards/public?limit=1');
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('X-Next-Cursor'));
  const data = await response.json(); assert.equal(data.length, 1); assert.equal(data[0].userId, undefined);
  assert.equal((await request('/api/moodboards/public?limit=100000')).status, 400);
});
test('parser and unknown-route errors remain JSON', async () => {
  const response = await request('/api/moodboards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(response.status, 400); assert.match((await response.json()).message, /JSON/);
  const missing = await request('/api/unknown'); assert.equal(missing.status, 404); assert.ok((await missing.json()).message);
});
