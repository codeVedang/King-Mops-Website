import express from 'express';
import {
  getAnalytics,
  getCheckoutSettings,
  getCustomerWithOrders,
  getOrder,
  deleteProduct,
  listAllOrders,
  listCustomers,
  listProducts,
  updateCheckoutSettings,
  updateOrderStatus,
  upsertProduct
} from '../lib/store.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminRouter = express.Router();

adminRouter.use(requireAdmin);

adminRouter.get('/metrics', async (req, res, next) => {
  try {
    res.json({ metrics: await getAnalytics() });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/settings/checkout', async (req, res, next) => {
  try {
    res.json({ settings: await getCheckoutSettings() });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/settings/checkout', async (req, res, next) => {
  try {
    res.json({ settings: await updateCheckoutSettings(req.body) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/orders', async (req, res, next) => {
  try {
    const orders = await listAllOrders(req.query);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.orderStatus);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/products', async (req, res, next) => {
  try {
    const products = await listProducts({
      includeInactive: true,
      pageSize: 1000,
      sort: req.query.sort || 'newest',
      search: req.query.search,
      category: req.query.category
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/products', async (req, res, next) => {
  try {
    const product = await upsertProduct(req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/products/:id', async (req, res, next) => {
  try {
    const product = await upsertProduct({ ...req.body, id: req.params.id });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product, deleted: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/customers', async (req, res, next) => {
  try {
    const customers = await listCustomers();
    res.json({ customers });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/customers/:uid', async (req, res, next) => {
  try {
    const customer = await getCustomerWithOrders(req.params.uid);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ customer });
  } catch (error) {
    next(error);
  }
});
