import express from 'express';
import {
  createOrder,
  calculateCart,
  saveUserAddress
} from '../lib/store.js';
import {
  createPaymentOrder,
  fetchPaymentMethod,
  verifyRazorpaySignature,
  verifyWebhookSignature
} from '../lib/razorpay.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

export const paymentsRouter = express.Router();

paymentsRouter.post('/create-razorpay-order', requireAuth, async (req, res, next) => {
  try {
    const summary = await calculateCart(req.body.items);
    const receipt = `rcpt_${Date.now()}`;
    const paymentOrder = await createPaymentOrder({
      amountPaise: summary.totalPaise,
      receipt
    });

    res.status(201).json({
      razorpayOrderId: paymentOrder.id,
      amountPaise: summary.totalPaise,
      currency: 'INR',
      keyId: env.razorpay.keyId,
      summary
    });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/verify', requireAuth, async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      address,
      saveAddress
    } = req.body;

    const verified = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!verified) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    const summary = await calculateCart(items);
    const paymentMethod = await fetchPaymentMethod(razorpayPaymentId);
    const order = await createOrder({
      userId: req.user.uid,
      customerName: address.fullName,
      customerEmail: req.user.email || '',
      phone: address.phone,
      address,
      items: summary.items,
      subtotalPaise: summary.subtotalPaise,
      gstPaise: summary.gstPaise,
      deliveryPaise: summary.deliveryPaise,
      totalAmountPaise: summary.totalPaise,
      paymentMethod,
      paymentStatus: 'Paid',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderStatus: 'Pending'
    });

    if (saveAddress) {
      await saveUserAddress(req.user.uid, address);
    }

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export const paymentsWebhookHandler = async (req, res) => {
  const signature = req.header('x-razorpay-signature');
  const verified = verifyWebhookSignature(req.body, signature);
  if (!verified) {
    return res.status(400).json({ message: 'Invalid webhook signature.' });
  }

  // v1 keeps webhook handling conservative. The verified event is accepted and logged.
  console.info('Verified Razorpay webhook:', req.body.toString('utf8'));
  return res.json({ received: true });
};
