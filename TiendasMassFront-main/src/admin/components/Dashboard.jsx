import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../utils/constants';
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    estadisticas: {
      totalProductos: 0,
      totalUsuarios: 0,
      totalPedidos: 0,
      pedidosHoy: 0,
      ventasTotales: 0,
      ventasMes: 0
    },
    cambios: {
      productos: '+0%',
      usuarios: '+0%',
      pedidosHoy: '+0%',
      ventasMes: '+0%'
    },
    estadisticasPorEstado: {},
    topProductos: [],
    pedidosRecientes: []
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard desde el backend
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/estadisticas`);
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos del dashboard'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Productos',
      value: dashboardData.estadisticas.totalProductos.toLocaleString(),
      change: dashboardData.cambios.productos,
      changeType: dashboardData.cambios.productos.startsWith('+') ? 'positive' : 'negative',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Usuarios Activos',
      value: dashboardData.estadisticas.totalUsuarios.toLocaleString(),
      change: dashboardData.cambios.usuarios,
      changeType: dashboardData.cambios.usuarios.startsWith('+') ? 'positive' : 'negative',
      icon: Users,
      color: 'success'
    },
    {
      title: 'Pedidos Hoy',
      value: dashboardData.estadisticas.pedidosHoy.toString(),
      change: dashboardData.cambios.pedidosHoy,
      changeType: dashboardData.cambios.pedidosHoy.startsWith('+') ? 'positive' : 'negative',
      icon: ShoppingCart,
      color: 'yellow'
    },
    {
      title: 'Ventas del Mes',
      value: `S/.${dashboardData.estadisticas.ventasMes.toFixed(2)}`,
      change: dashboardData.cambios.ventasMes,
      changeType: dashboardData.cambios.ventasMes.startsWith('+') ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'danger'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'entregado':
        return 'badge-success';
      case 'enviado':
        return 'badge-info';
      case 'confirmado':
        return 'badge-warning';
      case 'pendiente':
        return 'badge-primary';
      case 'cancelado':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'entregado':
        return 'Entregado';
      case 'enviado':
        return 'Enviado';
      case 'confirmado':
        return 'Confirmado';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard fade-in">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-mass-blue mb-0">Dashboard</h1>
            <p className="text-muted">Resumen general del sistema</p>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-mass-blue" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Dashboard</h1>
          <p className="text-muted">Resumen general del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="col-xl-3 col-md-6 mb-3">
              <div className={`stats-card ${stat.color}`}>
                <div className="card-header">
                  <h5 className="card-title">{stat.title}</h5>
                  <div className={`card-icon ${stat.color}`}>
                    <IconComponent size={20} />
                  </div>
                </div>
                <h2 className="card-value">{stat.value}</h2>
                <p className={`card-change ${stat.changeType}`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {stat.change} desde el mes pasado
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row">
        {/* Pedidos Recientes */}
        <div className="col-lg-8 mb-4">
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Pedidos Recientes</h3>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.pedidosRecientes.length > 0 ? (
                    dashboardData.pedidosRecientes.map((order) => (
                      <tr key={order.id}>
                        <td><strong>#{order.id}</strong></td>
                        <td>{order.cliente}</td>
                        <td><strong>S/.{order.total.toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.estado)}`}>
                            {getStatusText(order.estado)}
                          </span>
                        </td>
                        <td>{formatDate(order.fecha)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No hay pedidos recientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="col-lg-4 mb-4">
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Top Productos</h3>
            </div>
            <div className="p-3">
              {dashboardData.topProductos.length > 0 ? (
                dashboardData.topProductos.map((product, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-bold text-truncate" style={{maxWidth: '150px'}}>
                        {product.nombre}
                      </div>
                      <small className="text-muted">{product.vendidos} vendidos</small>
                    </div>
                    <div className="text-end">
                      <strong className="text-mass-blue">S/.{product.ingresos.toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No hay productos vendidos aún
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;