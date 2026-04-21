import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { subdomain, cartItems, buyerFirstName, buyerLastName, total } = await req.json();

    if (!subdomain || !cartItems || !buyerFirstName || !buyerLastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get store by subdomain
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE subdomain = $1 AND is_published = true',
      [subdomain]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (store_id, buyer_first_name, buyer_last_name, total_price, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [storeId, buyerFirstName, buyerLastName, total]
    );

    const orderId = orderResult.rows[0].id;

    // Create order items
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.product.price]
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: `Order #${orderId} created successfully`,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
