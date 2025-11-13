import { useState } from 'react';
import { validateField } from '../utils/validations';

export const useCheckoutValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const validateFieldAndUpdate = (fieldName, value, extraContext = {}) => {
    const error = validateField(fieldName, value, extraContext);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const isStep1Valid = (formData) => {
    // Validar que formData exista
    if (!formData) return false;
    
    const requiredFields = ['fullName', 'email', 'phone'];
    
    // Validar que todos los campos requeridos estén completos y sin errores
    const allFieldsValid = requiredFields.every(field => {
      const value = formData[field];
      // Verificar que el campo tenga valor
      if (!value || value.trim().length === 0) return false;
      // Verificar que no haya error de validación
      const error = validateField(field, value);
      if (error) return false;
      return true;
    });

    if (!allFieldsValid) return false;

    // Si es delivery, también validar dirección y campos adicionales
    if (formData.deliveryType === 'delivery') {
      // Validar campos adicionales de dirección
      const deliveryFields = ['city', 'zipCode'];
      const deliveryFieldsValid = deliveryFields.every(field => {
        const value = formData[field];
        if (!value || value.trim().length === 0) return false;
        const error = validateField(field, value, { deliveryType: 'delivery' });
        if (error) return false;
        return true;
      });

      if (!deliveryFieldsValid) return false;

      // Debe tener una dirección seleccionada O estar usando dirección personalizada
      // O simplemente tener el campo address lleno (si no hay direcciones guardadas)
      const hasSelectedAddress = formData.selectedAddressId;
      const hasCustomAddress = formData.useCustomAddress && formData.address && formData.address.trim().length > 0;
      const hasAddressField = formData.address && formData.address.trim().length > 0;
      
      if (!hasSelectedAddress && !hasCustomAddress && !hasAddressField) return false;
      
      // Si hay dirección escrita, validar que no tenga errores
      if (formData.address && formData.address.trim().length > 0) {
        const addressError = validateField('address', formData.address, { deliveryType: 'delivery' });
        if (addressError) return false;
      }
    }

    // Si es pickup, validar que haya tienda seleccionada
    if (formData.deliveryType === 'pickup') {
      if (!formData.selectedStore || formData.selectedStore.trim().length === 0) {
        return false;
      }
    }

    return true;
  };

  const isStep2Valid = (paymentMethodId, cardInfo, metodosPago, selectedCardId) => {
    // Validar que haya método de pago seleccionado
    if (!paymentMethodId) {
      return false;
    }

    // Buscar el método seleccionado
    const selectedMethod = metodosPago.find(
      (m) => m.id.toString() === paymentMethodId || m.id === parseInt(paymentMethodId)
    );

    if (!selectedMethod) return false;

    // Si el método es Mercado Pago, no validar campos de tarjeta
    if (selectedMethod.nombre?.toLowerCase().includes('mercado pago')) {
      return true;
    }

    // Si es tarjeta de crédito/débito, validar campos
    if (selectedMethod.nombre?.toLowerCase().includes('tarjeta') || 
        selectedMethod.tipo?.toLowerCase() === 'tarjeta') {
      
      // Si hay una tarjeta guardada seleccionada, es válido
      if (selectedCardId && paymentMethodId === 'userCard') {
        return true;
      }

      // Si no hay tarjeta guardada, validar que todos los campos de tarjeta nueva estén completos
      if (!selectedCardId) {
        const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
        return cardFields.every(field => {
          const value = cardInfo?.[field] || '';
          if (!value || value.trim().length === 0) return false;
          const error = validateField(field, value);
          return !error;
        });
      }
    }

    // Para otros métodos (transferencia, yape, etc.), solo necesitan método seleccionado
    return true;
  };

  const clearErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    handleBlur,
    validateFieldAndUpdate,
    isStep1Valid,
    isStep2Valid,
    clearErrors
  };
};
