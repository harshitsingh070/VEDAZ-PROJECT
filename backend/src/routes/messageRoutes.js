const express = require('express');

function createMessageRoutes(messageController) {
  const router = express.Router();

  router.get('/', messageController.getAll);
  router.post('/', messageController.create);

  return router;
}

module.exports = createMessageRoutes;
