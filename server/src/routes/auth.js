import express from 'express';
import { createOrUpdateUserProfile, getUserProfile, saveUserAddress } from '../lib/store.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = express.Router();

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
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
      email: req.body.email || req.user.email
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
