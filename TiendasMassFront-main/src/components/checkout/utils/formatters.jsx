// Utilidades para formatear valores

export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const cleaned = price.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
};

export const formatCardExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

export const formatPrice = (price) => {
  return `S/. ${parsePrice(price).toFixed(2)}`;
};
