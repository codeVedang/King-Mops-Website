import express from 'express';
import { getCheckoutSettings } from '../lib/store.js';

export const settingsRouter = express.Router();

settingsRouter.get('/checkout', async (req, res, next) => {
  try {
    res.json({ settings: await getCheckoutSettings() });
  } catch (error) {
    next(error);
  }
});
