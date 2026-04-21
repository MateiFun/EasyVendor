const pool = require('../config/db');

// Create store
const createStore = async (req, res) => {
  try {
    const { name, description, location, hours } = req.body;
    const ownerId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Store name required' });
    }

    const result = await pool.query(
      'INSERT INTO stores (owner_id, name, description, location, hours) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [ownerId, name, description, location, hours]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

// Get user's store
const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No store found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

// Get all stores (for buyers)
const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, owner_id, name, description, location, hours, status FROM stores WHERE status = $1',
      ['active']
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = await pool.query(
      'SELECT * FROM stores WHERE id = $1',
      [storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { name, description, location, hours, status } = req.body;
    const ownerId = req.user.id;

    const result = await pool.query(
      'UPDATE stores SET name = $1, description = $2, location = $3, hours = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE owner_id = $6 RETURNING *',
      [name, description, location, hours, status, ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

module.exports = { createStore, getMyStore, getAllStores, getStoreById, updateStore };
