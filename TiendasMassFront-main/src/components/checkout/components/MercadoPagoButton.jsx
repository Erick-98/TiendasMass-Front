import React from 'react';
import './MercadoPagoButton.css';

/**
 * Botón personalizado para Mercado Pago con loading
 */
export const MercadoPagoButton = ({ onClick, loading = false, disabled = false }) => {
  return (
    <button
      className={`mp-button ${loading ? 'mp-button--loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <span className="mp-button__spinner"></span>
          <span>Preparando pago...</span>
        </>
      ) : (
        <>
          <svg className="mp-button__icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm24.7 67.1c-1.8 5.4-6.7 9.3-12.5 9.3H37.8c-5.8 0-10.7-3.9-12.5-9.3L20 50l5.3-17.1c1.8-5.4 6.7-9.3 12.5-9.3h24.4c5.8 0 10.7 3.9 12.5 9.3L80 50l-5.3 17.1z" fill="currentColor"/>
          </svg>
          <span>Pagar con Mercado Pago</span>
        </>
      )}
    </button>
  );
};

export default MercadoPagoButton;
