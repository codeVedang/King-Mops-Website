import express from 'express';
import { createOrUpdateUserProfile, getUserProfile, saveUserAddress } from '../lib/store.js';
import { requireAuth } from '../middleware/auth.js';
import { createAdminToken } from '../lib/adminSession.js';
import { env } from '../config/env.js';

export const authRouter = express.Router();

authRouter.post('/admin-login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (email !== env.admin.email.toLowerCase() || password !== env.admin.password) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const user = {
    uid: 'admin-local',
    email: env.admin.email,
    displayName: env.admin.name,
    role: 'admin'
  };
  res.json({
    token: createAdminToken(),
    user,
    profile: {
      uid: user.uid,
      name: env.admin.name,
      email: env.admin.email,
      role: 'admin',
      admin: true
    }
  });
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({
        user: req.user,
        profile: {
          uid: req.user.uid,
          name: req.user.name || env.admin.name,
          email: req.user.email,
          role: 'admin',
          admin: true
        }
      });
    }
    const profile = await getUserProfile(req.user.uid);
    res.json({ user: req.user, profile });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/profile', requireAuth, async (req, res, next) => {
  try {
    const profile = await createOrUpdateUserProfile(req.user.uid, {
      ...req.body,
      email: req.body.email || req.user.email || '',
      phone: req.body.phone || String(req.user.phone_number || '').replace(/^\+91/, '')
    });
    res.status(201).json({ profile });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/addresses', requireAuth, async (req, res, next) => {
  try {
    const addresses = await saveUserAddress(req.user.uid, req.body);
    res.status(201).json({ addresses });
  } catch (error) {
    next(error);
  }
});
