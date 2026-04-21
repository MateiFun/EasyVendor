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
    const statusColumn = await getOrderStatusColumn();

    // Get orders for this store
    const ordersResult = await pool.query(
      `SELECT 
        o.id, o.created_at, o.buyer_first_name, o.buyer_last_name, o.total_price, o.${statusColumn} AS order_status,
        (
          SELECT COUNT(*)
          FROM orders o2
          WHERE o2.store_id = o.store_id
            AND o2.buyer_first_name = o.buyer_first_name
            AND o2.buyer_last_name = o.buyer_last_name
            AND o2.${statusColumn} = 'completed'
            AND o2.created_at < o.created_at
        )::int AS previous_completed_orders,
        json_agg(json_build_object(
          'product_id', oi.product_id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price_at_purchase', oi.price_at_purchase
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.store_id = $1
      GROUP BY o.id, o.created_at, o.buyer_first_name, o.buyer_last_name, o.total_price, o.${statusColumn}
      ORDER BY o.created_at DESC`,
      [storeId]
    );

    return NextResponse.json({ orders: ordersResult.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
