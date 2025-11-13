// Servicio para la integración con Mercado Pago

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:443';

export const paymentService = {
  /**
   * Crear preferencia de Mercado Pago
   * @param {Array} items - Items del carrito
   * @param {Object} payer - Información del comprador (opcional)
   * @returns {Promise<Object>} Datos de la preferencia creada
   */
  createMercadoPagoPreference: async (items, payer = null) => {
    try {
      console.log('🚀 Creando preferencia MP con items:', items);
      console.log('🔗 URL API:', `${API_BASE}/api/pago`);

      const body = { items };
      if (payer) {
        body.payer = payer;
      }

      console.log('📦 Body enviado:', JSON.stringify(body, null, 2));

      const response = await fetch(`${API_BASE}/api/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      console.log('📡 Response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('📄 Response data:', data);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        const errorMsg = data.message || data.detail || 'Error al crear preferencia de Mercado Pago';
        console.error('❌ Backend error:', data);
        console.error('📋 Error completo (JSON):', JSON.stringify(data, null, 2));
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.message || 'La respuesta no fue exitosa';
        console.error('❌ Success=false:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Preferencia creada exitosamente:', {
        id: data.id,
        has_url: !!(data.checkout_url || data.sandbox_init_point || data.init_point)
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error completo creating MP preference:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Redirigir a Mercado Pago
   * @param {Object} data - Datos de la preferencia con URLs
   */
  redirectToMercadoPago: (data) => {
    // Prioridad: checkout_url > sandbox_init_point > init_point
    const checkoutUrl = data.checkout_url || data.sandbox_init_point || data.init_point;
    
    if (!checkoutUrl) {
      throw new Error('No se recibió URL de checkout de Mercado Pago');
    }

    console.log('🔗 Redirigiendo a Mercado Pago:', checkoutUrl);
    
    // Pequeño delay para mostrar feedback al usuario
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 500);
  },

  /**
   * Preparar items del carrito para Mercado Pago
   * @param {Array} carrito - Items del carrito
   * @returns {Array} Items formateados para MP
   */
  prepareItemsForMercadoPago: (carrito) => {
    if (!Array.isArray(carrito) || carrito.length === 0) {
      throw new Error('El carrito está vacío');
    }

    return carrito.map(item => {
      const price = parseFloat(item.precio);
      const quantity = parseInt(item.cantidad) || 1;

      if (isNaN(price) || price <= 0) {
        throw new Error(`Precio inválido para ${item.nombre}`);
      }

      return {
        title: item.nombre || 'Producto',
        quantity: quantity,
        unit_price: price,
        currency_id: 'PEN'
      };
    });
  },

  /**
   * Preparar información del comprador
   * @param {Object} usuario - Datos del usuario
   * @returns {Object} Información del comprador para MP
   */
  preparePayerInfo: (usuario) => {
    if (!usuario) return null;

    return {
      name: usuario.nombre || undefined,
      email: usuario.email || undefined,
      phone: usuario.telefono ? {
        number: usuario.telefono
      } : undefined,
    };
  }
};

