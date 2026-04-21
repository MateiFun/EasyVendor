import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

async function getOrderStatusColumn() {
  const columnResult = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_name = 'orders'
       AND column_name = 'order_status'
     LIMIT 1`
  );

  return columnResult.rows.length > 0 ? 'order_status' : 'status';
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
    const orderId = parseInt(id);
    const { order_status } = await req.json();
    const statusColumn = await getOrderStatusColumn();

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

    // Get order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND store_id = $2',
      [orderId, storeId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // If accepting order, decrease stock
    if (order_status === 'accepted' && order[statusColumn] === 'pending') {
      // Get order items
      const itemsResult = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Update stock for each product
      for (const item of itemsResult.rows) {
        await pool.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    // Update order status
    const result = await pool.query(
      `UPDATE orders SET ${statusColumn} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [order_status, orderId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
