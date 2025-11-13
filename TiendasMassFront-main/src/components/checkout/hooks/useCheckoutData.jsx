import { useState, useEffect } from 'react';
import { checkoutService } from '../services/checkoutService';

export const useCheckoutData = (usuario, getAuthHeaders) => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar métodos de pago
  useEffect(() => {
    const loadMetodosPago = async () => {
      try {
        const data = await checkoutService.fetchMetodosPago();
        setMetodosPago(data);
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };
    loadMetodosPago();
  }, []);

  // Cargar tarjetas del usuario
  useEffect(() => {
    const loadUserCards = async () => {
      if (usuario?.id) {
        try {
          const cards = await checkoutService.fetchUserCards(usuario.id, getAuthHeaders());
          setUserCards(cards);
        } catch (error) {
          console.error('Error loading user cards:', error);
        }
      }
    };
    loadUserCards();
  }, [usuario, getAuthHeaders]);

  // Cargar direcciones del usuario
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (usuario?.id) {
        try {
          const addresses = await checkoutService.fetchUserAddresses(usuario.id, getAuthHeaders());
          setUserAddresses(addresses);
        } catch (error) {
          console.error('Error loading user addresses:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadUserAddresses();
  }, [usuario, getAuthHeaders]);

  return {
    metodosPago,
    userCards,
    userAddresses,
    loading
  };
};
