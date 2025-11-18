import React from 'react';
import { User, Mail, Phone, Truck, Store, MapPin } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { parsePrice } from '../utils/formatters';

import { API_URL } from '../../../utils/constants';

const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/+$/g, '')
    : String(API_URL).replace(/\/+$/g, '');

const imageBase = API_BASE;

/**
 * Paso 1: Envío y datos del usuario
 */
export const Step1Shipping = ({
  carrito,
  formData,
  errors,
  userAddresses,
  selectedAddressId,
  useCustomAddress,
  usuario,
  shippingCost,
  handleFieldChange,
  handleBlur,
  handleDeliveryTypeChange,
  handleAddressChange,
  aumentarCantidad,
  disminuirCantidad,
  quitarProducto,
}) => {
  return (
    <>
      {/* Resumen de Productos */}
      <div className="section-box payment-section">
        <h2>
          <span>1</span> Resumen de Productos
        </h2>

        {carrito.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          carrito.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={
                  item.imagen
                    ? `${String(imageBase).replace(/\/$/, '')}/${String(
                        item.imagen
                      ).replace(/^\//, '')}`
                    : '/placeholder-image.jpg'
                }
                alt={item.nombre}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />

              <div className="cart-item-info">
                <strong>
                  {item.title || item.nombre || 'Producto sin nombre'}
                </strong>
                <small>S/.{parsePrice(item.precio).toFixed(2)} c/u</small>
              </div>
              <div className="cart-item-actions">
                <button
                  onClick={() => disminuirCantidad(item.id)}
                  disabled={item.cantidad <= 1}
                >
                  -
                </button>
                <span>{item.cantidad}</span>
                <button onClick={() => aumentarCantidad(item.id)}>+</button>
                <button
                  className="remove"
                  onClick={() => quitarProducto(item.id)}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              </div>
              <div className="cart-item-total">
                S/.{(parsePrice(item.precio) * item.cantidad).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de Envío */}
      <div className="section-box shipping-form-container active">
        <div className="shipping-header">
          <div className="shipping-step-badge selected">2</div>
          <h2 className="shipping-title">Información de Envío</h2>
        </div>

        {/* Opciones de entrega */}
        <div className="delivery-options">
          <button
            className={`delivery-btn ${
              formData.deliveryType === 'delivery' ? 'selected' : ''
            }`}
            onClick={() => handleDeliveryTypeChange('delivery')}
          >
            <Truck className="delivery-icon" />
            <div>
              <div className="delivery-label">Envío a Domicilio</div>
              <div className="delivery-sub">
                Recibe en tu dirección (S/.{shippingCost.toFixed(2)})
              </div>
            </div>
          </button>
          <button
            className={`delivery-btn ${
              formData.deliveryType === 'pickup' ? 'selected' : ''
            }`}
            onClick={() => handleDeliveryTypeChange('pickup')}
          >
            <Store className="delivery-icon" />
            <div>
              <div className="delivery-label">Recojo en Tienda</div>
              <div className="delivery-sub">Retira en nuestro local (Gratis)</div>
            </div>
          </button>
        </div>

        {/* Formulario */}
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">
              <User className="form-icon" />
              Nombre Completo *
            </label>
            <input
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              required
              value={formData.fullName || ''}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Juan Pérez García"
            />
            <ErrorMessage error={errors.fullName} />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail className="form-icon" />
              Correo Electrónico *
            </label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="ejemplo@correo.com"
            />
            <ErrorMessage error={errors.email} />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone className="form-icon" />
              Teléfono *
            </label>
            <input
              className={`form-input ${errors.phone ? 'error' : ''}`}
              type="tel"
              required
              value={formData.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="987654321"
              maxLength="9"
            />
            <ErrorMessage error={errors.phone} />
          </div>

          {/* Selector de tienda para pickup */}
          {formData.deliveryType === 'pickup' && (
            <div className="form-group full">
              <label className="form-label">
                <Store className="form-icon" />
                Seleccionar Tienda *
              </label>
              <select
                className={`form-select ${errors.selectedStore ? 'error' : ''}`}
                value={formData.selectedStore || ''}
                onChange={(e) =>
                  handleFieldChange('selectedStore', e.target.value)
                }
                onBlur={() => handleBlur('selectedStore')}
                required
              >
                <option value="">Seleccionar tienda</option>
                <option value="Centro – Av. Principal 123">
                  Centro – Av. Principal 123
                </option>
                <option value="Norte – Calle Comercial 456">
                  Norte – Calle Comercial 456
                </option>
                <option value="Sur – Plaza Shopping 789">
                  Sur – Plaza Shopping 789
                </option>
                <option value="Este – Mall Central 101">
                  Este – Mall Central 101
                </option>
              </select>
              <ErrorMessage error={errors.selectedStore} />
            </div>
          )}

          {/* Dirección para delivery */}
          {formData.deliveryType === 'delivery' && (
            <>
              {usuario && userAddresses && userAddresses.length > 0 && (
                <div className="form-group full">
                  <label className="form-label">
                    <MapPin className="form-icon" />
                    Seleccionar Dirección
                  </label>
                  <div className="address-selector">
                    <select
                      className="form-select"
                      value={selectedAddressId}
                      onChange={(e) => handleAddressChange(e.target.value)}
                    >
                      <option value="">Seleccionar dirección guardada</option>
                      {userAddresses.map((address) => (
                        <option key={address.id} value={address.id.toString()}>
                          {address.nombre} - {address.calle}, {address.ciudad}
                          {address.esPrincipal && ' (Principal)'}
                        </option>
                      ))}
                      <option value="custom">+ Agregar dirección nueva</option>
                    </select>
                  </div>
                </div>
              )}

              {(useCustomAddress || !usuario || userAddresses.length === 0) && (
                <>
                  <div className="form-group full">
                    <label className="form-label">
                      <MapPin className="form-icon" />
                      Dirección *
                    </label>
                    <input
                      className={`form-input ${errors.address ? 'error' : ''}`}
                      required
                      value={formData.address || ''}
                      onChange={(e) =>
                        handleFieldChange('address', e.target.value)
                      }
                      onBlur={() => handleBlur('address')}
                      placeholder="Calle, número, departamento"
                    />
                    <ErrorMessage error={errors.address} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad *</label>
                    <input
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      required
                      value={formData.city || ''}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      placeholder="Lima, Arequipa, etc."
                    />
                    <ErrorMessage error={errors.city} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código Postal *</label>
                    <input
                      className={`form-input ${errors.zipCode ? 'error' : ''}`}
                      required
                      value={formData.zipCode || ''}
                      onChange={(e) =>
                        handleFieldChange('zipCode', e.target.value)
                      }
                      onBlur={() => handleBlur('zipCode')}
                      placeholder="15001"
                      maxLength="5"
                    />
                    <ErrorMessage error={errors.zipCode} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Step1Shipping;
