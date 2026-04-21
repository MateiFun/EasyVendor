import pool from './db';

export async function initializeDatabase() {
  try {
    // Drop existing tables to start fresh
    await pool.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS stores CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS sellers CASCADE;
    `);

    // Sellers table
    await pool.query(`
      CREATE TABLE sellers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        store_subdomain VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Store configuration table (JSON for editor data)
    await pool.query(`
      CREATE TABLE stores (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products table
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL,
        image_url VARCHAR(500),
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders table (guest + registered)
    await pool.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        buyer_first_name VARCHAR(100) NOT NULL,
        buyer_last_name VARCHAR(100) NOT NULL,
        buyer_email VARCHAR(100),
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        order_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order items table
    await pool.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Registered users (buyers who create accounts)
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
