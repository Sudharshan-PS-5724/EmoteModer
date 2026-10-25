const { spawnSync } = require('node:child_process');

const result = spawnSync('java', ['-version'], { stdio: 'ignore', shell: process.platform === 'win32' });
if (result.error || result.status !== 0) {
  console.error('Firestore rules tests require a Java JDK (Java 21 recommended; Java 11 or newer supported by Firebase). Install it, reopen your terminal, then run npm run test:rules again.');
  process.exit(1);
}
