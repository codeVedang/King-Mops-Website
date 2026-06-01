import express from 'express';
import { getOrder, listUserOrders } from '../lib/store.js';
import { requireAuth, requireOrderOwnerOrAdmin } from '../middleware/auth.js';

export const ordersRouter = express.Router();

ordersRouter.get('/my', requireAuth, async (req, res, next) => {
  try {
    const orders = await listUserOrders(req.user.uid);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/:id', requireAuth, requireOrderOwnerOrAdmin, async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (!req.isAdmin && order.userId !== req.user.uid) {
      return res.status(403).json({ message: 'You can only view your own orders.' });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
});
