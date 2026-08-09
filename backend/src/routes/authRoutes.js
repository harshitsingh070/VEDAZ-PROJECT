const express = require('express');
const { login } = require('../services/authService');

const router = express.Router();

router.post('/login', (req, res, next) => {
  try {
    const { username } = req.body || {};
    res.json({ success: true, data: login({ username }) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
