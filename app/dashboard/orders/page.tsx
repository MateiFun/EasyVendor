'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './orders.module.css';

interface OrderItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: number;
  created_at: string;
  buyer_first_name: string;
  buyer_last_name: string;
  total_price: number;
  order_status: 'pending' | 'accepted' | 'rejected' | 'completed' | string;
  previous_completed_orders: number;
  items: OrderItem[];
}

interface EarningsPoint {
  order_date: string;
  daily_earnings: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<EarningsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const router = useRouter();

  const loadOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/seller-login');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push('/auth/seller-login');
        return;
      }

      const data = await res.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [router]);

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/orders/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('seller');
    router.push('/');
  };

  const goToEditor = () => {
    router.push('/dashboard/editor');
  };

  const updateOrderStatus = async (orderId: number, order_status: 'accepted' | 'rejected' | 'completed') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status }),
      });

      if (!res.ok) {
        console.error('Failed to update order status');
        return;
      }

      await loadOrders();

      if (order_status === 'completed') {
        await loadStats();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openStats = async () => {
    await loadStats();
    setShowStats(true);
  };

  const maxEarnings = Math.max(...stats.map((point) => Number(point.daily_earnings)), 1);

  if (loading) {
    return <div className={styles.loading}>Loading orders...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Your Orders</h1>
        <div className={styles.headerButtons}>
          <button onClick={openStats} className={styles.statsBtn}>
            Statistics
          </button>
          <button onClick={goToEditor} className={styles.editorBtn}>
            Back to Editor
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No orders yet. Publish your store to start receiving orders!</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <h3>
                    Order #{order.id} - {order.buyer_first_name} {order.buyer_last_name}
                  </h3>
                  {order.previous_completed_orders > 0 && (
                    <p className={styles.orderDate}>
                      Returning customer - {order.previous_completed_orders} other completed order
                      {order.previous_completed_orders === 1 ? '' : 's'}
                    </p>
                  )}
                  <span className={`${styles.statusBadge} ${styles[`status_${order.order_status}`] || ''}`}>
                    {order.order_status}
                  </span>
                  <p className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>

                <div className={styles.orderItems}>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className={styles.item}>
                      <span className={styles.itemName}>
                        {item.product_name || 'Product'}
                      </span>
                      <span className={styles.itemQty}>
                        Qty: {item.quantity}
                      </span>
                      <span className={styles.itemPrice}>
                        ${Number(item.price_at_purchase).toFixed(2)} each
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <span className={styles.totalLabel}>Order Total:</span>
                  <span className={styles.totalAmount}>
                    ${Number(order.total_price).toFixed(2)}
                  </span>
                </div>
                <div className={styles.orderActions}>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => updateOrderStatus(order.id, 'rejected')}
                    disabled={updatingOrderId === order.id || order.order_status === 'rejected' || order.order_status === 'completed'}
                  >
                    Reject
                  </button>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    disabled={updatingOrderId === order.id || order.order_status === 'accepted' || order.order_status === 'completed' || order.order_status === 'rejected'}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.completedBtn}
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    disabled={updatingOrderId === order.id || order.order_status !== 'accepted'}
                  >
                    Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStats && (
        <div className={styles.modalOverlay} onClick={() => setShowStats(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Money Earned Over Time</h2>
              <button className={styles.closeBtn} onClick={() => setShowStats(false)}>X</button>
            </div>

            {stats.length === 0 ? (
              <p className={styles.emptyStats}>No completed orders yet.</p>
            ) : (
              <div className={styles.chartWrap}>
                <svg viewBox="0 0 700 300" className={styles.chartSvg}>
                  <line x1="50" y1="250" x2="670" y2="250" className={styles.axisLine} />
                  <line x1="50" y1="20" x2="50" y2="250" className={styles.axisLine} />

                  {stats.map((point, index) => {
                    const x = 50 + (index * (620 / Math.max(stats.length - 1, 1)));
                    const y = 250 - ((Number(point.daily_earnings) / maxEarnings) * 220);
                    return (
                      <g key={point.order_date}>
                        <circle cx={x} cy={y} r="4" className={styles.point} />
                        <text x={x} y="270" textAnchor="middle" className={styles.xLabel}>
                          {new Date(point.order_date).toLocaleDateString()}
                        </text>
                        <text x={x} y={y - 10} textAnchor="middle" className={styles.valueLabel}>
                          ${Number(point.daily_earnings).toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {stats.length > 1 && (
                    <polyline
                      fill="none"
                      className={styles.linePath}
                      points={stats
                        .map((point, index) => {
                          const x = 50 + (index * (620 / (stats.length - 1)));
                          const y = 250 - ((Number(point.daily_earnings) / maxEarnings) * 220);
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
