export const categories = ['Mops', 'Wipers', 'Cleaning Products'];

export const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const formatINR = (paise = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(paise || 0) / 100);

export const formatDate = (date) => {
  if (!date) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export const getEstimatedDelivery = (date = new Date()) => {
  const value = new Date(date);
  value.setDate(value.getDate() + 5);
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(value);
};

export const phonePattern = /^[6-9]\d{9}$/;

export const validatePhone = (value) => phonePattern.test(String(value || '').trim());

export const toInputRupees = (paise = 0) => Number(paise || 0) / 100;

export const fromInputRupees = (rupees = 0) => Math.round(Number(rupees || 0) * 100);

export const compactAddress = (address = {}) =>
  [
    address.flat,
    address.street,
    address.area,
    address.city,
    address.state,
    address.pinCode
  ]
    .filter(Boolean)
    .join(', ');

export const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
