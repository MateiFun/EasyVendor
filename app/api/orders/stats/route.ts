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
    ) as { sellerId: number };

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

    const statsResult = await pool.query(
      `SELECT
        DATE(created_at) AS order_date,
        SUM(total_price)::numeric(10,2) AS daily_earnings
      FROM orders
      WHERE store_id = $1 AND ${statusColumn} = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC`,
      [storeId]
    );

    return NextResponse.json({ stats: statsResult.rows });
  } catch (error) {
    console.error('Get order stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
