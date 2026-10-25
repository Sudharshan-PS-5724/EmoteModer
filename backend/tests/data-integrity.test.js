const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateBoard, parsePage, encodeCursor } = require('../lib/boardValidation');
const { MoodBoard } = require('../models/MoodBoard');
const userRateLimit = require('../middleware/userRateLimit');
const sentiment = require('../services/sentimentAnalysis');

test('rejects falsy, malformed, and over-limit board items before persistence', () => {
  for (const item of [null, false, 0, '', [], { type: 'image', content: 'http://example.com/image' }, { type: 'color', content: 'red' }, { type: 'text', content: ' ' }, { type: 'text', content: 'hello', position: [] }, { type: 'text', content: 'hello', position: { x: Infinity } }]) {
    assert.ok(validateBoard({ title: 'Board', items: [item] }), JSON.stringify(item));
  }
  assert.ok(validateBoard({ title: 'Board', isPublic: 'false' }));
  assert.ok(validateBoard({ title: 'Board', items: Array(101).fill({ type: 'text', content: 'note' }) }));
  assert.equal(validateBoard({ title: 'Board', mood: 'sad', items: [{ type: 'color', content: '#e8b343' }, { type: 'text', content: 'note', position: { x: 0, y: 100 } }] }), null);
});

test('Mongo schema rejects invalid typed content without relying on HTTP validation', async () => {
  for (const item of [{ type: 'color', content: 'red' }, { type: 'image', content: 'javascript:alert(1)' }, { type: 'text', content: ' ' }]) {
    await assert.rejects(new MoodBoard({ userId: 'owner', title: 'Board', items: [item] }).validate());
  }
  await new MoodBoard({ userId: 'owner', title: 'Board', items: [{ type: 'color', content: '#e8b343' }] }).validate();
});

test('cursor round trip preserves deterministic order and rejects malformed input', () => {
  const board = { _id: '507f1f77bcf86cd799439011', updatedAt: new Date('2026-01-01T00:00:00Z') };
  const parsed = parsePage({ cursor: encodeCursor(board), limit: '20' });
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.cursor.id, board._id);
  for (const query of [{ limit: '0' }, { limit: '101' }, { limit: ['1'] }, { cursor: 'bad' }, { cursor: Buffer.from('{"at":"bad","id":"x"}').toString('base64url') }]) assert.throws(() => parsePage(query));
});

test('endpoint rate limits are independent and return a retry delay', () => {
  const create = userRateLimit({ limit: 1, windowMs: 60000, message: 'limited' });
  const chat = userRateLimit({ limit: 2, windowMs: 60000, message: 'limited' });
  let passed = 0;
  const res = { headers: {}, set(k, v) { this.headers[k] = v; }, status(s) { this.code = s; return this; }, json(v) { this.body = v; } };
  const req = { firebaseUid: 'user' };
  create(req, res, () => passed++);
  chat(req, res, () => passed++);
  chat(req, res, () => passed++);
  assert.equal(passed, 3);
  create(req, res, () => passed++);
  assert.equal(res.code, 429);
  assert.ok(Number(res.headers['Retry-After']) > 0);
  create({ firebaseUid: 'other' }, res, () => passed++);
  assert.equal(passed, 4);
});

test('local sentiment keeps all mood categories and reports its actual model', async () => {
  const key = sentiment.apiKey; sentiment.apiKey = null;
  try {
    for (const [text, emotion] of [['Happy!', 'happy'], ['Sad.', 'sad'], ['Angry!', 'angry'], ['Fear', 'fear'], ['Disgusted.', 'disgust'], ['Surprised!', 'surprise'], ['a table', 'neutral']]) {
      const result = await sentiment.analyzeText(text);
      assert.equal(result.emotion, emotion);
      assert.equal(result.model, 'local-lexicon-v1');
      assert.ok(result.confidence >= 0 && result.confidence <= 1);
    }
  } finally { sentiment.apiKey = key; }
});

test('provider response parsing rejects empty and invalid scores without inventing confidence', () => {
  assert.throws(() => sentiment.processHuggingFaceResponse([]));
  assert.throws(() => sentiment.processHuggingFaceResponse([{ label: 'joy', score: NaN }]));
  assert.equal(sentiment.processHuggingFaceResponse([{ label: 'joy', score: 0 }]).confidence, 0);
});

test('room IDs agree with the deployed rules allowlist', () => {
  const rooms = require('../../shared/rooms.json');
  const rules = require('node:fs').readFileSync(require('node:path').join(__dirname, '../../firebase/firestore.rules'), 'utf8');
  const declared = [...rules.match(/function validRoom\(roomId\)[^\n]+/)[0].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(declared.sort(), rooms.map((room) => room.id).sort());
  assert.equal(new Set(rooms.map((room) => room.id)).size, rooms.length);
});
