process.env.NODE_ENV = 'production';

const { startServer } = require('../index');

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
