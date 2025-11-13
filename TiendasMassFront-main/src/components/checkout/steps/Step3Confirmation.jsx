import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { getPaymentStatusText, getPaymentStatusColor } from '../utils/paymentStatus';

/**
 * Paso 3: Confirmación del pedido
 */
export const Step3Confirmation = ({ pedidoCreado }) => {
  if (!pedidoCreado) return null;

  return (
    <div className="section-box confirmation-section">
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <FaCheck />
        </div>
        <h2>¡Pedido Confirmado!</h2>
        <p>
          Gracias por tu compra. Tu pedido ha sido procesado
          exitosamente.
        </p>

        <div className="order-details">
          <h3>Detalles del Pedido</h3>
          <div className="detail-row">
            <span>Número de Pedido:</span>
            <strong>#{pedidoCreado.id}</strong>
          </div>
          <div className="detail-row">
            <span>Método de Pago:</span>
            <strong>{pedidoCreado.metodoPago?.nombre || 'N/A'}</strong>
          </div>
          <div className="detail-row">
            <span>Estado del Pago:</span>
            <strong
              style={{
                color: getPaymentStatusColor(pedidoCreado.estadoPago),
              }}
            >
              {getPaymentStatusText(pedidoCreado.estadoPago)}
            </strong>
          </div>
          <div className="detail-row">
            <span>Estado del Pedido:</span>
            <strong>{pedidoCreado.estado}</strong>
          </div>
          <div className="detail-row">
            <span>Dirección de Entrega:</span>
            <strong>{pedidoCreado.direccionEnvio}</strong>
          </div>
        </div>

        <div className="order-products">
          <h3>Productos Pedidos</h3>
          {(pedidoCreado.detallesPedidos || []).map((item, index) => (
            <div key={index} className="order-product-item">
              <span>
                {item.nombre ||
                  item.producto?.nombre ||
                  'Producto sin nombre'}
              </span>
              <span>x{item.cantidad}</span>
              <span>
                S/.{((item.precio || 0) * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="order-total">
            <span>Total:</span>
            <strong>
              S/.{(pedidoCreado.montoTotal || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="next-steps">
          <h3>Próximos Pasos</h3>
          <p>
            Recibirás un email de confirmación con los detalles de tu
            pedido y el seguimiento.
          </p>
          <p>Tu pedido será procesado en los próximos días hábiles.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default Step3Confirmation;
