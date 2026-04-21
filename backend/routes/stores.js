const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createStore, getMyStore, getAllStores, getStoreById, updateStore } = require('../services/storeService');

// Protected routes (require authentication)
router.post('/', authenticate, createStore);
router.get('/my-store', authenticate, getMyStore);
router.put('/', authenticate, updateStore);

// Public routes
router.get('/', getAllStores);
router.get('/:storeId', getStoreById);

module.exports = router;
