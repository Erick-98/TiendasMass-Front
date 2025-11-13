// Servicio para las llamadas API relacionadas con el checkout

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:443';

export const checkoutService = {
  fetchMetodosPago: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/metodos-pago`);
      if (!response.ok) throw new Error('Error al cargar métodos de pago');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  fetchUserCards: async (userId, headers) => {
    try {
      const response = await fetch(`${API_BASE}/api/tarjetas-usuario/usuario/${userId}`, { headers });
      // Si la ruta no existe (404), retornar array vacío sin error
      if (response.status === 404) {
        console.info('Funcionalidad de tarjetas guardadas no disponible');
        return [];
      }
      if (!response.ok) throw new Error('Error al cargar tarjetas');
      return await response.json();
    } catch (error) {
      // No mostrar error si es problema de conexión con endpoint no implementado
      console.info('Tarjetas guardadas no disponibles:', error.message);
      return [];
    }
  },

  fetchUserAddresses: async (userId, headers) => {
    try {
      const response = await fetch(`${API_BASE}/api/direcciones/usuario/${userId}`, { headers });
      // Si la ruta no existe (404), retornar array vacío sin error
      if (response.status === 404) {
        console.info('Funcionalidad de direcciones guardadas no disponible');
        return [];
      }
      if (!response.ok) throw new Error('Error al cargar direcciones');
      return await response.json();
    } catch (error) {
      // No mostrar error si es problema de conexión con endpoint no implementado
      console.info('Direcciones guardadas no disponibles:', error.message);
      return [];
    }
  },

  createOrder: async (pedidoData, token) => {
    try {
      const response = await fetch(`${API_BASE}/api/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
};
