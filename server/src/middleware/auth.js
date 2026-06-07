import { firebaseAdmin, isFirebaseEnabled } from '../lib/firebaseAdmin.js';
import { getUserProfile } from '../lib/store.js';
import { verifyAdminToken } from '../lib/adminSession.js';

export const requireAuth = async (req, res, next) => {
  try {
    const bearerToken = req.header('authorization')?.replace(/^Bearer\s+/i, '');
    const adminToken = req.header('x-admin-token') || bearerToken;
    if (adminToken) {
      const adminUser = verifyAdminToken(adminToken);
      if (adminUser) {
        req.user = adminUser;
        return next();
      }
    }

    if (!isFirebaseEnabled) {
      const token = bearerToken;
      if (token) {
        const [, payload] = token.split('.');
        const decoded = payload ? JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) : {};
        req.user = {
          uid: decoded.user_id || decoded.sub || 'demo-customer',
          email: decoded.email || '',
          role: 'customer'
        };
        return next();
      }
      const role = req.header('x-demo-role') === 'admin' ? 'admin' : 'customer';
      const uid = role === 'admin' ? 'demo-admin' : req.header('x-demo-user') || 'demo-customer';
      req.user = {
        uid,
        email: role === 'admin' ? 'admin@kingmops.local' : 'customer@kingmops.local',
        role
      };
      return next();
    }

    const token = bearerToken;
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }
    req.user = await firebaseAdmin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

export const requireAdmin = [
  requireAuth,
  async (req, res, next) => {
    try {
      const profile = await getUserProfile(req.user.uid);
      if (profile?.role === 'admin' || profile?.admin === true || req.user.role === 'admin') {
        req.adminProfile = profile;
        return next();
      }
      return res.status(403).json({ message: 'Admin access is required.' });
    } catch (error) {
      return next(error);
    }
  }
];

export const requireOrderOwnerOrAdmin = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.uid);
    req.isAdmin = profile?.role === 'admin' || profile?.admin === true || req.user.role === 'admin';
    return next();
  } catch (error) {
    return next(error);
  }
};
