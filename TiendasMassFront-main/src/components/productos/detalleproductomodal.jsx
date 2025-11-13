import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCarrito } from '../../context/carContext';
import './detalleproducto.css';

const API_URL = "http://localhost:443";

const categoriaColors = {
  1: '#33DDC8',
  2: '#7ACEFC',
  3: '#33DDC8',
  4: '#B097DF',
  5: '#B097DF',
  6: '#F5DB3D',
  7: '#F5DB3D',
  8: '#FBBF24',
};

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { agregarProducto } = useCarrito();

  if (!product) return null;

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const categoriaColor = categoriaColors[product.categoria?.id] || '#5EEAD4';

  return (
    <div className={`modal fade ${isOpen ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content shadow rounded-4 overflow-hidden">

          {/* Header */}
          <div className="modal-header custom-header border-bottom-0">
            <h5 className="modal-title custom-title fw-bold">{product.nombre}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-4">
              
              {/* Imagen con fondo circular por categoría */}
              <div className="col-md-5 d-flex justify-content-center align-items-center">
                <div
                  className="circle-background"
                  style={{ backgroundColor: categoriaColor }}
                >
                  <img
                    src={`${API_URL}/${product.imagen}`}
                    alt={product.nombre}
                    className="img-fluid rounded object-fit-contain"
                    style={{ maxHeight: '240px', maxWidth: '340px' }}
                  />
                </div>
              </div>

              {/* Detalles */}
              <div className="col-md-7">
                <p className="custom-description">{product.descripcion}</p>

                {product.marca && (
                  <p className="mb-2"><strong>Marca:</strong> {product.marca}</p>
                )}

                <h3 className="custom-price fw-bold mb-3">S/ {parseFloat(product.precio).toFixed(2)}</h3>

                {/* Cantidad */}
                <div className="d-flex align-items-center mb-4">
                  <span className="fw-bold me-3">Cantidad:</span>
                  <div className="btn-group" role="group">
                    <button className="custom-btn-quantity" onClick={decrementQuantity}>
                      <Minus size={16} />
                    </button>
                    <button className="custom-btn-display px-4 disabled">{quantity}</button>
                    <button className="custom-btn-quantity" onClick={incrementQuantity}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Botón Agregar al carrito */}
                <button
                  className="custom-btn-add-cart w-100 py-2 fs-5 d-flex justify-content-center align-items-center gap-2"
                  onClick={() => {
                    agregarProducto({ ...product, cantidad: quantity });
                    onClose();
                  }}
                >
                  <ShoppingCart size={20} />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
