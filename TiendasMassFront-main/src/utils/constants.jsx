// src/utils/constants.js

export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "https://backendtiendasmass-e6emcsagc9gududu.brazilsouth-01.azurewebsites.net";

export const imageBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : API_URL;

export const DELIVERY_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup'
};

export const PAYMENT_STATUS = {
  COMPLETADO: 'COMPLETADO',
  PENDIENTE: 'PENDIENTE',
  PENDIENTE_VERIFICACION: 'PENDIENTE_VERIFICACION',
  FALLIDO: 'FALLIDO'
};

export const PAYMENT_TYPES = {
  CARD: 'tarjeta',
  PAYPAL: 'paypal',
  TRANSFER: 'transferencia',
  WALLET: 'billetera',
  MERCADOPAGO: 'mercadopago'
};

export const STORES = [
  { value: "Centro – Av. Principal 123", label: "Centro – Av. Principal 123" },
  { value: "Norte – Calle Comercial 456", label: "Norte – Calle Comercial 456" },
  { value: "Sur – Plaza Shopping 789", label: "Sur – Plaza Shopping 789" },
  { value: "Este – Mall Central 101", label: "Este – Mall Central 101" }
];

export const CHECKOUT_STEPS = [
  { id: 1, label: "Envío" },
  { id: 2, label: "Pago" },
  { id: 3, label: "Confirmación" }
];