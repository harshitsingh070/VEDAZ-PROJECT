const express = require('express');
const cors = require('cors');
const MessageController = require('./controllers/messageController');
const authRoutes = require('./routes/authRoutes');
const createMessageRoutes = require('./routes/messageRoutes');
const { corsOrigin } = require('./config');

function createApp({ messageService }) {
  const app = express();

  app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  const controller = new MessageController(messageService);

  app.use('/api/auth', authRoutes);
  app.use('/api/messages', createMessageRoutes(controller));

  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    if (status >= 500) console.error('[error]', error);
    res.status(status).json({ success: false, error: error.message || 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
