import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCarrito } from '../../context/carContext';
import { useUsuario } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from './productCard';

const API_URL = "http://localhost:443";
const Productos = ({ categoriaId,onProductClick }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const { agregarProducto, carrito } = useCarrito();
  const { usuario } = useUsuario();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = categoriaId
          ? `${API_URL}/api/products?categoriaId=${categoriaId}`
          : `${API_URL}/api/products`;
        const res = await axios.get(url);
        setProductos(res.data);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [categoriaId]);

  const handleAgregar = (productoConCantidad) => {
    agregarProducto(productoConCantidad);

    setTimeout(() => setMensaje(null), 3000);
  };

  const handleRealizarPago = () => {
    if (!usuario) {
      alert('Debes iniciar sesión para realizar el pago.');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (productos.length === 0) return <p>No hay productos para esta categoría.</p>;

  return (
    <div className="productos-container">


      {mensaje && (
        <div
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '12px',
            fontWeight: '600',
            maxWidth: '300px',
          }}
        >
          {mensaje}
        </div>
      )}

      <div
        className="productos-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
          gap: '1.5rem',
        }}
      >
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            onAdd={handleAgregar}
            onClick={() => onProductClick && onProductClick(producto)} // Llama a la función cuando se hace clic
          />
        ))}
      </div>




    </div>
  );
};

export default Productos;
