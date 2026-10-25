const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const sdk = createRequire(require('node:path').resolve(__dirname, '../../frontend/package.json'));
const { initializeApp, deleteApp } = sdk('firebase/app');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, getDocs, deleteDoc, collection, query, limit, serverTimestamp, Timestamp, terminate } = sdk('firebase/firestore');
const target = process.env.FIRESTORE_EMULATOR_HOST;
if (!target || !/^(127\.0\.0\.1|localhost):\d+$/.test(target)) throw new Error('Run these tests through the local Firestore emulator; a live database is never allowed.');
const [host, port] = target.split(':');
const apps = [];
function client(name, token) {
  const app = initializeApp({ projectId: 'demo-emotemoder', apiKey: 'demo-key' }, name);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, host, Number(port), token ? { mockUserToken: token } : {});
  apps.push({ app, db }); return db;
}
const alice = client('alice', { sub: 'alice', name: 'Alice', picture: '', email_verified: true, firebase: { sign_in_provider: 'google.com', identities: {} } });
const bob = client('bob', { sub: 'bob', name: 'Bob', picture: '', email_verified: true, firebase: { sign_in_provider: 'google.com', identities: {} } });
const guest = client('guest');
const unverified = client('unverified', { sub: 'unverified', name: 'Unverified', email_verified: false, firebase: { sign_in_provider: 'google.com', identities: {} } });
const password = client('password', { sub: 'password', name: 'Password', email_verified: true, firebase: { sign_in_provider: 'password', identities: {} } });
const expiresAt = (days) => Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
const message = (extra = {}) => ({ text: 'Hello', userId: 'alice', userName: 'Alice', userPhoto: '', type: 'text', timestamp: serverTimestamp(), expiresAt: expiresAt(7), ...extra });
const denied = (promise) => assert.rejects(promise, (error) => error.code === 'permission-denied');
after(async () => { await Promise.all(apps.map(async ({ app, db }) => { await terminate(db); await deleteApp(app); })); });

test('verified Google members can send and read bounded room messages', async () => {
  await setDoc(doc(alice, 'chatRooms/happy/messages/valid'), message());
  assert.equal((await getDocs(query(collection(bob, 'chatRooms/happy/messages'), limit(100)))).size, 1);
});
test('anonymous, unverified, and other providers cannot enter rooms', async () => {
  for (const db of [guest, unverified, password]) await denied(getDocs(query(collection(db, 'chatRooms/happy/messages'), limit(100))));
});
test('room allowlist, sender identity, photo, size and type are enforced', async () => {
  await denied(setDoc(doc(alice, 'chatRooms/private/messages/invalid'), message()));
  for (const [index, payload] of [message({ userId: 'bob' }), message({ userName: 'Bob' }), message({ userPhoto: 'https://example.com/track' }), message({ text: 'x'.repeat(4001) }), message({ type: 'text', mood: 'happy' }), message({ type: 'mood', mood: 'unknown' })].entries()) {
    await denied(setDoc(doc(alice, 'chatRooms/happy/messages/invalid-' + index), payload));
  }
});
test('only the sender can delete; all message edits are rejected', async () => {
  await denied(deleteDoc(doc(bob, 'chatRooms/happy/messages/valid')));
  await denied(setDoc(doc(alice, 'chatRooms/happy/messages/valid'), message({ text: 'edited' })));
  await deleteDoc(doc(alice, 'chatRooms/happy/messages/valid'));
});
test('unbounded message and typing queries are rejected', async () => {
  await denied(getDocs(collection(alice, 'chatRooms/happy/messages')));
  await denied(getDocs(query(collection(alice, 'chatRooms/happy/messages'), limit(101))));
  await denied(getDocs(collection(alice, 'chatRooms/happy/typing')));
});
test('typing is scoped to the authenticated sender', async () => {
  const data = { userId: 'alice', userName: 'Alice', timestamp: serverTimestamp(), expiresAt: expiresAt(1) };
  await setDoc(doc(alice, 'chatRooms/happy/typing/alice'), data);
  await denied(setDoc(doc(alice, 'chatRooms/happy/typing/bob'), data));
  await denied(deleteDoc(doc(bob, 'chatRooms/happy/typing/alice')));
  await deleteDoc(doc(alice, 'chatRooms/happy/typing/alice'));
});
