import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const productId = parseInt(id);

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

    // Soft delete product from seller's store
    const result = await pool.query(
      'UPDATE products SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND store_id = $2 RETURNING id',
      [productId, storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const productId = parseInt(id);
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

    // Update product
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3, image_url = $4, updated_at = NOW() WHERE id = $5 AND store_id = $6 RETURNING *',
      [name, price, stock, image_url || null, productId, storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
