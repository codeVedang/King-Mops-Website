import crypto from 'node:crypto';
import { env } from '../config/env.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const sign = (payload) =>
  crypto.createHmac('sha256', env.admin.tokenSecret).update(payload).digest('base64url');

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

  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
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
