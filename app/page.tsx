'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1>Welcome to EasyVendor</h1>
        <p>Create your online store in minutes - No coding required</p>
        
        <div className={styles.buttons}>
          <Link href="/auth/seller-signup" className={styles.btnPrimary}>
            Create Your Store
          </Link>
          <Link href="/auth/seller-login" className={styles.btnSecondary}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
