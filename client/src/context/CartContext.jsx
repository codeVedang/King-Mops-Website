import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    apiFetch('/settings/checkout')
      .then((data) => setCheckoutSettings(data.settings || defaultCheckoutSettings))
      .catch(() => setCheckoutSettings(defaultCheckoutSettings));
  }, []);

  const addItem = (product, quantity = 1) => {
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
  };

  const setQuantity = (id, quantity) => {
    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Number(quantity)) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));
  const clearCart = () => setItems([]);

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
    [items, summary, checkoutSettings]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
