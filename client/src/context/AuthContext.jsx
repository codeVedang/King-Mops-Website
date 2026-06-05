import {
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signOut,
  updateProfile
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api.js';
import { auth, isFirebaseConfigured } from '../lib/firebase.js';
import { validatePhone } from '../lib/format.js';

const AuthContext = createContext(null);

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

const fallbackCustomerName = (phone) => `Customer ${String(phone).slice(-4)}`;

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

  const savePhoneProfile = async ({ name, phone, authToken }) => {
    const saved = await apiFetch('/auth/profile', {
      ...(authToken ? { authToken } : {}),
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        phone,
        phoneVerified: true,
        role: 'customer'
      })
    });
    setProfile(saved.profile);
    setPhoneVerification(null);
    return saved.profile;
  };

  const completePhoneProfile = async ({ name, phone }) => {
    if (!name?.trim()) {
      throw new Error('Enter your full name.');
    }
    if (!validatePhone(phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!user) {
      throw new Error('Verify your mobile number first.');
    }

    const authToken = isFirebaseConfigured && user.getIdToken ? await user.getIdToken() : null;
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.displayName !== name.trim()) {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
    }
    return savePhoneProfile({ name, phone, authToken });
  };

  const signInWithPhone = async ({ name = '', phone }) => {
    if (!validatePhone(phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!phoneVerification?.verified || phoneVerification.phone !== phone) {
      throw new Error('Verify your mobile number with OTP first.');
    }

    const displayName = name.trim() || fallbackCustomerName(phone);

    if (!isFirebaseConfigured) {
      const demoUser = {
        uid: `phone_${phone}`,
        phoneNumber: `+91${phone}`,
        displayName,
        role: 'customer'
      };
      setDemoSession(demoUser);
      setUser(demoUser);
      const existingProfile = await refreshProfile();
      if (!existingProfile && !name.trim()) {
        return { user: demoUser, needsName: true };
      }
      if (name.trim() || !existingProfile) {
        const profileData = await savePhoneProfile({ name: displayName, phone });
        return { user: demoUser, profile: profileData, needsName: false };
      }
      setPhoneVerification(null);
      return { user: demoUser, profile: existingProfile, needsName: false };
    }

    const credential = await signInWithCredential(auth, phoneVerification.credential);
    if (name.trim() && credential.user.displayName !== name.trim()) {
      await updateProfile(credential.user, { displayName });
    }
    setUser(credential.user);
    const token = await credential.user.getIdToken();
    const existingProfile = await refreshProfile(token);
    if (!existingProfile && !name.trim()) {
      return { user: credential.user, needsName: true };
    }
    if (name.trim() || !existingProfile || existingProfile.phone !== phone) {
      const profileData = await savePhoneProfile({
        name: name.trim() || existingProfile?.name || displayName,
        phone,
        authToken: token
      });
      return { user: credential.user, profile: profileData, needsName: false };
    }
    setPhoneVerification(null);
    return { user: credential.user, profile: existingProfile, needsName: false };
  };

  const register = async ({ name, phone }) => {
    if (!name?.trim()) {
      throw new Error('Enter your full name.');
    }
    return signInWithPhone({ name, phone });
  };

  const login = async ({ email, password, admin = false, phone, name }) => {
    if (admin) {
      if (!email || !password) throw new Error('Admin email and password are required.');
      const data = await apiFetch('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setAdminSession(data);
      setUser(data.user);
      setProfile(data.profile);
      return data.user;
    }

    return signInWithPhone({ name, phone });
  };

  const logout = async () => {
    if (isFirebaseConfigured) await signOut(auth);
    localStorage.removeItem('kingmops:adminToken');
    localStorage.removeItem('kingmops:adminUser');
    localStorage.removeItem('kingmops:demoUser');
    localStorage.removeItem('kingmops:demoUid');
    localStorage.removeItem('kingmops:demoRole');
    clearPhoneRecaptcha();
    setPhoneVerification(null);
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
      completePhoneProfile,
      sendPhoneOtp,
      verifyPhoneOtp,
      phoneVerification,
      logout,
      refreshProfile
    }),
    [user, profile, loading, phoneVerification]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
