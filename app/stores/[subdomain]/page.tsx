'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './store.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
}

interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

interface StoreConfig {
  title: string;
  backgroundColor: string;
  titleColor: string;
  requireLogin: boolean;
  template?: StoreTemplateId;
  sections?: { id: string; name: string; productIds: number[] }[];
}

type StoreTemplateId =
  | 'minimal_boutique'
  | 'neo_streetwear'
  | 'warm_market'
  | 'clean_saas';

const DEFAULT_TEMPLATE: StoreTemplateId = 'neo_streetwear';

const TEMPLATE_STYLES: Record<
  StoreTemplateId,
  {
    appBg: string;
    headerBg: string;
    headerColor: string;
    cartBorder: string;
    cartCountBg: string;
    searchBg: string;
    searchColor: string;
    searchBorder: string;
    chipBg: string;
    chipColor: string;
    chipBorder: string;
    chipActiveBg: string;
    chipActiveColor: string;
    sectionTitle: string;
    sectionBorder: string;
    cardBg: string;
    cardBorder: string;
    cardTitle: string;
    price: string;
    stockBg: string;
    stockColor: string;
    addBtnBg: string;
    addBtnColor: string;
    addBtnBorder: string;
    cartPanelBg: string;
    cartPanelColor: string;
    cartPanelBorder: string;
    cartSummaryBorder: string;
    buyerBg: string;
    buyerInputBg: string;
    buyerInputColor: string;
    buyerInputBorder: string;
    checkoutBg: string;
    checkoutColor: string;
    popularBg: string;
  }
> = {
  minimal_boutique: {
    appBg: '#f4f4f4',
    headerBg: '#ffffff',
    headerColor: '#2a2a2a',
    cartBorder: '#dddddd',
    cartCountBg: '#ef8a42',
    searchBg: '#fafafa',
    searchColor: '#4f4f4f',
    searchBorder: '#dfdfdf',
    chipBg: '#ffffff',
    chipColor: '#666666',
    chipBorder: '#dddddd',
    chipActiveBg: '#232323',
    chipActiveColor: '#ffffff',
    sectionTitle: '#777777',
    sectionBorder: '#e6e6e6',
    cardBg: '#ffffff',
    cardBorder: '#e6e6e6',
    cardTitle: '#222222',
    price: '#2a2a2a',
    stockBg: '#e7f6e5',
    stockColor: '#2f6c3e',
    addBtnBg: '#fafafa',
    addBtnColor: '#333333',
    addBtnBorder: '#dddddd',
    cartPanelBg: '#ffffff',
    cartPanelColor: '#333333',
    cartPanelBorder: '#e6e6e6',
    cartSummaryBorder: '#ececec',
    buyerBg: '#f8f8f8',
    buyerInputBg: '#ffffff',
    buyerInputColor: '#333333',
    buyerInputBorder: '#d9d9d9',
    checkoutBg: '#2d2d2d',
    checkoutColor: '#ffffff',
    popularBg: '#f2994a',
  },
  neo_streetwear: {
    appBg: '#1e1f22',
    headerBg: 'linear-gradient(180deg, #151734 0%, #191b3b 100%)',
    headerColor: '#ffffff',
    cartBorder: '#4f5471',
    cartCountBg: '#ef5948',
    searchBg: '#2a2b2f',
    searchColor: '#dddddd',
    searchBorder: '#4b4b4b',
    chipBg: 'transparent',
    chipColor: '#d8d8d8',
    chipBorder: '#535353',
    chipActiveBg: '#1a1d4b',
    chipActiveColor: '#ffffff',
    sectionTitle: '#c8c8c8',
    sectionBorder: '#3d3d3d',
    cardBg: '#2b2c2f',
    cardBorder: '#494949',
    cardTitle: '#f0f0f0',
    price: '#ffffff',
    stockBg: '#d9eed0',
    stockColor: '#436132',
    addBtnBg: 'transparent',
    addBtnColor: '#e8e8e8',
    addBtnBorder: '#555555',
    cartPanelBg: '#2b2c2f',
    cartPanelColor: '#f0f0f0',
    cartPanelBorder: '#494949',
    cartSummaryBorder: '#444444',
    buyerBg: '#232428',
    buyerInputBg: '#1d1e22',
    buyerInputColor: '#f0f0f0',
    buyerInputBorder: '#555555',
    checkoutBg: '#1a1d4b',
    checkoutColor: '#ffffff',
    popularBg: '#ef5948',
  },
  warm_market: {
    appBg: '#f7f3ee',
    headerBg: '#f18a3b',
    headerColor: '#ffffff',
    cartBorder: '#f0b585',
    cartCountBg: '#ec6f23',
    searchBg: '#ffffff',
    searchColor: '#6a4b35',
    searchBorder: '#f0d8c5',
    chipBg: '#fffaf6',
    chipColor: '#986946',
    chipBorder: '#ecc9ad',
    chipActiveBg: '#f18a3b',
    chipActiveColor: '#ffffff',
    sectionTitle: '#b0815e',
    sectionBorder: '#efdecf',
    cardBg: '#ffffff',
    cardBorder: '#f0decd',
    cardTitle: '#573f2e',
    price: '#cb6a21',
    stockBg: '#fcead9',
    stockColor: '#a15f2f',
    addBtnBg: '#fff6ef',
    addBtnColor: '#8e5d3a',
    addBtnBorder: '#efcdae',
    cartPanelBg: '#fffdfa',
    cartPanelColor: '#553d2f',
    cartPanelBorder: '#f0decd',
    cartSummaryBorder: '#efd9c5',
    buyerBg: '#fff5ea',
    buyerInputBg: '#ffffff',
    buyerInputColor: '#5e4635',
    buyerInputBorder: '#ebcfb5',
    checkoutBg: '#ee7e30',
    checkoutColor: '#ffffff',
    popularBg: '#ee7e30',
  },
  clean_saas: {
    appBg: '#eef2f7',
    headerBg: '#ffffff',
    headerColor: '#203047',
    cartBorder: '#d7e4f0',
    cartCountBg: '#1f6fdd',
    searchBg: '#ffffff',
    searchColor: '#314a63',
    searchBorder: '#d1e0ee',
    chipBg: '#ffffff',
    chipColor: '#517da9',
    chipBorder: '#b7cde2',
    chipActiveBg: '#1f6fdd',
    chipActiveColor: '#ffffff',
    sectionTitle: '#557da5',
    sectionBorder: '#d7e5f2',
    cardBg: '#ffffff',
    cardBorder: '#bfd2e4',
    cardTitle: '#1f3350',
    price: '#1f3350',
    stockBg: '#e7f4ea',
    stockColor: '#2b7446',
    addBtnBg: '#1f6fdd',
    addBtnColor: '#ffffff',
    addBtnBorder: '#1f6fdd',
    cartPanelBg: '#ffffff',
    cartPanelColor: '#22354e',
    cartPanelBorder: '#c9dceb',
    cartSummaryBorder: '#d9e7f3',
    buyerBg: '#f2f8fd',
    buyerInputBg: '#ffffff',
    buyerInputColor: '#253952',
    buyerInputBorder: '#c7d9eb',
    checkoutBg: '#1f6fdd',
    checkoutColor: '#ffffff',
    popularBg: '#4a9cec',
  },
};

export default function StorePage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [store, setStore] = useState<any>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [buyerInfo, setBuyerInfo] = useState({ firstName: '', lastName: '' });
  const [buyerIdentified, setBuyerIdentified] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await fetch(`/api/stores/${subdomain}`);
        if (!res.ok) throw new Error('Store not found');

        const data = await res.json();
        setStore(data.store);
        // data.store.config is already a JS object from PostgreSQL JSONB
        const loadedConfig =
          typeof data.store.config === 'string' ? JSON.parse(data.store.config) : data.store.config;
        setConfig({
          ...loadedConfig,
          template: loadedConfig.template || DEFAULT_TEMPLATE,
        });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading store:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      loadStore();
    }
  }, [subdomain]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);
      if (existing) {
        // Check if adding another would exceed stock
        if (existing.quantity + 1 > product.stock) {
          alert(`Only ${product.stock} available in stock`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { productId: product.id, quantity: 1, product }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          // Check if quantity exceeds stock
          if (quantity > item.product.stock) {
            alert(`Only ${item.product.stock} available in stock`);
            return item; // Keep original quantity
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!buyerInfo.firstName || !buyerInfo.lastName) {
      alert('Please enter your first and last name');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
          cartItems: cart,
          buyerFirstName: buyerInfo.firstName,
          buyerLastName: buyerInfo.lastName,
          total: cartTotal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(
          `Order placed! Order #${data.orderId}\nTotal: $${cartTotal.toFixed(2)}\n\nThank you for your purchase!`
        );
        setCart([]);
        setBuyerInfo({ firstName: '', lastName: '' });
        setShowCart(false);
      } else {
        alert('Error placing order. Please try again.');
      }
    } catch (error) {
      alert('Error placing order. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading store...</div>;
  }

  if (!store || !config) {
    return <div className={styles.error}>Store not found</div>;
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const sectionGroups =
    config.sections && config.sections.length > 0
      ? config.sections.map((section) => ({
          ...section,
          products: section.productIds
            .map((productId) => productsById.get(productId))
            .filter(Boolean) as Product[],
        }))
      : [{ id: 'default', name: 'Products', productIds: products.map((product) => product.id), products }];
  const visibleSections = sectionGroups
    .filter((section) => activeSectionId === 'all' || section.id === activeSectionId)
    .map((section) => ({
      ...section,
      products: section.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.products.length > 0 || searchQuery === '');
  const template = config.template || DEFAULT_TEMPLATE;
  const theme = TEMPLATE_STYLES[template];

  // Show login screen if store requires login and buyer not identified
  if (config.requireLogin && !buyerIdentified) {
    return (
      <div className={styles.container} style={{ background: theme.appBg }}>
        <div
          className={styles.loginScreen}
          style={{ backgroundColor: config.backgroundColor }}
        >
          <div className={styles.loginCard}>
            <h1 style={{ color: config.titleColor }}>{config.title}</h1>
            <p>This store requires your information to proceed.</p>
            <input
              type="text"
              placeholder="First Name"
              value={buyerInfo.firstName}
              onChange={(e) =>
                setBuyerInfo({ ...buyerInfo, firstName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={buyerInfo.lastName}
              onChange={(e) =>
                setBuyerInfo({ ...buyerInfo, lastName: e.target.value })
              }
            />
            <button
              onClick={() => {
                if (buyerInfo.firstName && buyerInfo.lastName) {
                  setBuyerIdentified(true);
                } else {
                  alert('Please enter both first and last name');
                }
              }}
              className={styles.loginBtn}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ background: theme.appBg }}>
      <div
        className={styles.header}
        style={{ background: theme.headerBg, color: theme.headerColor }}
      >
        <div className={styles.brand}>
          <div className={styles.logo} style={{ background: theme.chipActiveBg, color: theme.chipActiveColor }}>
            S
          </div>
          <h1>{config.title || 'My Store'}</h1>
        </div>
        <button
          className={styles.cartBtn}
          onClick={() => setShowCart(!showCart)}
          style={{ borderColor: theme.cartBorder, color: theme.headerColor }}
        >
          Cart <span style={{ background: theme.cartCountBg }}>{cart.length}</span>
        </button>
      </div>

      <div className={`${styles.content} ${showCart ? styles.contentWithCart : ''}`}>
        <div>
          <input
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: theme.searchBg,
              color: theme.searchColor,
              borderColor: theme.searchBorder,
            }}
          />
          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${activeSectionId === 'all' ? styles.chipActive : ''}`}
              onClick={() => setActiveSectionId('all')}
                style={
                  activeSectionId === 'all'
                    ? { background: theme.chipActiveBg, borderColor: theme.chipActiveBg, color: theme.chipActiveColor }
                    : { background: theme.chipBg, borderColor: theme.chipBorder, color: theme.chipColor }
                }
            >
              All products
            </button>
            {sectionGroups.map((section) => (
              <button
                key={section.id}
                className={`${styles.chip} ${activeSectionId === section.id ? styles.chipActive : ''}`}
                onClick={() => setActiveSectionId(section.id)}
                style={
                  activeSectionId === section.id
                    ? { background: theme.chipActiveBg, borderColor: theme.chipActiveBg, color: theme.chipActiveColor }
                    : { background: theme.chipBg, borderColor: theme.chipBorder, color: theme.chipColor }
                }
              >
                {section.name}
              </button>
            ))}
          </div>

          {visibleSections.map((section) => (
            <div key={section.id} className={styles.sectionBlock}>
              <h2 style={{ color: theme.sectionTitle, borderBottomColor: theme.sectionBorder }}>
                {section.name.toUpperCase()}
              </h2>
              <div className={styles.productsGrid}>
                {section.products.map((product, index) => (
                  <div
                    key={product.id}
                    className={styles.productCard}
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                  >
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} />
                    )}
                    <div className={styles.productInfo}>
                      {index < 3 && (
                        <span className={styles.popularBadge} style={{ background: theme.popularBg }}>
                          Popular
                        </span>
                      )}
                      <h3 style={{ color: theme.cardTitle }}>{product.name}</h3>
                      <p className={styles.price} style={{ color: theme.price }}>${Number(product.price).toFixed(2)}</p>
                      <p className={styles.stock} style={{ background: theme.stockBg, color: theme.stockColor }}>
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : 'Out of stock'}
                      </p>
                      <button
                        className={styles.addBtn}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        style={{
                          background: theme.addBtnBg,
                          color: theme.addBtnColor,
                          borderColor: theme.addBtnBorder,
                        }}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showCart && (
          <div
            className={styles.cartPanel}
            style={{
              background: theme.cartPanelBg,
              color: theme.cartPanelColor,
              borderColor: theme.cartPanelBorder,
            }}
          >
            <h2>Your Cart</h2>

            {cart.length === 0 ? (
              <p className={styles.emptyCart}>Your cart is empty</p>
            ) : (
              <>
                <div className={styles.cartItems}>
                  {cart.map((item) => (
                    <div key={item.productId} className={styles.cartItem}>
                      <div className={styles.itemDetails}>
                        <h4>{item.product.name}</h4>
                        <p>${Number(item.product.price).toFixed(2)}</p>
                      </div>
                      <div className={styles.itemControls}>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.itemTotal}>
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.productId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.cartSummary} style={{ borderTopColor: theme.cartSummaryBorder }}>
                  <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span className={styles.totalAmount}>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.buyerForm} style={{ background: theme.buyerBg }}>
                    <h3>Your Information</h3>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={buyerInfo.firstName}
                      onChange={(e) =>
                        setBuyerInfo({
                          ...buyerInfo,
                          firstName: e.target.value,
                        })
                      }
                      style={{
                        background: theme.buyerInputBg,
                        color: theme.buyerInputColor,
                        borderColor: theme.buyerInputBorder,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={buyerInfo.lastName}
                      onChange={(e) =>
                        setBuyerInfo({
                          ...buyerInfo,
                          lastName: e.target.value,
                        })
                      }
                      style={{
                        background: theme.buyerInputBg,
                        color: theme.buyerInputColor,
                        borderColor: theme.buyerInputBorder,
                      }}
                    />
                  </div>

                  <button
                    className={styles.checkoutBtn}
                    onClick={handleCheckout}
                    style={{ background: theme.checkoutBg, color: theme.checkoutColor }}
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
