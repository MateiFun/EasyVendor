import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find seller
    const result = await pool.query(
      'SELECT id, email, password, name, store_subdomain FROM sellers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const seller = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { sellerId: seller.id, email: seller.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      seller: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        subdomain: seller.store_subdomain,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
