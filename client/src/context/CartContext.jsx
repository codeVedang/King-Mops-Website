import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const storageKey = 'kingmops:cart';

const readInitialCart = () => {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : [];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readInitialCart);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

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
    const gstPaise = Math.round(subtotalPaise * 0.18);
    const deliveryPaise = subtotalPaise >= 99900 || subtotalPaise === 0 ? 0 : 4900;
    return {
      subtotalPaise,
      gstPaise,
      deliveryPaise,
      totalPaise: subtotalPaise + gstPaise + deliveryPaise,
      count: items.reduce((total, item) => total + Number(item.quantity), 0)
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      summary,
      addItem,
      setQuantity,
      removeItem,
      clearCart
    }),
    [items, summary]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
