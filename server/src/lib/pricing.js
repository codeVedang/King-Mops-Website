const GST_RATE = 0.18;
const DELIVERY_CHARGE_PAISE = 4900;
const FREE_DELIVERY_FROM_PAISE = 99900;

export const toPaise = (value) => Math.round(Number(value || 0) * 100);

export const formatOrderAmounts = (items) => {
  const subtotalPaise = items.reduce(
    (total, item) => total + Number(item.pricePaise) * Number(item.quantity),
    0
  );
  const gstPaise = Math.round(subtotalPaise * GST_RATE);
  const deliveryPaise = subtotalPaise >= FREE_DELIVERY_FROM_PAISE ? 0 : DELIVERY_CHARGE_PAISE;
  const totalPaise = subtotalPaise + gstPaise + deliveryPaise;

  return {
    subtotalPaise,
    gstPaise,
    deliveryPaise,
    totalPaise
  };
};
