import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const waitForFirebaseUser = () =>
  new Promise((resolve) => {
    if (!isFirebaseConfigured || !auth) return resolve(null);
    if (auth.currentUser) return resolve(auth.currentUser);
    const timeout = window.setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 1500);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      window.clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });

export const apiFetch = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  } else if (isFirebaseConfigured) {
    const firebaseUser = await waitForFirebaseUser();
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const adminToken = localStorage.getItem('kingmops:adminToken');
  if (adminToken && (path.startsWith('/admin') || path === '/auth/me')) {
    headers.set('x-admin-token', adminToken);
  }

  const demoRole = localStorage.getItem('kingmops:demoRole');
  const demoUser = localStorage.getItem('kingmops:demoUid');
  if (demoRole) {
    headers.set('x-demo-role', demoRole);
    headers.set('x-demo-user', demoUser || 'demo-customer');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...Object.fromEntries(
      Object.entries(options).filter(([key]) => key !== 'authToken')
    ),
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
};

export const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
