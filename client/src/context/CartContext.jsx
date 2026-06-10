import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../lib/api.js';

const CartContext = createContext(null);
const storageKey = 'kingmops:cart';
const defaultCheckoutSettings = {
  gstRatePercent: 18,
  deliveryFeePaise: 4900
};

const readInitialCart = () => {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : [];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readInitialCart);
  const [checkoutSettings, setCheckoutSettings] = useState(defaultCheckoutSettings);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, detail = '') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, detail });
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    apiFetch('/settings/checkout')
      .then((data) => setCheckoutSettings(data.settings || defaultCheckoutSettings))
      .catch(() => setCheckoutSettings(defaultCheckoutSettings));
  }, []);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          image: product.images?.[0] || '',
          pricePaise: product.pricePaise,
          mrpPaise: product.mrpPaise,
          quantity
        }
      ];
    });
    showToast('Added to cart', `${product.name} x ${quantity}`);
  }, [showToast]);

  const setQuantity = useCallback((id, quantity) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      const nextQuantity = Math.max(0, Number(quantity));
      if (!existing) return current;
      if (nextQuantity <= 0) {
        showToast('Removed from cart', existing.name);
        return current.filter((item) => item.id !== id);
      }
      showToast('Cart updated', `${existing.name} x ${nextQuantity}`);
      return current.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item));
    });
  }, [showToast]);

  const removeItem = useCallback((id) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) showToast('Removed from cart', existing.name);
      return current.filter((item) => item.id !== id);
    });
  }, [showToast]);

  const clearCart = useCallback(() => setItems([]), []);

  const summary = useMemo(() => {
    const subtotalPaise = items.reduce(
      (total, item) => total + Number(item.pricePaise || 0) * Number(item.quantity),
      0
    );
    const gstPaise = Math.round(subtotalPaise * (Number(checkoutSettings.gstRatePercent || 0) / 100));
    const deliveryPaise = subtotalPaise === 0 ? 0 : Math.max(0, Number(checkoutSettings.deliveryFeePaise || 0));
    return {
      subtotalPaise,
      gstPaise,
      deliveryPaise,
      totalPaise: subtotalPaise + gstPaise + deliveryPaise,
      count: items.reduce((total, item) => total + Number(item.quantity), 0),
      settings: checkoutSettings
    };
  }, [items, checkoutSettings]);

  const value = useMemo(
    () => ({
      items,
      summary,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      checkoutSettings,
      refreshCheckoutSettings: () =>
        apiFetch('/settings/checkout').then((data) => {
          setCheckoutSettings(data.settings || defaultCheckoutSettings);
          return data.settings;
        })
    }),
    [items, summary, addItem, setQuantity, removeItem, clearCart, checkoutSettings]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <strong>{toast.message}</strong>
          {toast.detail && <span>{toast.detail}</span>}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
