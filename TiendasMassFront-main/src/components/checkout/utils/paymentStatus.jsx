// Utilidades para determinar el estado del pago

export const determinePaymentStatus = (formData, paymentMethod) => {
  // Si hay paymentStatus en formData, usarlo directamente
  if (formData.paymentStatus) {
    return formData.paymentStatus;
  }

  // Si hay payment_status en formData (de Mercado Pago)
  if (formData.payment_status) {
    return formData.payment_status;
  }

  // Determinar estado basado en el método de pago
  const metodoPagoNombre = paymentMethod?.nombre?.toLowerCase() || '';

  if (metodoPagoNombre.includes('transferencia') || 
      metodoPagoNombre.includes('yape') || 
      metodoPagoNombre.includes('plin')) {
    return 'pending';
  }

  if (metodoPagoNombre.includes('tarjeta') || metodoPagoNombre.includes('paypal')) {
    return 'approved';
  }

  if (metodoPagoNombre.includes('mercado pago')) {
    return formData.status || 'pending';
  }

  return 'pending';
};

export const getPaymentStatusText = (status) => {
  const statusTexts = {
    'approved': 'Aprobado',
    'pending': 'Pendiente de confirmación',
    'in_process': 'En proceso',
    'rejected': 'Rechazado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado'
  };
  return statusTexts[status] || status;
};

export const getPaymentStatusColor = (status) => {
  const statusColors = {
    'approved': '#10b981',
    'pending': '#f59e0b',
    'in_process': '#3b82f6',
    'rejected': '#ef4444',
    'cancelled': '#6b7280',
    'refunded': '#8b5cf6'
  };
  return statusColors[status] || '#6b7280';
};
