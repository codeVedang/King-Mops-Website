import { db, isFirebaseEnabled } from './firebaseAdmin.js';
import { demoOrders, demoProducts, demoUsers } from '../data/demoData.js';
import {
  defaultCheckoutSettings,
  formatOrderAmounts,
  normalizeCheckoutSettings,
  toPaise
} from './pricing.js';
import { env } from '../config/env.js';

const nowIso = () => new Date().toISOString();
const demoSettings = {
  checkout: normalizeCheckoutSettings(defaultCheckoutSettings)
};

const timestampToIso = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return value;
};

const withIsoDates = (data) => ({
  ...data,
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
  orderDate: timestampToIso(data.orderDate)
});

const publicProduct = (product) => ({
  ...withIsoDates(product),
  price: Number(product.pricePaise || product.price || 0) / 100,
  mrp: Number(product.mrpPaise || product.mrp || 0) / 100
});

const normalizeProductPayload = (payload) => ({
  name: payload.name?.trim(),
  category: payload.category,
  description: payload.description?.trim(),
  pricePaise:
    payload.pricePaise !== undefined ? Number(payload.pricePaise) : toPaise(payload.price),
  mrpPaise: payload.mrpPaise !== undefined ? Number(payload.mrpPaise) : toPaise(payload.mrp),
  stock: Number(payload.stock || 0),
  images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
  specs: Array.isArray(payload.specs)
    ? payload.specs.filter(Boolean)
    : String(payload.specs || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
  isActive: payload.isActive !== false,
  isFeatured: Boolean(payload.isFeatured),
  updatedAt: new Date()
});

const sortProducts = (products, sort = 'newest') => {
  const copy = [...products];
  if (sort === 'price-low') {
    return copy.sort((a, b) => Number(a.pricePaise) - Number(b.pricePaise));
  }
  if (sort === 'price-high') {
    return copy.sort((a, b) => Number(b.pricePaise) - Number(a.pricePaise));
  }
  return copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const filterProducts = (products, { category, search, includeInactive = false, featured } = {}) => {
  const normalizedSearch = search?.trim().toLowerCase();
  return products.filter((product) => {
    if (!includeInactive && product.isActive === false) return false;
    if (featured && !product.isFeatured) return false;
    if (category && category !== 'All' && product.category !== category) return false;
    if (normalizedSearch && !product.name.toLowerCase().includes(normalizedSearch)) return false;
    return true;
  });
};

export const listProducts = async ({
  category,
  search,
  sort,
  page = 1,
  pageSize = 12,
  includeInactive = false,
  featured = false
} = {}) => {
  let products;

  if (isFirebaseEnabled) {
    const snapshot = await db.collection('products').get();
    products = snapshot.docs.map((doc) => publicProduct({ id: doc.id, ...doc.data() }));
  } else {
    products = demoProducts.map(publicProduct);
  }

  const filtered = sortProducts(
    filterProducts(products, { category, search, includeInactive, featured }),
    sort
  );
  const safePage = Math.max(1, Number(page));
  const safePageSize = Math.max(1, Number(pageSize));
  const start = (safePage - 1) * safePageSize;

  return {
    products: filtered.slice(start, start + safePageSize),
    total: filtered.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / safePageSize))
  };
};

export const getProduct = async (id, { includeInactive = false } = {}) => {
  if (isFirebaseEnabled) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) return null;
    const product = publicProduct({ id: doc.id, ...doc.data() });
    return includeInactive || product.isActive !== false ? product : null;
  }

  const product = demoProducts.find((item) => item.id === id);
  if (!product || (!includeInactive && product.isActive === false)) return null;
  return publicProduct(product);
};

export const upsertProduct = async (payload) => {
  const normalized = normalizeProductPayload(payload);
  if (!normalized.name || !normalized.category || !normalized.description) {
    const error = new Error('Product name, category, and description are required.');
    error.status = 400;
    throw error;
  }
  if (normalized.pricePaise <= 0 || normalized.mrpPaise <= 0) {
    const error = new Error('MRP and selling price are required.');
    error.status = 400;
    throw error;
  }

  if (isFirebaseEnabled) {
    const ref = payload.id ? db.collection('products').doc(payload.id) : db.collection('products').doc();
    const existing = await ref.get();
    const createdAt = existing.exists ? existing.data().createdAt : new Date();
    await ref.set({ ...normalized, createdAt }, { merge: true });
    const saved = await ref.get();
    return publicProduct({ id: ref.id, ...saved.data() });
  }

  const id = payload.id || normalized.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const index = demoProducts.findIndex((item) => item.id === id);
  const product = {
    id,
    ...normalized,
    createdAt: index >= 0 ? demoProducts[index].createdAt : nowIso(),
    updatedAt: nowIso()
  };
  if (index >= 0) {
    demoProducts[index] = product;
  } else {
    demoProducts.unshift(product);
  }
  return publicProduct(product);
};

export const softDeleteProduct = async (id) => {
  if (isFirebaseEnabled) {
    await db.collection('products').doc(id).set(
      {
        isActive: false,
        updatedAt: new Date()
      },
      { merge: true }
    );
    return getProduct(id, { includeInactive: true });
  }

  const product = demoProducts.find((item) => item.id === id);
  if (!product) return null;
  product.isActive = false;
  product.updatedAt = nowIso();
  return publicProduct(product);
};

export const deleteProduct = async (id) => {
  if (isFirebaseEnabled) {
    const ref = db.collection('products').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const product = publicProduct({ id: doc.id, ...doc.data() });
    await ref.delete();
    return product;
  }

  const index = demoProducts.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const [product] = demoProducts.splice(index, 1);
  return publicProduct(product);
};

export const getCheckoutSettings = async () => {
  if (isFirebaseEnabled) {
    const doc = await db.collection('settings').doc('checkout').get();
    return normalizeCheckoutSettings(doc.exists ? doc.data() : defaultCheckoutSettings);
  }

  return normalizeCheckoutSettings(demoSettings.checkout);
};

export const updateCheckoutSettings = async (payload = {}) => {
  const current = await getCheckoutSettings();
  const deliveryFeePaise =
    payload.deliveryFeePaise !== undefined
      ? payload.deliveryFeePaise
      : payload.deliveryFee !== undefined
        ? toPaise(payload.deliveryFee)
        : current.deliveryFeePaise;
  const settings = normalizeCheckoutSettings({
    gstRatePercent: payload.gstRatePercent ?? current.gstRatePercent,
    deliveryFeePaise
  });
  const record = {
    ...settings,
    updatedAt: new Date()
  };

  if (isFirebaseEnabled) {
    await db.collection('settings').doc('checkout').set(record, { merge: true });
    return getCheckoutSettings();
  }

  demoSettings.checkout = {
    ...settings,
    updatedAt: nowIso()
  };
  return normalizeCheckoutSettings(demoSettings.checkout);
};

export const getUserProfile = async (uid) => {
  if (isFirebaseEnabled) {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? withIsoDates({ uid: doc.id, ...doc.data() }) : null;
  }
  return demoUsers.find((user) => user.uid === uid) || null;
};

export const createOrUpdateUserProfile = async (uid, payload) => {
  const profile = {
    name: payload.name?.trim() || payload.phone?.trim() || 'Customer',
    email: payload.email?.trim() || '',
    phone: payload.phone?.trim() || '',
    phoneVerified: Boolean(payload.phoneVerified),
    role: payload.role === 'admin' ? 'admin' : 'customer',
    admin: payload.role === 'admin',
    appScope: env.appScope,
    updatedAt: new Date()
  };

  if (isFirebaseEnabled) {
    const ref = db.collection('users').doc(uid);
    const existing = await ref.get();
    const existingData = existing.exists ? existing.data() : {};
    await ref.set(
      {
        ...profile,
        addresses: Array.isArray(payload.addresses) ? payload.addresses : existingData.addresses || [],
        createdAt: existing.exists ? existingData.createdAt : new Date()
      },
      { merge: true }
    );
    return getUserProfile(uid);
  }

  const index = demoUsers.findIndex((user) => user.uid === uid);
  const demoProfile = {
    uid,
    ...profile,
    addresses: Array.isArray(payload.addresses) ? payload.addresses : demoUsers[index]?.addresses || [],
    createdAt: index >= 0 ? demoUsers[index].createdAt : nowIso(),
    updatedAt: nowIso()
  };
  if (index >= 0) demoUsers[index] = { ...demoUsers[index], ...demoProfile };
  else demoUsers.push(demoProfile);
  return demoProfile;
};

export const saveUserAddress = async (uid, address) => {
  const profile = (await getUserProfile(uid)) || { uid, addresses: [] };
  const addresses = Array.isArray(profile.addresses) ? profile.addresses : [];
  const normalized = {
    id: address.id || `addr_${Date.now()}`,
    fullName: address.fullName?.trim(),
    phone: address.phone?.trim(),
    flat: address.flat?.trim(),
    street: address.street?.trim(),
    area: address.area?.trim(),
    city: address.city?.trim(),
    state: address.state?.trim(),
    pinCode: address.pinCode?.trim()
  };
  const updatedAddresses = [normalized, ...addresses.filter((item) => item.id !== normalized.id)];

  if (isFirebaseEnabled) {
    await db.collection('users').doc(uid).set(
      {
        addresses: updatedAddresses,
        updatedAt: new Date()
      },
      { merge: true }
    );
  } else {
    const demo = demoUsers.find((user) => user.uid === uid);
    if (demo) demo.addresses = updatedAddresses;
  }

  return updatedAddresses;
};

export const calculateCart = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const error = new Error('Cart is empty.');
    error.status = 400;
    throw error;
  }

  const items = [];
  for (const cartItem of cartItems) {
    const productId = cartItem.productId || cartItem.id;
    const quantity = Math.max(1, Number(cartItem.quantity || 1));
    const product = await getProduct(productId);
    if (!product) {
      const error = new Error(`Product ${productId} is unavailable.`);
      error.status = 400;
      throw error;
    }
    if (product.stock < quantity) {
      const error = new Error(`${product.name} has only ${product.stock} item(s) in stock.`);
      error.status = 400;
      throw error;
    }
    items.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.images?.[0] || '',
      quantity,
      pricePaise: product.pricePaise,
      mrpPaise: product.mrpPaise
    });
  }

  const settings = await getCheckoutSettings();
  return {
    items,
    ...formatOrderAmounts(items, settings)
  };
};

export const createOrder = async (payload) => {
  const id = payload.id || `KBM-${Date.now()}`;
  const order = {
    id,
    appScope: env.appScope,
    userId: payload.userId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    phone: payload.phone,
    address: payload.address,
    items: payload.items,
    subtotalPaise: payload.subtotalPaise,
    gstPaise: payload.gstPaise,
    deliveryPaise: payload.deliveryPaise,
    totalAmountPaise: payload.totalAmountPaise,
    paymentMethod: payload.paymentMethod || 'Razorpay',
    paymentStatus: payload.paymentStatus || 'Paid',
    razorpayPaymentId: payload.razorpayPaymentId,
    razorpayOrderId: payload.razorpayOrderId,
    razorpaySignature: payload.razorpaySignature,
    orderStatus: payload.orderStatus || 'Pending',
    createdAt: new Date(),
    orderDate: new Date()
  };

  if (isFirebaseEnabled) {
    await db.collection('orders').doc(id).set(order);
  } else {
    demoOrders.unshift({ ...order, createdAt: nowIso(), orderDate: nowIso() });
  }

  return withIsoDates(order);
};

export const listUserOrders = async (uid) => {
  if (isFirebaseEnabled) {
    const snapshot = await db.collection('orders').where('userId', '==', uid).get();
    return snapshot.docs
      .map((doc) => withIsoDates({ id: doc.id, ...doc.data() }))
      .filter((order) => !order.appScope || order.appScope === env.appScope)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return demoOrders
    .filter((order) => order.userId === uid)
    .map(withIsoDates)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrder = async (id) => {
  if (isFirebaseEnabled) {
    const doc = await db.collection('orders').doc(id).get();
    return doc.exists ? withIsoDates({ id: doc.id, ...doc.data() }) : null;
  }
  const order = demoOrders.find((item) => item.id === id);
  return order ? withIsoDates(order) : null;
};

export const listAllOrders = async ({ status, search, from, to } = {}) => {
  let orders;
  if (isFirebaseEnabled) {
    const snapshot = await db.collection('orders').get();
    orders = snapshot.docs
      .map((doc) => withIsoDates({ id: doc.id, ...doc.data() }))
      .filter((order) => !order.appScope || order.appScope === env.appScope);
  } else {
    orders = demoOrders.map(withIsoDates);
  }

  const normalizedSearch = search?.trim().toLowerCase();
  return orders
    .filter((order) => {
      if (status && status !== 'All' && order.orderStatus !== status) return false;
      if (from && new Date(order.createdAt) < new Date(from)) return false;
      if (to && new Date(order.createdAt) > new Date(`${to}T23:59:59.999`)) return false;
      if (normalizedSearch) {
        const haystack = `${order.id} ${order.phone} ${order.customerName}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateOrderStatus = async (id, orderStatus) => {
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(orderStatus)) {
    const error = new Error('Invalid order status.');
    error.status = 400;
    throw error;
  }

  if (isFirebaseEnabled) {
    await db.collection('orders').doc(id).set({ orderStatus, updatedAt: new Date() }, { merge: true });
    return getOrder(id);
  }

  const order = demoOrders.find((item) => item.id === id);
  if (!order) return null;
  order.orderStatus = orderStatus;
  order.updatedAt = nowIso();
  return withIsoDates(order);
};

export const listCustomers = async () => {
  if (isFirebaseEnabled) {
    const snapshot = await db.collection('users').get();
    return snapshot.docs
      .map((doc) => withIsoDates({ uid: doc.id, ...doc.data() }))
      .filter((user) => user.appScope === env.appScope);
  }
  return demoUsers.map(withIsoDates).filter((user) => user.appScope === env.appScope);
};

export const getCustomerWithOrders = async (uid) => {
  const profile = await getUserProfile(uid);
  if (!profile) return null;
  const orders = await listUserOrders(uid);
  return { ...profile, orders };
};

export const getAnalytics = async () => {
  const [orders, productsResult, customers] = await Promise.all([
    listAllOrders(),
    listProducts({ includeInactive: true, pageSize: 1000 }),
    listCustomers()
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);
  const paidOrders = orders.filter((order) => order.paymentStatus === 'Paid');

  const revenueAllTimePaise = paidOrders.reduce(
    (total, order) => total + Number(order.totalAmountPaise || 0),
    0
  );
  const revenueThisMonthPaise = paidOrders
    .filter((order) => String(order.createdAt).slice(0, 7) === month)
    .reduce((total, order) => total + Number(order.totalAmountPaise || 0), 0);

  const statusBreakdown = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
    (status) => ({
      status,
      count: orders.filter((order) => order.orderStatus === status).length
    })
  );

  const revenueByDay = paidOrders.reduce((acc, order) => {
    const day = String(order.createdAt).slice(0, 10);
    acc[day] = (acc[day] || 0) + Number(order.totalAmountPaise || 0) / 100;
    return acc;
  }, {});

  const productMap = paidOrders.reduce((acc, order) => {
    for (const item of order.items || []) {
      const key = item.productId || item.name;
      if (!acc[key]) {
        acc[key] = {
          name: item.name || key,
          category: item.category || 'Uncategorized',
          quantity: 0,
          revenuePaise: 0
        };
      }
      const quantity = Number(item.quantity || 0);
      acc[key].quantity += quantity;
      acc[key].revenuePaise += Number(item.pricePaise || 0) * quantity;
    }
    return acc;
  }, {});

  const categoryMap = Object.values(productMap).reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        category: item.category,
        quantity: 0,
        revenuePaise: 0
      };
    }
    acc[item.category].quantity += item.quantity;
    acc[item.category].revenuePaise += item.revenuePaise;
    return acc;
  }, {});

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenuePaise - a.revenuePaise)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      revenue: item.revenuePaise / 100
    }));

  const categorySales = Object.values(categoryMap)
    .sort((a, b) => b.revenuePaise - a.revenuePaise)
    .map((item) => ({
      ...item,
      revenue: item.revenuePaise / 100
    }));

  return {
    totalOrders: orders.length,
    totalOrdersToday: orders.filter((order) => String(order.createdAt).slice(0, 10) === today).length,
    revenueAllTimePaise,
    revenueThisMonthPaise,
    averageOrderValuePaise: paidOrders.length ? Math.round(revenueAllTimePaise / paidOrders.length) : 0,
    paidOrders: paidOrders.length,
    pendingOrders: orders.filter((order) => order.orderStatus === 'Pending').length,
    customers: customers.filter((user) => user.role !== 'admin').length,
    products: productsResult.total,
    recentOrders: orders.slice(0, 10),
    statusBreakdown,
    revenueSeries: Object.entries(revenueByDay)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-14)
      .map(([date, revenue]) => ({ date, revenue })),
    topProducts,
    categorySales
  };
};
