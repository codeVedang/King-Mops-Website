import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env, hasRazorpayKeys } from '../config/env.js';

const razorpay = hasRazorpayKeys
  ? new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret
    })
  : null;

export const createPaymentOrder = async ({ amountPaise, receipt }) => {
  const finalAmountPaise = Math.round(Number(amountPaise || 0));
  if (!Number.isFinite(finalAmountPaise) || finalAmountPaise <= 0) {
    const error = new Error('Invalid payment amount.');
    error.status = 400;
    throw error;
  }

  if (!razorpay) {
    return {
      id: `order_demo_${Date.now()}`,
      amount: finalAmountPaise,
      currency: 'INR',
      receipt,
      demo: true
    };
  }

  try {
    return await razorpay.orders.create({
      amount: finalAmountPaise,
      currency: 'INR',
      receipt,
      payment_capture: 1
    });
  } catch (error) {
    const description = error?.error?.description || error?.message || 'Razorpay order creation failed.';
    const enhanced = new Error(
      description === 'Authentication failed'
        ? 'Razorpay authentication failed. Please check that the Key ID and Key Secret are copied from the same Razorpay account and mode.'
        : description
    );
    enhanced.status = error.statusCode || error.status || 502;
    enhanced.provider = 'razorpay';
    throw enhanced;
  }
};

export const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpay) {
    return String(razorpayOrderId || '').startsWith('order_demo_');
  }

  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expected === razorpaySignature;
};

export const fetchPaymentMethod = async (paymentId) => {
  if (!razorpay || !paymentId) return 'Razorpay';
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment?.method || 'Razorpay';
  } catch (error) {
    console.warn('Unable to fetch Razorpay payment method.', error.message);
    return 'Razorpay';
  }
};

export const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
};
