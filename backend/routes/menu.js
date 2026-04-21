const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addMenuItem, getStoreMenu, updateMenuItem, deleteMenuItem } = require('../services/menuService');

// Protected routes (require authentication)
router.post('/', authenticate, addMenuItem);
router.put('/:itemId', authenticate, updateMenuItem);
router.delete('/:itemId', authenticate, deleteMenuItem);

// Public routes
router.get('/store/:storeId', getStoreMenu);

module.exports = router;
