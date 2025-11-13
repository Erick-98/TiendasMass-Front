import React from 'react';
import { FaLock } from 'react-icons/fa';
import { IoReloadCircle } from 'react-icons/io5';
import { parsePrice } from '../utils/formatters';

/**
 * Sidebar con resumen del pedido
 */
export const OrderSummary = ({
  carrito,
  pedidoCreado,
  activeStep,
  subtotal,
  shippingCost,
  taxes,
  total,
  loading,
  isStep1Valid,
  isStep2Valid,
  onNext,
}) => {
  return (
    <aside className="right">
      <div className="order-summary">
        <h3>Resumen del Pedido</h3>

        <div className="order-items">
          {activeStep === 3 && pedidoCreado ? (
            (pedidoCreado.detallesPedidos || []).map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">
                    {item.nombre ||
                      item.producto?.nombre ||
                      'Producto sin nombre'}
                  </span>
                  <span className="item-quantity">x{item.cantidad}</span>
                </div>
                <span className="item-price">
                  S/.{((item.precio || 0) * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))
          ) : carrito.length > 0 ? (
            carrito.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-name">
                    {item.title || item.nombre}
                  </span>
                  <span className="item-quantity">x{item.cantidad}</span>
                </div>
                <span className="item-price">
                  S/.{(parsePrice(item.precio) * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div>No hay productos en el carrito.</div>
          )}
        </div>

        <hr />

        <div className="summary-row">
          <span>
            Subtotal (
            {activeStep === 3
              ? pedidoCreado?.detallesPedidos?.length || 0
              : carrito.length}{' '}
            productos)
          </span>
          <span>
            S/.
            {(activeStep === 3
              ? pedidoCreado?.resumen?.subtotal || 0
              : subtotal
            ).toFixed(2)}
          </span>
        </div>
        <div className="summary-row">
          <span>Envío</span>
          <span>
            S/.
            {(activeStep === 3
              ? pedidoCreado?.resumen?.shippingCost || 0
              : shippingCost
            ).toFixed(2)}
          </span>
        </div>
        <div className="summary-row">
          <span>Impuestos</span>
          <span>
            S/.
            {(activeStep === 3
              ? pedidoCreado?.resumen?.taxes || 0
              : taxes
            ).toFixed(2)}
          </span>
        </div>
        <div className="summary-total">
          <strong>Total</strong>
          <strong>
            S/.
            {(activeStep === 3
              ? pedidoCreado?.resumen?.total ||
                pedidoCreado?.montoTotal ||
                0
              : total
            ).toFixed(2)}
          </strong>
        </div>

        <div className="secure-box">
          <p>
            <FaLock /> Pago 100% seguro
          </p>
          <p>
            <IoReloadCircle /> Devoluciones fáciles 30 días
          </p>
        </div>

        {activeStep < 3 && (
          <button
            className="place-order"
            onClick={onNext}
            disabled={
              loading ||
              (activeStep === 1 && !isStep1Valid) ||
              (activeStep === 2 && !isStep2Valid)
            }
          >
            {loading
              ? 'Procesando...'
              : activeStep === 1
              ? 'Continuar'
              : 'Realizar Pedido'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default OrderSummary;
