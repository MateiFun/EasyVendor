const pool = require('../config/db');

// Add menu item
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const ownerId = req.user.id;

    // Get user's store
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const storeId = storeResult.rows[0].id;

    // Add menu item
    const result = await pool.query(
      'INSERT INTO menu_items (store_id, name, description, price, availability) VALUES ($1, $2, $3, $4, TRUE) RETURNING *',
      [storeId, name, description, price]
    );

    // Initialize inventory
    await pool.query(
      'INSERT INTO inventory (menu_item_id, stock_quantity) VALUES ($1, $2)',
      [result.rows[0].id, 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

// Get store menu
const getStoreMenu = async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = await pool.query(
      'SELECT * FROM menu_items WHERE store_id = $1',
      [storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, availability } = req.body;
    const ownerId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      `SELECT mi.id FROM menu_items mi 
       JOIN stores s ON mi.store_id = s.id 
       WHERE mi.id = $1 AND s.owner_id = $2`,
      [itemId, ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'UPDATE menu_items SET name = $1, description = $2, price = $3, availability = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, price, availability, itemId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const ownerId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      `SELECT mi.id FROM menu_items mi 
       JOIN stores s ON mi.store_id = s.id 
       WHERE mi.id = $1 AND s.owner_id = $2`,
      [itemId, ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

module.exports = { addMenuItem, getStoreMenu, updateMenuItem, deleteMenuItem };
