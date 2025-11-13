import { useState } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import './productcard.css';
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

export default function ProductCard({ producto, onAdd, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(producto)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="image-container"
        style={{
          backgroundColor: categoriaColors[producto.categoria?.id] || '#5EEAD4',
        }}
      >
        <img
          src={`${API_URL}/${producto.imagen}`}

          alt={producto.nombre}
          className={`product-image ${isHovered ? 'hovered' : ''}`}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{producto.nombre}</h3>
        <h2 className="product-brand">{producto.marca}</h2>
        <p className="product-description">{producto.descripcion}</p>
        <p className="product-price">S/ {parseFloat(producto.precio).toFixed(2)}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd({ ...producto, cantidad: quantity });
          }}
          className="add-cart-btn"
        >
          <ShoppingCart size={18} />
          <span>Añadir al carrito</span>
        </button>
      </div>
    </div>
  );
}

