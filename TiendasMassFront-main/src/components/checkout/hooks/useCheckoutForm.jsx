import { useState } from 'react';
import { formatCardNumber, formatCardExpiry } from '../utils/formatters';

export const useCheckoutForm = (onChange, validation, formData) => {
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    onChange(fieldName, value);
    
    // Validar el campo si ya fue tocado, pasando el deliveryType como contexto
    if (validation.touched[fieldName]) {
      validation.validateFieldAndUpdate(fieldName, value, { 
        deliveryType: formData?.deliveryType 
      });
    }
  };

  const onCardChange = (field, value) => {
    let formattedValue = value;
    
    // Formatear según el campo
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'cardExpiry') {
      formattedValue = formatCardExpiry(value);
    } else if (field === 'cardCVV') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    const newCardInfo = { ...cardInfo, [field]: formattedValue };
    setCardInfo(newCardInfo);
    onChange('cardInfo', newCardInfo);
    
    // Validar el campo si ya fue tocado
    if (validation.touched[field]) {
      validation.validateFieldAndUpdate(field, formattedValue);
    }
  };

  const handleAddressChange = (addressId, useCustom) => {
    setSelectedAddressId(addressId);
    setUseCustomAddress(useCustom);
    onChange('selectedAddressId', addressId);
    onChange('useCustomAddress', useCustom);
  };

  const handlePaymentMethodChange = (methodId) => {
    // Guardar el ID del método como string
    const methodIdStr = typeof methodId === 'object' ? methodId.id.toString() : methodId.toString();
    
    setPaymentMethod(methodIdStr);
    onChange('paymentMethodId', methodIdStr);
  };

  const handleDeliveryTypeChange = (type) => {
    onChange('deliveryType', type);
    // Si cambia a pickup, limpiar validaciones de dirección
    if (type === 'pickup') {
      validation.validateFieldAndUpdate('address', '', { deliveryType: 'pickup' });
    }
  };

  return {
    cardInfo,
    paymentMethod,
    selectedCardId,
    selectedAddressId,
    useCustomAddress,
    setSelectedCardId,
    handleFieldChange,
    onCardChange,
    handleAddressChange,
    handlePaymentMethodChange,
    handleDeliveryTypeChange
  };
};
