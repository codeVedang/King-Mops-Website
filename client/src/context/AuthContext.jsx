import {
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api.js';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase.js';
import { validatePhone } from '../lib/format.js';

const AuthContext = createContext(null);

const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@kingmops.local';
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123';
const demoOtpCode = '123456';

const getDemoUser = () => {
  const raw = localStorage.getItem('kingmops:demoUser');
  return raw ? JSON.parse(raw) : null;
};

const getAdminUser = () => {
  const token = localStorage.getItem('kingmops:adminToken');
  const raw = localStorage.getItem('kingmops:adminUser');
  if (!token || !raw) return null;
  return JSON.parse(raw);
};

const setDemoSession = (user) => {
  localStorage.setItem('kingmops:demoUser', JSON.stringify(user));
  localStorage.setItem('kingmops:demoUid', user.uid);
  localStorage.setItem('kingmops:demoRole', user.role);
};

const setAdminSession = ({ token, user }) => {
  localStorage.setItem('kingmops:adminToken', token);
  localStorage.setItem('kingmops:adminUser', JSON.stringify(user));
};

const clearPhoneRecaptcha = () => {
  if (!window.kingMopsRecaptchaVerifier) return;
  try {
    window.kingMopsRecaptchaVerifier.clear();
  } catch {
    // Firebase can throw if the widget was already removed by a route/mode change.
  }
  window.kingMopsRecaptchaVerifier = null;
  const container = document.getElementById('phone-recaptcha-container');
  if (container) container.innerHTML = '';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneVerification, setPhoneVerification] = useState(null);

  const refreshProfile = async (authToken) => {
    try {
      const data = await apiFetch('/auth/me', authToken ? { authToken } : {});
      setProfile(data.profile);
      return data.profile;
    } catch {
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const adminUser = getAdminUser();
    if (adminUser?.role === 'admin') {
      setUser(adminUser);
      setProfile({
        uid: adminUser.uid,
        name: adminUser.displayName || 'King Mops Admin',
        email: adminUser.email,
        role: 'admin',
        admin: true
      });
      setLoading(false);
      return undefined;
    }

    const demoUser = getDemoUser();
    if (demoUser && !isFirebaseConfigured) {
      setUser(demoUser);
      refreshProfile().finally(() => setLoading(false));
      return undefined;
    }
    if (demoUser && isFirebaseConfigured) {
      localStorage.removeItem('kingmops:demoUser');
      localStorage.removeItem('kingmops:demoUid');
      localStorage.removeItem('kingmops:demoRole');
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const setupRecaptcha = () => {
    const container = document.getElementById('phone-recaptcha-container');
    if (!container) {
      throw new Error('Phone verification is still loading. Refresh the page and try again.');
    }
    clearPhoneRecaptcha();
    window.kingMopsRecaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible'
    });
    return window.kingMopsRecaptchaVerifier;
  };

  const sendPhoneOtp = async (phone) => {
    if (!validatePhone(phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }

    if (!isFirebaseConfigured) {
      setPhoneVerification({ phone, verified: false, demo: true });
      return true;
    }

    try {
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(`+91${phone}`, setupRecaptcha());
      setPhoneVerification({ phone, verificationId, verified: false });
      return true;
    } catch (error) {
      clearPhoneRecaptcha();
      if (error.code === 'auth/captcha-check-failed' || String(error.message || '').includes('DUPE')) {
        throw new Error('Phone verification captcha failed. Refresh once and try Send OTP again.');
      }
      throw error;
    }
  };

  const verifyPhoneOtp = async (code) => {
    if (!phoneVerification) {
      throw new Error('Send the phone OTP first.');
    }
    if (!code) {
      throw new Error('Enter the OTP sent to your phone.');
    }

    if (phoneVerification.demo) {
      if (code !== demoOtpCode) throw new Error('Use demo OTP 123456.');
      setPhoneVerification({ ...phoneVerification, verified: true, credential: null });
      return true;
    }

    const credential = PhoneAuthProvider.credential(phoneVerification.verificationId, code);
    setPhoneVerification({ ...phoneVerification, verified: true, credential });
    return true;
  };

  const register = async ({ name, email, password, confirmPassword, phone }) => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      throw new Error('All registration fields are required.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (!validatePhone(phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!phoneVerification?.verified || phoneVerification.phone !== phone) {
      throw new Error('Verify your mobile number with OTP before registration.');
    }

    if (!isFirebaseConfigured) {
      const demoUser = {
        uid: `demo_${Date.now()}`,
        email,
        displayName: name,
        emailVerified: true,
        role: 'customer'
      };
      setDemoSession(demoUser);
      setUser(demoUser);
      const saved = await apiFetch('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, phoneVerified: true, role: 'customer' })
      });
      setProfile(saved.profile);
      return demoUser;
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(credential.user, { displayName: name });
      if (phoneVerification.credential) {
        await linkWithCredential(credential.user, phoneVerification.credential);
      }
      await sendEmailVerification(credential.user);
      const saved = await apiFetch('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, phoneVerified: true, role: 'customer' })
      });
      setProfile(saved.profile);
      return credential.user;
    } catch (error) {
      await credential.user.delete().catch(() => {});
      throw error;
    }
  };

  const login = async ({ email, password, admin = false }) => {
    if (!email || !password) throw new Error('Email and password are required.');

    if (admin) {
      const data = await apiFetch('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setAdminSession(data);
      setUser(data.user);
      setProfile(data.profile);
      return data.user;
    }

    const isAdminLogin = email === demoAdminEmail && password === demoAdminPassword;
    if (!isFirebaseConfigured) {
      if (admin && !isAdminLogin) {
        throw new Error('Use the configured admin credentials for admin access.');
      }
      const role = isAdminLogin ? 'admin' : 'customer';
      const demoUser = {
        uid: role === 'admin' ? 'demo-admin' : 'demo-customer',
        email,
        displayName: role === 'admin' ? 'King Mops Admin' : 'Demo Customer',
        emailVerified: true,
        role
      };
      setDemoSession(demoUser);
      setUser(demoUser);
      await refreshProfile();
      return demoUser;
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    const token = await credential.user.getIdToken();
    await refreshProfile(token);
    return credential.user;
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      return login({ email: 'customer@kingmops.local', password: 'demo' });
    }
    const credential = await signInWithPopup(auth, googleProvider);
    const profileData = await refreshProfile();
    if (!profileData) {
      await apiFetch('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: credential.user.displayName || 'Google User',
          email: credential.user.email,
          phone: '',
          role: 'customer'
        })
      });
      await refreshProfile();
    }
    return credential.user;
  };

  const resetPassword = async (email) => {
    if (!email) throw new Error('Enter your email address.');
    if (!isFirebaseConfigured) return true;
    await sendPasswordResetEmail(auth, email);
    return true;
  };

  const logout = async () => {
    if (isFirebaseConfigured) await signOut(auth);
    localStorage.removeItem('kingmops:adminToken');
    localStorage.removeItem('kingmops:adminUser');
    localStorage.removeItem('kingmops:demoUser');
    localStorage.removeItem('kingmops:demoUid');
    localStorage.removeItem('kingmops:demoRole');
    clearPhoneRecaptcha();
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin' || profile?.admin === true || user?.role === 'admin',
      isFirebaseConfigured,
      register,
      login,
      loginWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      phoneVerification,
      resetPassword,
      logout,
      refreshProfile
    }),
    [user, profile, loading, phoneVerification]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
