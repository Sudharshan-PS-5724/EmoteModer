const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Map sentiment score to mood
function scoreToMood(score) {
  if (score > 3) return 'happy';
  if (score > 1) return 'calm';
  if (score < -3) return 'sad';
  if (score < -1) return 'reflective';
  return 'peaceful';
}

function analyzeMood(text) {
  const { score } = sentiment.analyze(text || '');
  return scoreToMood(score);
}

module.exports = { analyzeMood }; 