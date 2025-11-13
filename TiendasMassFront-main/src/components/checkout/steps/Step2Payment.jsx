import React from 'react';
import { CreditCard } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { MercadoPagoButton } from '../components/MercadoPagoButton';

/**
 * Paso 2: Selección de método de pago
 */
export const Step2Payment = ({
  metodosPago,
  userCards,
  paymentMethod,
  cardInfo,
  errors,
  selectedCardId,
  setSelectedCardId,
  handlePaymentMethodChange,
  onCardChange,
  handleBlur,
  handleMercadoPago,
  loading = false,
}) => {
  
  // Función para manejar selección de tarjeta guardada
  const handleSavedCardSelect = (tarjeta) => {
    // Marcar que se usará una tarjeta guardada
    handlePaymentMethodChange('userCard');
    if (setSelectedCardId) {
      setSelectedCardId(tarjeta.id.toString());
    }
  };

  return (
    <>
      <div className="section-box payment-section">
        <h2>
          <span>3</span> Método de Pago
        </h2>

        <div className="payment-options">
          {/* Tarjetas guardadas del usuario */}
          {userCards && userCards.length > 0 && (
            <div className="user-cards-section">
              <h4>Mis Tarjetas Guardadas</h4>
              {userCards.map((tarjeta) => (
                <label
                  key={`card-${tarjeta.id}`}
                  className={`payment-option ${
                    paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString() 
                      ? 'selected' 
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={`card-${tarjeta.id}`}
                    checked={paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString()}
                    onChange={() => handleSavedCardSelect(tarjeta)}
                  />
                  <div className="payment-labels">
                    <strong>{tarjeta.tipoTarjeta}</strong>
                    <small>{tarjeta.numeroEnmascarado}</small>
                    <small>Expira: {tarjeta.fechaVencimiento}</small>
                  </div>
                  <div className="payment-logos">
                    <CreditCard size={20} />
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Separador */}
          {userCards && userCards.length > 0 && metodosPago.length > 0 && (
            <div className="payment-separator">
              <span>O usar otro método de pago</span>
            </div>
          )}

          {/* Métodos de pago genéricos */}
          {metodosPago.length > 0 ? (
            metodosPago.map((metodo) => (
              <label
                key={metodo.id}
                className={`payment-option ${
                  paymentMethod === metodo.id.toString() ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={metodo.id.toString()}
                  checked={paymentMethod === metodo.id.toString()}
                  onChange={() => handlePaymentMethodChange(metodo.id)}
                />
                <div className="payment-labels">
                  <strong>{metodo.nombre}</strong>
                  <small>{metodo.descripcion}</small>
                  {metodo.comision > 0 && (
                    <small>Comisión: {metodo.comision}%</small>
                  )}
                </div>
                {metodo.logo && (
                  <div className="payment-logos">
                    <img src={metodo.logo} alt={metodo.nombre} />
                  </div>
                )}
              </label>
            ))
          ) : (
            <div className="no-payment-methods">
              <p>Cargando métodos de pago...</p>
            </div>
          )}
        </div>

        {/* Formulario de tarjeta si se selecciona tarjeta */}
        {paymentMethod && (() => {
          const selectedMethod = metodosPago.find(
            (m) => m.id.toString() === paymentMethod
          );
          const isCardMethod =
            selectedMethod?.tipo === 'tarjeta' ||
            selectedMethod?.nombre?.toLowerCase().includes('tarjeta');

          return (
            isCardMethod && !selectedCardId && (
              <div className="card-form">
                <div className="form-row">
                  <label>Número de Tarjeta *</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'error' : ''}
                    value={cardInfo.cardNumber || ''}
                    onChange={(e) => onCardChange('cardNumber', e.target.value)}
                    onBlur={() => handleBlur('cardNumber')}
                    maxLength="19"
                    required
                  />
                  <ErrorMessage error={errors.cardNumber} />
                </div>
                <div className="form-row split-2">
                  <div>
                    <label>Fecha de Vencimiento *</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className={errors.cardExpiry ? 'error' : ''}
                      value={cardInfo.cardExpiry || ''}
                      onChange={(e) => onCardChange('cardExpiry', e.target.value)}
                      onBlur={() => handleBlur('cardExpiry')}
                      maxLength="5"
                      required
                    />
                    <ErrorMessage error={errors.cardExpiry} />
                  </div>
                  <div>
                    <label>CVV *</label>
                    <input
                      type="text"
                      placeholder="123"
                      className={errors.cardCVV ? 'error' : ''}
                      value={cardInfo.cardCVV || ''}
                      onChange={(e) => onCardChange('cardCVV', e.target.value)}
                      onBlur={() => handleBlur('cardCVV')}
                      maxLength="4"
                      required
                    />
                    <ErrorMessage error={errors.cardCVV} />
                  </div>
                </div>
                <div className="form-row">
                  <label>Nombre en la Tarjeta *</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    className={errors.cardName ? 'error' : ''}
                    value={cardInfo.cardName || ''}
                    onChange={(e) => onCardChange('cardName', e.target.value)}
                    onBlur={() => handleBlur('cardName')}
                    required
                  />
                  <ErrorMessage error={errors.cardName} />
                </div>
              </div>
            )
          );
        })()}
      </div>

      {/* Botón Mercado Pago */}
      {paymentMethod && (() => {
        const selectedMethod = metodosPago.find(
          (m) => m.id.toString() === paymentMethod
        );
        const isMercadoPago =
          selectedMethod?.nombre?.toLowerCase().includes('mercado pago') ||
          selectedMethod?.tipo?.toLowerCase() === 'mercadopago';

        return (
          isMercadoPago && handleMercadoPago && (
            <MercadoPagoButton 
              onClick={handleMercadoPago}
              loading={loading}
            />
          )
        );
      })()}
    </>
  );
};

export default Step2Payment;
