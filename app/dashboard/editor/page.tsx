'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './editor.module.css';

interface StoreConfig {
  title: string;
  backgroundColor: string;
  titleColor: string;
  requireLogin: boolean;
  template?: StoreTemplateId;
  products: Product[];
  sections?: ProductSection[];
  workers?: Worker[];
  backgroundImage?: string;
}

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}

interface ProductSection {
  id: string;
  name: string;
  productIds: number[];
}

type WorkerPaymentType = 'cut_per_sale' | 'pay_per_date' | 'hourly' | 'fixed_monthly';

interface Worker {
  id: string;
  name: string;
  paymentType: WorkerPaymentType;
  cutPercent?: number;
  payDate?: string;
  hourlyRate?: number;
  fixedMonthlyAmount?: number;
}

interface OrderItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price_at_purchase: number;
}

interface DashboardOrder {
  id: number;
  created_at: string;
  buyer_first_name: string;
  buyer_last_name: string;
  total_price: number;
  order_status: 'pending' | 'accepted' | 'rejected' | 'completed' | string;
  previous_completed_orders: number;
  items: OrderItem[];
}

type StoreTemplateId =
  | 'minimal_boutique'
  | 'neo_streetwear'
  | 'warm_market'
  | 'clean_saas';

const DEFAULT_TEMPLATE: StoreTemplateId = 'neo_streetwear';

const STORE_TEMPLATES: {
  id: StoreTemplateId;
  label: string;
  description: string;
  preview: {
    appBg: string;
    headerBg: string;
    headerColor: string;
    panelBg: string;
    panelBorder: string;
    searchBg: string;
    searchColor: string;
    chipBg: string;
    chipColor: string;
    chipBorder: string;
    chipActiveBg: string;
    chipActiveColor: string;
    cardBg: string;
    cardBorder: string;
    priceColor: string;
    stockBg: string;
    stockColor: string;
    popularBg: string;
    buttonBg: string;
    buttonColor: string;
    buttonBorder: string;
  };
}[] = [
  {
    id: 'minimal_boutique',
    label: 'Minimal Boutique',
    description: 'Bright and simple with soft neutrals',
    preview: {
      appBg: '#f4f4f4',
      headerBg: '#ffffff',
      headerColor: '#222222',
      panelBg: '#ffffff',
      panelBorder: '#e7e7e7',
      searchBg: '#f6f6f6',
      searchColor: '#4a4a4a',
      chipBg: '#ffffff',
      chipColor: '#555555',
      chipBorder: '#dedede',
      chipActiveBg: '#222222',
      chipActiveColor: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#e6e6e6',
      priceColor: '#222222',
      stockBg: '#e7f6e5',
      stockColor: '#2f6c3e',
      popularBg: '#f2994a',
      buttonBg: '#f9f9f9',
      buttonColor: '#2e2e2e',
      buttonBorder: '#dcdcdc',
    },
  },
  {
    id: 'neo_streetwear',
    label: 'Neo Streetwear',
    description: 'Dark and bold with neon highlights',
    preview: {
      appBg: '#1e1f22',
      headerBg: 'linear-gradient(180deg, #151734 0%, #191b3b 100%)',
      headerColor: '#ffffff',
      panelBg: '#1e1f22',
      panelBorder: '#2f2f2f',
      searchBg: '#2a2b2f',
      searchColor: '#dddddd',
      chipBg: 'transparent',
      chipColor: '#d8d8d8',
      chipBorder: '#535353',
      chipActiveBg: '#1a1d4b',
      chipActiveColor: '#ffffff',
      cardBg: '#2b2c2f',
      cardBorder: '#494949',
      priceColor: '#ffffff',
      stockBg: '#d9eed0',
      stockColor: '#436132',
      popularBg: '#ef5948',
      buttonBg: 'transparent',
      buttonColor: '#e8e8e8',
      buttonBorder: '#555555',
    },
  },
  {
    id: 'warm_market',
    label: 'Warm Market',
    description: 'Friendly orange accents and cozy cards',
    preview: {
      appBg: '#f7f3ee',
      headerBg: '#f18a3b',
      headerColor: '#ffffff',
      panelBg: '#ffffff',
      panelBorder: '#eedfd2',
      searchBg: '#ffffff',
      searchColor: '#5a4d43',
      chipBg: '#ffffff',
      chipColor: '#8d6a51',
      chipBorder: '#ead4c2',
      chipActiveBg: '#f18a3b',
      chipActiveColor: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#f0e1d2',
      priceColor: '#cb6a21',
      stockBg: '#fdebdc',
      stockColor: '#a95f2b',
      popularBg: '#ee7e30',
      buttonBg: '#fff6ef',
      buttonColor: '#9b5f34',
      buttonBorder: '#efcdae',
    },
  },
  {
    id: 'clean_saas',
    label: 'Clean SaaS',
    description: 'Professional and crisp product-first layout',
    preview: {
      appBg: '#eef2f7',
      headerBg: '#ffffff',
      headerColor: '#203047',
      panelBg: '#f8fafc',
      panelBorder: '#dbe7f2',
      searchBg: '#ffffff',
      searchColor: '#324a63',
      chipBg: '#ffffff',
      chipColor: '#4672a0',
      chipBorder: '#b7cde2',
      chipActiveBg: '#1e6bd6',
      chipActiveColor: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#bfd2e4',
      priceColor: '#1f3350',
      stockBg: '#e7f4ea',
      stockColor: '#2b7446',
      popularBg: '#4a9cec',
      buttonBg: '#1f6fdd',
      buttonColor: '#ffffff',
      buttonBorder: '#1f6fdd',
    },
  },
];

const getTemplatePreview = (templateId?: StoreTemplateId) =>
  STORE_TEMPLATES.find((template) => template.id === templateId)?.preview ||
  STORE_TEMPLATES.find((template) => template.id === DEFAULT_TEMPLATE)!.preview;

export default function Editor() {
  const [store, setStore] = useState<any>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [editorView, setEditorView] = useState<'store' | 'backend'>('store');
  const [backendTab, setBackendTab] = useState<'orders' | 'workers'>('orders');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [useDefaultWorkerPayment, setUseDefaultWorkerPayment] = useState(false);
  const [defaultWorkerPaymentType, setDefaultWorkerPaymentType] = useState<WorkerPaymentType>('cut_per_sale');
  const [defaultCutPercent, setDefaultCutPercent] = useState(10);
  const [defaultPayDate, setDefaultPayDate] = useState('');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(20);
  const [defaultFixedMonthlyAmount, setDefaultFixedMonthlyAmount] = useState(1500);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPaymentType, setNewWorkerPaymentType] = useState<WorkerPaymentType>('cut_per_sale');
  const [newWorkerCutPercent, setNewWorkerCutPercent] = useState(10);
  const [newWorkerPayDate, setNewWorkerPayDate] = useState('');
  const [newWorkerHourlyRate, setNewWorkerHourlyRate] = useState(20);
  const [newWorkerFixedMonthlyAmount, setNewWorkerFixedMonthlyAmount] = useState(1500);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState('');
  const [backendOrders, setBackendOrders] = useState<DashboardOrder[]>([]);
  const [backendOrdersLoading, setBackendOrdersLoading] = useState(false);
  const [backendUpdatingOrderId, setBackendUpdatingOrderId] = useState<number | null>(null);
  const [openEditorPanel, setOpenEditorPanel] = useState<'products' | null>('products');
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    price: 0,
    stock: 0,
    image_url: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const AUTOSAVE_MS = 5 * 60 * 1000;

  const createSectionId = () => `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const normalizeConfigWithProducts = (rawConfig: StoreConfig, products: Product[]): StoreConfig => {
    const productsWithIds = products.filter((product): product is Product & { id: number } => product.id !== undefined);
    const productIds = productsWithIds.map((product) => product.id);
    const existingSections = rawConfig.sections || [];

    let sections: ProductSection[];

    if (existingSections.length === 0) {
      sections = [
        {
          id: createSectionId(),
          name: 'All Products',
          productIds,
        },
      ];
    } else {
      const validIdSet = new Set(productIds);
      sections = existingSections.map((section) => ({
        ...section,
        productIds: (section.productIds || []).filter((id) => validIdSet.has(id)),
      }));

      const usedIds = new Set(sections.flatMap((section) => section.productIds));
      const unassignedIds = productIds.filter((id) => !usedIds.has(id));

      if (unassignedIds.length > 0) {
        sections[0].productIds = [...sections[0].productIds, ...unassignedIds];
      }
    }

    return {
      ...rawConfig,
      template: rawConfig.template || DEFAULT_TEMPLATE,
      products,
      sections,
      workers: rawConfig.workers || [],
    };
  };

  const getProductsBySection = () => {
    if (!config?.sections || !config.products) return [];
    const byId = new Map(config.products.filter((p): p is Product & { id: number } => p.id !== undefined).map((product) => [product.id, product]));
    return config.sections.map((section) => ({
      ...section,
      products: section.productIds.map((id) => byId.get(id)).filter(Boolean) as Product[],
    }));
  };

  const updateConfig = (updater: (prev: StoreConfig) => StoreConfig) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  };

  useEffect(() => {
    const loadStore = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/seller-login');
        return;
      }

      try {
        const res = await fetch('/api/stores', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/auth/seller-login');
          return;
        }

        const data = await res.json();
        setStore(data);
        // data.config is already a JS object from PostgreSQL JSONB
        const parsedConfig = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;
        const config = {
          ...parsedConfig,
          template: parsedConfig.template || DEFAULT_TEMPLATE,
        };
        
        // Fetch products from database to keep in sync
        const productsRes = await fetch('/api/seller/products', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const normalizedConfig = normalizeConfigWithProducts(config, productsData.products);
          setConfig(normalizedConfig);
          setSelectedSectionId(normalizedConfig.sections?.[0]?.id || '');
          setExpandedSections(
            (normalizedConfig.sections || []).reduce((acc, section) => {
              acc[section.id] = true;
              return acc;
            }, {} as Record<string, boolean>)
          );
        } else {
          setConfig(config);
        }
        setIsPublished(data.is_published);
      } catch (error) {
        console.error('Error loading store:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [router]);

  useEffect(() => {
    if (!config) return;
    const timer = setInterval(async () => {
      if (isDirty) {
        await saveConfig('autosave');
      }
    }, AUTOSAVE_MS);

    return () => clearInterval(timer);
  }, [config, isDirty]);

  useEffect(() => {
    if (editorView === 'backend' && backendTab === 'orders') {
      loadBackendOrders();
    }
  }, [editorView, backendTab]);

  const saveConfig = async (mode: 'manual' | 'autosave' = 'manual') => {
    if (!config || !store) return;

    setSaving(true);
    setSaveMessage(mode === 'autosave' ? 'Autosaving...' : 'Saving...');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config }),
      });

      if (res.ok) {
        const now = new Date().toLocaleTimeString();
        setLastSavedAt(now);
        setIsDirty(false);
        setSaveMessage(mode === 'autosave' ? `Autosaved at ${now}` : `Saved at ${now}`);
      } else {
        setSaveMessage('Save failed');
      }
    } catch (error) {
      setSaveMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const publishStore = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (res.ok) {
        setIsPublished(true);
        const seller = JSON.parse(localStorage.getItem('seller') || '{}');
        alert(
          `Your store is live! Visit: https://easyvendor.com/stores/${seller.subdomain}`
        );
      }
    } catch (error) {
      alert('Error publishing store');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.stock < 0) {
      alert('Please fill in all product fields correctly');
      return;
    }

    if (!selectedSectionId) {
      alert('Please select a section for this product');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const product = await res.json();
        if (config && product.id) {
          setConfig({
            ...config,
            products: [...(config.products || []), product],
            sections: (config.sections || []).map((section) =>
              section.id === selectedSectionId
                ? { ...section, productIds: [...section.productIds, product.id] }
                : section
            ),
          });
          setIsDirty(true);
        }
        setNewProduct({ name: '', price: 0, stock: 0, image_url: '' });
        setShowProductForm(false);
        alert('Product added!');
      } else {
        alert('Error adding product');
      }
    } catch (error) {
      alert('Error adding product');
    }
  };

  const removeProduct = async (productId?: number) => {
    const product = config?.products.find((p) => p.id === productId);
    if (!product || !config) return;

    if (!product.id) {
      alert('Error: Product ID not found. Try refreshing the page.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // Delete from database
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove from local state
        setConfig({
          ...config,
          products: config.products.filter((p) => p.id !== productId),
          sections: (config.sections || []).map((section) => ({
            ...section,
            productIds: section.productIds.filter((id) => id !== productId),
          })),
        });
        setIsDirty(true);
        alert('Product archived! It will be removed from your store but kept in order history.');
      } else {
        const error = await res.json();
        alert(`Error deleting product: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting product');
    }
  };

  const refreshProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const productsRes = await fetch('/api/seller/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (config) {
          setConfig(normalizeConfigWithProducts(config, productsData.products));
          setIsDirty(false);
        }
        alert('Products refreshed!');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Error refreshing products');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setEditingProductId(product.id || null);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditingProductId(null);
  };

  const saveEdit = async () => {
    if (!editingProduct || editingProductId === null) return;

    if (!editingProduct.name || editingProduct.price <= 0 || editingProduct.stock < 0) {
      alert('Please fill in all product fields correctly');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        if (config) {
          const updatedProducts = [...config.products];
          const idx = updatedProducts.findIndex((p) => p.id === editingProductId);
          if (idx !== -1) {
            updatedProducts[idx] = updatedProduct;
          }
          setConfig({
            ...config,
            products: updatedProducts,
          });
        }
        setEditingProduct(null);
        setEditingProductId(null);
        alert('Product updated!');
      } else {
        alert('Error updating product');
      }
    } catch (error) {
      alert('Error updating product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('seller');
    router.push('/');
  };

  const loadBackendOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBackendOrdersLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      setBackendOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading backend orders:', error);
    } finally {
      setBackendOrdersLoading(false);
    }
  };

  const updateBackendOrderStatus = async (
    orderId: number,
    order_status: 'accepted' | 'rejected' | 'completed'
  ) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBackendUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status }),
      });

      if (!res.ok) return;
      await loadBackendOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setBackendUpdatingOrderId(null);
    }
  };

  const addSection = () => {
    if (!config) return;
    const trimmedName = newSectionName.trim();
    if (!trimmedName) {
      alert('Section name is required');
      return;
    }

    const sectionId = createSectionId();
    updateConfig((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), { id: sectionId, name: trimmedName, productIds: [] }],
    }));
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
    setSelectedSectionId(sectionId);
    setNewSectionName('');
    setShowSectionForm(false);
  };

  const renameSection = (sectionId: string) => {
    if (!config) return;
    const section = (config.sections || []).find((item) => item.id === sectionId);
    if (!section) return;
    const nextName = prompt('Rename section', section.name)?.trim();
    if (!nextName) return;

    updateConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((item) =>
        item.id === sectionId ? { ...item, name: nextName } : item
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    if (!config || !(config.sections || []).length) return;
    if ((config.sections || []).length === 1) {
      alert('At least one section is required');
      return;
    }

    const section = (config.sections || []).find((item) => item.id === sectionId);
    if (!section) return;
    const fallbackSection = (config.sections || []).find((item) => item.id !== sectionId);
    if (!fallbackSection) return;

    updateConfig((prev) => ({
      ...prev,
      sections: (prev.sections || [])
        .filter((item) => item.id !== sectionId)
        .map((item) =>
          item.id === fallbackSection.id
            ? { ...item, productIds: [...item.productIds, ...section.productIds] }
            : item
        ),
    }));

    setSelectedSectionId((current) => (current === sectionId ? fallbackSection.id : current));
  };

  const moveProductToSection = (productId: number, toSectionId: string) => {
    if (!config) return;
    updateConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section) => {
        const withoutProduct = section.productIds.filter((id) => id !== productId);
        return section.id === toSectionId
          ? { ...section, productIds: [...withoutProduct, productId] }
          : { ...section, productIds: withoutProduct };
      }),
    }));
  };

  const getWorkerPaymentLabel = (worker: Worker) => {
    if (worker.paymentType === 'cut_per_sale') return `Cut per sale: ${worker.cutPercent || 0}%`;
    if (worker.paymentType === 'pay_per_date') return `Pay per date: ${worker.payDate || 'not set'}`;
    if (worker.paymentType === 'hourly') return `Hourly: $${worker.hourlyRate || 0}/hr`;
    return `Fixed monthly: $${worker.fixedMonthlyAmount || 0}`;
  };

  const addWorker = () => {
    if (!config) return;
    const name = newWorkerName.trim();
    if (!name) {
      alert('Worker name is required');
      return;
    }

    const paymentType = useDefaultWorkerPayment ? defaultWorkerPaymentType : newWorkerPaymentType;
    const worker: Worker = {
      id: `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      paymentType,
    };

    if (paymentType === 'cut_per_sale') {
      worker.cutPercent = useDefaultWorkerPayment ? defaultCutPercent : newWorkerCutPercent;
    }
    if (paymentType === 'pay_per_date') {
      worker.payDate = useDefaultWorkerPayment ? defaultPayDate : newWorkerPayDate;
    }
    if (paymentType === 'hourly') {
      worker.hourlyRate = useDefaultWorkerPayment ? defaultHourlyRate : newWorkerHourlyRate;
    }
    if (paymentType === 'fixed_monthly') {
      worker.fixedMonthlyAmount = useDefaultWorkerPayment
        ? defaultFixedMonthlyAmount
        : newWorkerFixedMonthlyAmount;
    }

    updateConfig((prev) => ({
      ...prev,
      workers: [...(prev.workers || []), worker],
    }));
    setSelectedWorkerId(worker.id);
    setShowWorkerForm(false);
    setNewWorkerName('');
  };

  const startEditWorker = (worker: Worker) => {
    setEditingWorker({ ...worker });
  };

  const cancelEditWorker = () => {
    setEditingWorker(null);
  };

  const saveWorkerEdit = () => {
    if (!editingWorker || !editingWorker.name.trim()) {
      alert('Worker name is required');
      return;
    }

    updateConfig((prev) => ({
      ...prev,
      workers: (prev.workers || []).map((worker) =>
        worker.id === editingWorker.id ? editingWorker : worker
      ),
    }));
    setEditingWorker(null);
  };

  const deleteWorker = (workerId: string) => {
    updateConfig((prev) => ({
      ...prev,
      workers: (prev.workers || []).filter((worker) => worker.id !== workerId),
    }));

    if (selectedWorkerId === workerId) {
      const remaining = (config?.workers || []).filter((worker) => worker.id !== workerId);
      setSelectedWorkerId(remaining[0]?.id || null);
      setEditingWorker(null);
    }
  };

  const selectedWorker =
    (config?.workers || []).find((worker) => worker.id === selectedWorkerId) || null;

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!config) {
    return <div>Error loading store</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Store Editor</h1>
          {isPublished && <span className={styles.badge}>Published</span>}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => saveConfig('manual')}
            disabled={saving}
            className={`${styles.saveBtn} ${isDirty ? styles.saveBtnDirty : ''}`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {!isPublished && (
            <button onClick={publishStore} className={styles.publishBtn}>
              Publish Store
            </button>
          )}
          <button
            onClick={() => setEditorView('backend')}
            className={`${styles.ordersBtn} ${editorView === 'backend' ? styles.activeTopBtn : ''}`}
          >
            Backend
          </button>
          <button
            onClick={() => setEditorView('store')}
            className={`${styles.ordersBtn} ${editorView === 'store' ? styles.activeTopBtn : ''}`}
          >
            Store
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>
      <div className={styles.saveStatus}>
        {saveMessage || (lastSavedAt ? `Last saved at ${lastSavedAt}` : 'No saves yet')}
      </div>

      {editorView === 'store' ? (
      <div className={styles.content}>
        <div className={styles.editorPanel}>
          <h2>Editor</h2>

          <button
            className={styles.accordionBtn}
            onClick={() => setOpenEditorPanel(openEditorPanel === 'products' ? null : 'products')}
          >
            {openEditorPanel === 'products' ? '▼' : '▶'} Products & Sections
          </button>

          <div className={styles.formGroup}>
            <label>Store Template</label>
            <select
              value={config.template || DEFAULT_TEMPLATE}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  template: e.target.value as StoreTemplateId,
                }))
              }
            >
              {STORE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            <small style={{ color: '#666' }}>
              {STORE_TEMPLATES.find((template) => template.id === (config.template || DEFAULT_TEMPLATE))
                ?.description || 'Preset storefront look'}
            </small>
          </div>

          {openEditorPanel === 'products' && (
          <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              className={styles.addProductBtn}
              onClick={() => setShowSectionForm(!showSectionForm)}
              style={{ width: '100%' }}
            >
              + Add Section
            </button>
          </div>

          {showSectionForm && (
            <div className={styles.productForm}>
              <h3>Add New Section</h3>
              <input
                type="text"
                placeholder="Section name (e.g. Drinks)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
              <div className={styles.productFormButtons}>
                <button onClick={addSection} className={styles.confirmBtn}>
                  Add Section
                </button>
                <button onClick={() => setShowSectionForm(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <h2 style={{ marginTop: '24px' }}>Products</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              className={styles.addProductBtn}
              onClick={() => setShowProductForm(!showProductForm)}
              style={{ flex: 1 }}
            >
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <div className={styles.productForm}>
              <h3>Add New Product</h3>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                {(config.sections || []).map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price ($)"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock || ''}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
              />
              <div className={styles.productFormButtons}>
                <button onClick={addProduct} className={styles.confirmBtn}>
                  Add Product
                </button>
                <button onClick={() => setShowProductForm(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editingProduct && editingProductId !== null && (
            <div className={styles.productForm}>
              <h3>Edit Product</h3>
              <input
                type="text"
                placeholder="Product Name"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={editingProduct.price || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={editingProduct.stock || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={editingProduct.image_url}
                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
              />
              <div className={styles.productFormButtons}>
                <button onClick={saveEdit} className={styles.confirmBtn}>
                  Save Changes
                </button>
                <button onClick={cancelEdit} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className={styles.productsList}>
            {getProductsBySection().length > 0 ? (
              getProductsBySection().map((section) => (
                <div key={section.id} className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <button
                      className={styles.sectionToggle}
                      onClick={() =>
                        setExpandedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                      }
                    >
                      {expandedSections[section.id] ? '▼' : '▶'} {section.name}
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => renameSection(section.id)} className={styles.editBtn}>Rename</button>
                      <button onClick={() => deleteSection(section.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>

                  {expandedSections[section.id] && (
                    <>
                      {section.products.length > 0 ? (
                        section.products.map((product) => (
                          <div key={product.id} className={styles.productItem}>
                            <div>
                              <strong>{product.name}</strong>
                              <p>${Number(product.price).toFixed(2)} · {product.stock} in stock</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select
                                className={styles.moveSelect}
                                value={section.id}
                                onChange={(e) => product.id && moveProductToSection(product.id, e.target.value)}
                              >
                                {(config.sections || []).map((optionSection) => (
                                  <option key={optionSection.id} value={optionSection.id}>
                                    {optionSection.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => startEdit(product)}
                                className={styles.editBtn}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeProduct(product.id)}
                                className={styles.deleteBtn}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#999', fontSize: '14px' }}>No products in this section.</p>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#999', fontSize: '14px' }}>No sections yet. Add one above!</p>
            )}
          </div>
          </>
          )}

        </div>

        <div className={styles.previewPanel}>
          <h2>Preview</h2>
          <div
            className={styles.sitePreview}
            style={{
              background: getTemplatePreview(config.template).appBg,
              borderColor: getTemplatePreview(config.template).panelBorder,
            }}
          >
            <div
              className={styles.sitePreviewHeader}
              style={{
                background: getTemplatePreview(config.template).headerBg,
              }}
            >
              <div className={styles.sitePreviewBrand}>
                <div
                  className={styles.sitePreviewLogo}
                  style={{
                    background: getTemplatePreview(config.template).chipActiveBg,
                    color: getTemplatePreview(config.template).chipActiveColor,
                  }}
                >
                  S
                </div>
                <h1 style={{ color: getTemplatePreview(config.template).headerColor }}>
                  {config.title || 'My Store'}
                </h1>
              </div>
              <button
                className={styles.sitePreviewCartBtn}
                style={{
                  borderColor: getTemplatePreview(config.template).chipBorder,
                  color: getTemplatePreview(config.template).headerColor,
                }}
              >
                Cart <span style={{ background: getTemplatePreview(config.template).popularBg }}>0</span>
              </button>
            </div>
            <div className={styles.sitePreviewContent}>
              <input
                className={styles.sitePreviewSearch}
                placeholder="Search products..."
                readOnly
                style={{
                  background: getTemplatePreview(config.template).searchBg,
                  color: getTemplatePreview(config.template).searchColor,
                  borderColor: getTemplatePreview(config.template).chipBorder,
                }}
              />
              <div className={styles.sitePreviewChips}>
                <span
                  className={`${styles.sitePreviewChip} ${styles.sitePreviewChipActive}`}
                  style={{
                    background: getTemplatePreview(config.template).chipActiveBg,
                    borderColor: getTemplatePreview(config.template).chipActiveBg,
                    color: getTemplatePreview(config.template).chipActiveColor,
                  }}
                >
                  All products
                </span>
                {(config.sections || []).map((section) => (
                  <span
                    key={section.id}
                    className={styles.sitePreviewChip}
                    style={{
                      background: getTemplatePreview(config.template).chipBg,
                      borderColor: getTemplatePreview(config.template).chipBorder,
                      color: getTemplatePreview(config.template).chipColor,
                    }}
                  >
                    {section.name}
                  </span>
                ))}
              </div>
              {getProductsBySection().some((section) => section.products.length > 0) ? (
                getProductsBySection().map((section) => (
                  <div key={section.id} className={styles.sitePreviewSection}>
                    <h3 style={{ color: getTemplatePreview(config.template).chipColor }}>
                      {section.name.toUpperCase()}
                    </h3>
                    <div className={styles.sitePreviewGrid}>
                      {section.products.slice(0, 4).map((product, index) => (
                        <div
                          key={product.id}
                          className={styles.sitePreviewCard}
                          style={{
                            background: getTemplatePreview(config.template).cardBg,
                            borderColor: getTemplatePreview(config.template).cardBorder,
                          }}
                        >
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} />
                          )}
                          <div className={styles.sitePreviewCardBody}>
                            {index < 3 && (
                              <span
                                className={styles.sitePreviewPopular}
                                style={{ background: getTemplatePreview(config.template).popularBg }}
                              >
                                Popular
                              </span>
                            )}
                            <h4 style={{ color: getTemplatePreview(config.template).chipColor }}>{product.name}</h4>
                            <p
                              className={styles.sitePreviewPrice}
                              style={{ color: getTemplatePreview(config.template).priceColor }}
                            >
                              ${Number(product.price).toFixed(2)}
                            </p>
                            <p
                              className={styles.sitePreviewStock}
                              style={{
                                background: getTemplatePreview(config.template).stockBg,
                                color: getTemplatePreview(config.template).stockColor,
                              }}
                            >
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </p>
                            <button
                              className={styles.sitePreviewAddBtn}
                              disabled={product.stock === 0}
                              style={{
                                background: getTemplatePreview(config.template).buttonBg,
                                color: getTemplatePreview(config.template).buttonColor,
                                borderColor: getTemplatePreview(config.template).buttonBorder,
                              }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.sitePreviewEmpty}>Products will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className={styles.workersLayout}>
          <div className={styles.backendTabs}>
            <button
              className={`${styles.ordersBtn} ${backendTab === 'orders' ? styles.activeTopBtn : ''}`}
              onClick={() => setBackendTab('orders')}
            >
              Orders
            </button>
            <button
              className={`${styles.ordersBtn} ${backendTab === 'workers' ? styles.activeTopBtn : ''}`}
              onClick={() => setBackendTab('workers')}
            >
              Workers
            </button>
          </div>
          {backendTab === 'orders' ? (
            <div className={styles.backendOrdersCard}>
              <h2>Orders</h2>
              {backendOrdersLoading ? (
                <p>Loading orders...</p>
              ) : backendOrders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div className={styles.backendOrdersList}>
                  {backendOrders.map((order) => (
                    <div key={order.id} className={styles.backendOrderCard}>
                      <div className={styles.backendOrderHeader}>
                        <h3>
                          Order #{order.id} - {order.buyer_first_name} {order.buyer_last_name}
                        </h3>
                        <span className={`${styles.backendStatusBadge} ${styles[`backendStatus_${order.order_status}`] || ''}`}>
                          {order.order_status}
                        </span>
                      </div>
                      {order.previous_completed_orders > 0 && (
                        <p className={styles.backendOrderDate}>
                          Returning customer - {order.previous_completed_orders} other completed order
                          {order.previous_completed_orders === 1 ? '' : 's'}
                        </p>
                      )}
                      <p className={styles.backendOrderDate}>
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <div className={styles.backendOrderItems}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className={styles.backendOrderItem}>
                            <span>{item.product_name || 'Product'}</span>
                            <span>Qty {item.quantity}</span>
                            <span>${Number(item.price_at_purchase).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.backendOrderFooter}>
                        <strong>${Number(order.total_price).toFixed(2)}</strong>
                        <div className={styles.backendOrderActions}>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => updateBackendOrderStatus(order.id, 'rejected')}
                            disabled={
                              backendUpdatingOrderId === order.id ||
                              order.order_status === 'rejected' ||
                              order.order_status === 'completed'
                            }
                          >
                            Reject
                          </button>
                          <button
                            className={styles.editBtn}
                            onClick={() => updateBackendOrderStatus(order.id, 'accepted')}
                            disabled={
                              backendUpdatingOrderId === order.id ||
                              order.order_status === 'accepted' ||
                              order.order_status === 'completed' ||
                              order.order_status === 'rejected'
                            }
                          >
                            Accept
                          </button>
                          <button
                            className={styles.confirmBtn}
                            onClick={() => updateBackendOrderStatus(order.id, 'completed')}
                            disabled={
                              backendUpdatingOrderId === order.id ||
                              order.order_status !== 'accepted'
                            }
                          >
                            Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <>
          <div className={styles.workersSidebar}>
            <h2>Workers</h2>
            <button className={styles.addProductBtn} onClick={() => setShowWorkerForm(!showWorkerForm)}>
              + Add Worker
            </button>

            <div className={styles.workerDefaultBox}>
              <label>
                <input
                  type="checkbox"
                  checked={useDefaultWorkerPayment}
                  onChange={(e) => setUseDefaultWorkerPayment(e.target.checked)}
                />
                Use default payment for every new worker
              </label>
              <select
                value={defaultWorkerPaymentType}
                onChange={(e) => setDefaultWorkerPaymentType(e.target.value as WorkerPaymentType)}
                disabled={!useDefaultWorkerPayment}
              >
                <option value="cut_per_sale">Cut from every sale</option>
                <option value="pay_per_date">Pay per date</option>
                <option value="hourly">Hourly</option>
                <option value="fixed_monthly">Fixed monthly</option>
              </select>
              {useDefaultWorkerPayment && defaultWorkerPaymentType === 'cut_per_sale' && (
                <input
                  type="number"
                  placeholder="Default cut percent"
                  value={defaultCutPercent}
                  onChange={(e) => setDefaultCutPercent(Number(e.target.value) || 0)}
                />
              )}
              {useDefaultWorkerPayment && defaultWorkerPaymentType === 'pay_per_date' && (
                <input
                  type="date"
                  value={defaultPayDate}
                  onChange={(e) => setDefaultPayDate(e.target.value)}
                />
              )}
              {useDefaultWorkerPayment && defaultWorkerPaymentType === 'hourly' && (
                <input
                  type="number"
                  placeholder="Default hourly rate"
                  value={defaultHourlyRate}
                  onChange={(e) => setDefaultHourlyRate(Number(e.target.value) || 0)}
                />
              )}
              {useDefaultWorkerPayment && defaultWorkerPaymentType === 'fixed_monthly' && (
                <input
                  type="number"
                  placeholder="Default monthly amount"
                  value={defaultFixedMonthlyAmount}
                  onChange={(e) => setDefaultFixedMonthlyAmount(Number(e.target.value) || 0)}
                />
              )}
            </div>

            {showWorkerForm && (
              <div className={styles.productForm}>
                <h3>Add Worker</h3>
                <input
                  type="text"
                  placeholder="Worker name"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                />
                {!useDefaultWorkerPayment && (
                  <>
                    <select
                      value={newWorkerPaymentType}
                      onChange={(e) => setNewWorkerPaymentType(e.target.value as WorkerPaymentType)}
                    >
                      <option value="cut_per_sale">Cut from every sale</option>
                      <option value="pay_per_date">Pay per date</option>
                      <option value="hourly">Hourly</option>
                      <option value="fixed_monthly">Fixed monthly</option>
                    </select>
                    {newWorkerPaymentType === 'cut_per_sale' && (
                      <input
                        type="number"
                        placeholder="Cut percent"
                        value={newWorkerCutPercent}
                        onChange={(e) => setNewWorkerCutPercent(Number(e.target.value) || 0)}
                      />
                    )}
                    {newWorkerPaymentType === 'pay_per_date' && (
                      <input
                        type="date"
                        value={newWorkerPayDate}
                        onChange={(e) => setNewWorkerPayDate(e.target.value)}
                      />
                    )}
                    {newWorkerPaymentType === 'hourly' && (
                      <input
                        type="number"
                        placeholder="Hourly rate"
                        value={newWorkerHourlyRate}
                        onChange={(e) => setNewWorkerHourlyRate(Number(e.target.value) || 0)}
                      />
                    )}
                    {newWorkerPaymentType === 'fixed_monthly' && (
                      <input
                        type="number"
                        placeholder="Monthly amount"
                        value={newWorkerFixedMonthlyAmount}
                        onChange={(e) => setNewWorkerFixedMonthlyAmount(Number(e.target.value) || 0)}
                      />
                    )}
                  </>
                )}
                <div className={styles.productFormButtons}>
                  <button onClick={addWorker} className={styles.confirmBtn}>Add Worker</button>
                  <button onClick={() => setShowWorkerForm(false)} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.workerList}>
              {(config.workers || []).map((worker) => (
                <div key={worker.id} className={`${styles.workerListItem} ${selectedWorkerId === worker.id ? styles.workerListItemActive : ''}`}>
                  <button
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={styles.workerListMainBtn}
                  >
                    <strong>{worker.name}</strong>
                    <span>{getWorkerPaymentLabel(worker)}</span>
                  </button>
                  <div className={styles.workerItemActions}>
                    <button onClick={() => startEditWorker(worker)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => deleteWorker(worker.id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.workersContent}>
            {editingWorker ? (
              <div className={styles.workerDetail}>
                <h1>Edit Worker</h1>
                <div className={styles.workerEditForm}>
                  <input
                    type="text"
                    placeholder="Worker name"
                    value={editingWorker.name}
                    onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  />
                  <select
                    value={editingWorker.paymentType}
                    onChange={(e) =>
                      setEditingWorker({
                        ...editingWorker,
                        paymentType: e.target.value as WorkerPaymentType,
                      })
                    }
                  >
                    <option value="cut_per_sale">Cut from every sale</option>
                    <option value="pay_per_date">Pay per date</option>
                    <option value="hourly">Hourly</option>
                    <option value="fixed_monthly">Fixed monthly</option>
                  </select>
                  {editingWorker.paymentType === 'cut_per_sale' && (
                    <input
                      type="number"
                      placeholder="Cut percent"
                      value={editingWorker.cutPercent || 0}
                      onChange={(e) =>
                        setEditingWorker({
                          ...editingWorker,
                          cutPercent: Number(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                  {editingWorker.paymentType === 'pay_per_date' && (
                    <input
                      type="date"
                      value={editingWorker.payDate || ''}
                      onChange={(e) =>
                        setEditingWorker({
                          ...editingWorker,
                          payDate: e.target.value,
                        })
                      }
                    />
                  )}
                  {editingWorker.paymentType === 'hourly' && (
                    <input
                      type="number"
                      placeholder="Hourly rate"
                      value={editingWorker.hourlyRate || 0}
                      onChange={(e) =>
                        setEditingWorker({
                          ...editingWorker,
                          hourlyRate: Number(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                  {editingWorker.paymentType === 'fixed_monthly' && (
                    <input
                      type="number"
                      placeholder="Monthly amount"
                      value={editingWorker.fixedMonthlyAmount || 0}
                      onChange={(e) =>
                        setEditingWorker({
                          ...editingWorker,
                          fixedMonthlyAmount: Number(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                  <div className={styles.productFormButtons}>
                    <button onClick={saveWorkerEdit} className={styles.confirmBtn}>Save Worker</button>
                    <button onClick={cancelEditWorker} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : selectedWorker ? (
              <div className={styles.workerDetail}>
                <h1>{selectedWorker.name}</h1>
              </div>
            ) : (
              <div className={styles.workerDetailPlaceholder}>
                Select a worker to open their page
              </div>
            )}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
