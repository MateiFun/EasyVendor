import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// GET store configuration
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
    const result = await pool.query(
      'SELECT * FROM stores WHERE seller_id = $1',
      [decoded.sellerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const store = result.rows[0];
    return NextResponse.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE store configuration
export async function PUT(req: NextRequest) {
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

    const { config } = await req.json();

    // Update store config
    const result = await pool.query(
      'UPDATE stores SET config = $1, updated_at = NOW() WHERE seller_id = $2 RETURNING *',
      [JSON.stringify(config), decoded.sellerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUBLISH store
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

    const { action } = await req.json();

    if (action === 'publish') {
      const result = await pool.query(
        'UPDATE stores SET is_published = true, updated_at = NOW() WHERE seller_id = $1 RETURNING *',
        [decoded.sellerId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, store: result.rows[0] });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Publish store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
