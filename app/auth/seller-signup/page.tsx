'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

export default function SellerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subdomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/seller-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('seller', JSON.stringify(data.seller));

      // Redirect to editor
      router.push('/dashboard/editor');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Create Your Store</h1>
        <p className={styles.subtitle}>
          Join EasyVendor and start selling today
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Business Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="My Amazing Store"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subdomain">Store URL</label>
            <div className={styles.subdomainInput}>
              <span>easyvendor.com/stores/</span>
              <input
                type="text"
                id="subdomain"
                name="subdomain"
                placeholder="mystore"
                value={formData.subdomain}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Store...' : 'Create Store'}
          </button>
        </form>

        <p className={styles.link}>
          Already have a store?{' '}
          <Link href="/auth/seller-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
