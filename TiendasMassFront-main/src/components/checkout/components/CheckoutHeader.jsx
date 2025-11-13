import React from 'react';
import { FaTruck, FaCreditCard, FaCheck, FaShieldAlt } from 'react-icons/fa';

/**
 * Header del checkout con indicador de pasos
 */
export const CheckoutHeader = ({ activeStep }) => {
  const steps = [
    { id: 1, icon: <FaTruck />, label: 'Envío' },
    { id: 2, icon: <FaCreditCard />, label: 'Pago' },
    { id: 3, icon: <FaCheck />, label: 'Confirmación' },
  ];

  return (
    <header className="checkout-header">
      <div className="header-top">
        <h1>Checkout</h1>
        <div className="secure-header">
          <span className="shield-icon"></span>
          <FaShieldAlt />
          Compra 100% segura
        </div>
      </div>
      <div className="steps">
        {steps.map((s) => (
          <div
            key={s.id}
            className={
              `step ` +
              (activeStep > s.id ? 'completed ' : '') +
              (activeStep === s.id ? 'active' : '')
            }
          >
            <div className="step-content">
              <span className="step-icon">{s.icon}</span>
              <span className="step-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
};

export default CheckoutHeader;
