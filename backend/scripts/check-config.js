const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
const backend = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
const frontend = dotenv.parse(fs.readFileSync(path.join(__dirname, '../../frontend/.env')));
const required = ['MONGO_URI', 'FRONTEND_URL', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
let valid = true;
for (const key of required) {
  const present = Boolean(backend[key]?.trim()) && !/^(your-|replace-)/.test(backend[key]);
  console.log(key + ': ' + (present ? 'present' : 'missing or placeholder'));
  valid &&= present;
}
let keyValid = false;
try { crypto.createPrivateKey(backend.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')); keyValid = true; } catch { /* Do not log private key parsing errors. */ }
const projectsMatch = Boolean(backend.FIREBASE_PROJECT_ID) && backend.FIREBASE_PROJECT_ID === frontend.VITE_FIREBASE_PROJECT_ID;
console.log('Admin private key parses: ' + keyValid);
console.log('Frontend/backend Firebase project match: ' + projectsMatch);
valid &&= keyValid && projectsMatch;

async function checkConnection() {
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(backend.MONGO_URI, { autoIndex: false, autoCreate: false, maxPoolSize: 1, serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.db.command({ ping: 1 });
    console.log('MongoDB connectivity: OK');
    for (const collection of ['users', 'moodboards']) {
      const indexes = await mongoose.connection.db.collection(collection).listIndexes().toArray();
      console.log(collection + ' index keys: ' + JSON.stringify(indexes.map(({ key }) => key)));
    }
  } catch (error) {
    console.log('MongoDB connectivity/index inspection failed (' + (error.code || error.name) + ').');
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
if (!valid) process.exitCode = 1;
if (process.argv.includes('--connect')) checkConnection();
