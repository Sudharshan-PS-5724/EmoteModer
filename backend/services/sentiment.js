const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeMood(text) {
  const { score } = sentiment.analyze(text || '');
  if (score > 1) return 'happy';
  if (score < -1) return 'sad';
  return 'neutral';
}
module.exports = { analyzeMood };
