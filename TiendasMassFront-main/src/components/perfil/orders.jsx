import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../context/userContext'; // Asegúrate de tener este contexto
import './styleperfil.css';
const API_URL = "http://localhost:443";

const Orders = () => {
  const { usuario } = useUsuario();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!usuario?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/pedidos/usuario/${usuario.id}`);

        const data = await res.json();
        console.log('Respuesta del backend:', data);

        const pedidosFormateados = (data.pedidos || []).map(p => ({
          id: p.id,
          fecha: p.fechaPedido,
          items: p.detallesPedidos,
          total: parseFloat(p.montoTotal),
          status: p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
        }));

        setOrders(pedidosFormateados);
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [usuario]);


  const totalGastado = orders.reduce((acc, o) => acc + parseFloat(o.total), 0).toFixed(2);
  const pedidosEnProceso = orders.filter(o => o.status === 'En Proceso').length;

  return (
    <div className="orders-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mis Pedidos</h2>
          <p>Historial de todas tus compras</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Pedidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">S/ {totalGastado}</div>
          <div className="stat-label">Gastado Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pedidosEnProceso}</div>
          <div className="stat-label">En Proceso</div>
        </div>
      </div>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p>No tienes pedidos aún.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-main">
                <div className="order-info">
                  <div className="order-id">Pedido #{order.id}</div>
                  <div className="order-date">{new Date(order.fecha).toLocaleDateString()}</div>
                  <div className="order-items">{order.items.length} productos</div>
                </div>
                <div className="order-status-section">
                  <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                    {order.status}
                  </span>
                  <div className="order-total">S/ {parseFloat(order.total).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
