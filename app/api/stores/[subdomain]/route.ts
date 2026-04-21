import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    console.log('Fetching store with subdomain:', subdomain);

    // Get published store
    const result = await pool.query(
      'SELECT stores.*, sellers.name as seller_name FROM stores JOIN sellers ON stores.seller_id = sellers.id WHERE stores.subdomain = $1 AND stores.is_published = true',
      [subdomain]
    );

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('Store not found or not published');
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const store = result.rows[0];

    // Get products (excluding deleted)
    const productsResult = await pool.query(
      'SELECT id, name, price, stock, image_url FROM products WHERE store_id = $1 AND is_deleted = false ORDER BY created_at',
      [store.id]
    );

    return NextResponse.json({
      store,
      products: productsResult.rows,
    });
  } catch (error) {
    console.error('Get store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
