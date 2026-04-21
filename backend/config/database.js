const pool = require('./db');

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'staff')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(200),
        hours VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Menu items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        availability BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        store_id INTEGER NOT NULL REFERENCES stores(id),
        status VARCHAR(50) DEFAULT 'pending',
        total_price DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        pickup_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      );
    `);

    // Inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        stock_quantity INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Loyalty points table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER DEFAULT 0,
        reliability_score DECIMAL(3, 2) DEFAULT 1.0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
