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
import { env } from '../config/env.js';

export const paymentsRouter = express.Router();

const guestUserId = (phone = '') => {
  const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
  return normalizedPhone ? `guest_${normalizedPhone}` : `guest_${Date.now()}`;
};

paymentsRouter.post('/create-razorpay-order', async (req, res, next) => {
  try {
    const summary = await calculateCart(req.body.items);
    const amountPaise = Math.round(Number(summary.totalPaise || 0));
    const receipt = `rcpt_${Date.now()}`;
    const paymentOrder = await createPaymentOrder({
      amountPaise,
      receipt
    });

    res.status(201).json({
      razorpayOrderId: paymentOrder.id,
      amountPaise,
      currency: 'INR',
      keyId: env.razorpay.keyId,
      summary
    });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/verify', async (req, res, next) => {
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

    if (!address?.fullName || !address?.phone) {
      return res.status(400).json({ message: 'Customer name and mobile number are required.' });
    }

    const summary = await calculateCart(items);
    const paymentMethod = await fetchPaymentMethod(razorpayPaymentId);
    const order = await createOrder({
      userId: req.user?.uid || guestUserId(address.phone),
      customerName: address.fullName,
      customerEmail: req.user?.email || '',
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

    if (saveAddress && req.user?.uid) {
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
