import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isFirebaseEnabled } from './lib/firebaseAdmin.js';
import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import { ordersRouter } from './routes/orders.js';
import { paymentsRouter, paymentsWebhookHandler } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true
  })
);

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentsWebhookHandler);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    firebase: isFirebaseEnabled ? 'enabled' : 'demo',
    razorpay: env.razorpay.keyId ? 'configured' : 'demo'
  });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Something went wrong.',
    provider: error.provider
  });
});

export default app;
