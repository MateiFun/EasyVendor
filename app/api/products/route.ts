import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as any;

    const { name, price, stock, image_url } = await req.json();

    // Get seller's store
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE seller_id = $1',
      [decoded.sellerId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Insert product
    const result = await pool.query(
      'INSERT INTO products (store_id, name, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [storeId, name, price, stock, image_url || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
