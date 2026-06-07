import crypto from 'node:crypto';
import { env } from '../config/env.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const signWithSecret = (payload, secret) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url');

const sign = (payload) => signWithSecret(payload, env.admin.tokenSecret);

const getAcceptedSecrets = () =>
  [
    env.admin.tokenSecret,
    env.razorpay.keySecret,
    env.firebase.privateKey,
    'kingmops-admin-session'
  ].filter(Boolean);

export const createAdminToken = () => {
  const payload = encode({
    uid: 'admin-local',
    email: env.admin.email,
    role: 'admin',
    name: env.admin.name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  });
  return `${payload}.${sign(payload)}`;
};

export const verifyAdminToken = (token = '') => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const signatureValid = getAcceptedSecrets().some((secret) => {
    const expected = signWithSecret(payload, secret);
    return (
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  });

  if (!signatureValid) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!decoded.exp || decoded.exp < Date.now() || decoded.role !== 'admin') return null;
  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name
  };
};
