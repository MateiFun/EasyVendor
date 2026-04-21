const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// GET /orders - Get orders
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Get orders - coming soon' });
});

// POST /orders - Create new order
router.post('/', authenticate, (req, res) => {
  res.json({ message: 'Create order - coming soon' });
});

module.exports = router;
