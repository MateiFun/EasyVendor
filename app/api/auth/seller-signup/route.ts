import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, subdomain } = await req.json();

    // Validate input
    if (!email || !password || !name || !subdomain) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists
    const subdomainCheck = await pool.query(
      'SELECT id FROM sellers WHERE store_subdomain = $1',
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Store subdomain already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT id FROM sellers WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const result = await pool.query(
      'INSERT INTO sellers (name, email, password, store_subdomain) VALUES ($1, $2, $3, $4) RETURNING id, email, name, store_subdomain',
      [name, email, hashedPassword, subdomain]
    );

    const seller = result.rows[0];

    // Create initial store config
    await pool.query(
      'INSERT INTO stores (seller_id, subdomain, config, is_published) VALUES ($1, $2, $3, $4)',
      [
        seller.id,
        subdomain,
        JSON.stringify({
          title: 'My Store',
          backgroundColor: '#ffffff',
          titleColor: '#000000',
          requireLogin: false,
          products: [],
        }),
        false,
      ]
    );

    // Generate JWT
    const token = jwt.sign(
      { sellerId: seller.id, email: seller.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        token,
        seller: {
          id: seller.id,
          email: seller.email,
          name: seller.name,
          subdomain: seller.store_subdomain,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
