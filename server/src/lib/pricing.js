export const defaultCheckoutSettings = {
  gstRatePercent: 18,
  deliveryFeePaise: 4900
};

export const toPaise = (value) => Math.round(Number(value || 0) * 100);

export const normalizeCheckoutSettings = (settings = {}) => {
  const gstRatePercent = Math.max(
    0,
    Number(settings.gstRatePercent ?? defaultCheckoutSettings.gstRatePercent)
  );
  const deliveryFeePaise = Math.max(
    0,
    Math.round(Number(settings.deliveryFeePaise ?? defaultCheckoutSettings.deliveryFeePaise))
  );

  return {
    gstRatePercent,
    deliveryFeePaise,
    deliveryFee: deliveryFeePaise / 100
  };
};

export const formatOrderAmounts = (items, settings = defaultCheckoutSettings) => {
  const checkoutSettings = normalizeCheckoutSettings(settings);
  const subtotalPaise = items.reduce(
    (total, item) => total + Number(item.pricePaise) * Number(item.quantity),
    0
  );
  const gstPaise = Math.round(subtotalPaise * (checkoutSettings.gstRatePercent / 100));
  const deliveryPaise = subtotalPaise > 0 ? checkoutSettings.deliveryFeePaise : 0;
  const totalPaise = subtotalPaise + gstPaise + deliveryPaise;

  return {
    subtotalPaise,
    gstPaise,
    deliveryPaise,
    totalPaise,
    settings: checkoutSettings
  };
};
