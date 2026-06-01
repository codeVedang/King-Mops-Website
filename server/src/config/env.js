import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const serverEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

const normalizePrivateKey = (value = '') => value.replace(/\\n/g, '\n');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  appScope: process.env.APP_SCOPE || 'kingmops',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || ''),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },
  demoMode: process.env.DEMO_MODE !== 'false'
};

export const hasFirebaseServiceAccount = Boolean(
  env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey
);

export const hasRazorpayKeys = Boolean(env.razorpay.keyId && env.razorpay.keySecret);
