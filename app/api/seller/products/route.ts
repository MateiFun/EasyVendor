import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
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

    // Get all products for this store (excluding deleted)
    const productsResult = await pool.query(
      'SELECT id, name, price, stock, image_url FROM products WHERE store_id = $1 AND is_deleted = false ORDER BY created_at',
      [storeId]
    );

    return NextResponse.json({ products: productsResult.rows });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
