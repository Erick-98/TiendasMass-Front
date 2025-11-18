import React, { useState, useEffect } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';
import { API_URL } from '../../utils/constants';

const OrderReports = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      console.log('📦 Pedidos recibidos:', response.data);
  setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pedidos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const ordersPerPage = 10;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || order.estado === selectedStatus;
    
    const matchesDate = dateFilter === '' || 
      new Date(order.fechaPedido).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'entregado':
        return 'badge-success';
      case 'enviado':
        return 'badge-warning';
      case 'confirmado':
        return 'badge-info';
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

  const getTotalSales = () => {
    return filteredOrders.reduce((sum, order) => sum + parseFloat(order.montoTotal), 0);
  };

  const getOrdersByStatus = () => {
    const statusCount = {
      'pendiente': 0,
      'confirmado': 0,
      'enviado': 0,
      'entregado': 0,
      'cancelado': 0
    };

    filteredOrders.forEach(order => {
      statusCount[order.estado]++;
    });

    return statusCount;
  };

  const getItemsCount = (order) => {
    return order.detallesPedidos?.reduce((sum, detalle) => sum + detalle.cantidad, 0) || 0;
  };

  const handleExport = () => {
    const csvContent = [
      ['ID Pedido', 'Cliente', 'Total', 'Estado', 'Artículos', 'Fecha', 'Método de Pago', 'Estado Pago'],
      ...filteredOrders.map(order => [
        order.id,
        order.usuario?.nombre || 'N/A',
        order.montoTotal.toString(),
        getStatusText(order.estado),
        getItemsCount(order).toString(),
        new Date(order.fechaPedido).toLocaleDateString(),
        order.metodoPago?.nombre || 'N/A',
        order.estadoPago
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/${orderId}`, { estado: newStatus });
      
      // Actualizar la lista de pedidos
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, estado: newStatus } : order
      ));
      
      swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'El estado del pedido ha sido actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del pedido',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'confirmado', label: 'Confirmado' },
      { value: 'enviado', label: 'Enviado' },
      { value: 'entregado', label: 'Entregado' },
      { value: 'cancelado', label: 'Cancelado' }
    ];
    
    return allStatuses.filter(status => status.value !== currentStatus);
  };

  const statusCounts = getOrdersByStatus();

  const handlePrintOrder = (order) => {
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .customer-info, .order-details { margin-bottom: 15px; }
            .products-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .products-table th, .products-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .products-table th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
            .status-badge { 
              background-color: #007bff; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Tiendas Mass</h1>
            <h2>Pedido #${order.id}</h2>
            <p>Fecha: ${new Date(order.fechaPedido).toLocaleDateString()}</p>
          </div>
          
          <div class="order-info">
            <div class="customer-info">
              <h3>Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${order.usuario?.nombre || 'N/A'}</p>
              <p><strong>Email:</strong> ${order.usuario?.email || 'N/A'}</p>
              <p><strong>Dirección de Envío:</strong> ${order.direccionEnvio || 'N/A'}</p>
            </div>
            
            <div class="order-details">
              <h3>Detalles del Pedido</h3>
              <p><strong>Estado:</strong> <span class="status-badge">${getStatusText(order.estado)}</span></p>
              <p><strong>Método de Pago:</strong> ${order.metodoPago?.nombre || 'N/A'}</p>
              <p><strong>Estado de Pago:</strong> ${order.estadoPago}</p>
            </div>
          </div>
          
          ${order.detallesPedidos && order.detallesPedidos.length > 0 ? `
            <div class="products">
              <h3>Productos</h3>
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.detallesPedidos.map(detalle => `
                    <tr>
                      <td>${detalle.producto?.nombre || 'N/A'}</td>
                      <td>${detalle.cantidad}</td>
                      <td>S/.${parseFloat(detalle.precio).toFixed(2)}</td>
                      <td>S/.${(detalle.cantidad * parseFloat(detalle.precio)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="total">
            <p><strong>Total a Pagar: S/.${parseFloat(order.montoTotal).toFixed(2)}</strong></p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-reports fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Reportes de Pedidos</h1>
          <p className="text-muted">Analiza y gestiona los pedidos del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card blue">
            <div className="card-header">
              <h5 className="card-title">Total Pedidos</h5>
            </div>
            <h2 className="card-value">{filteredOrders.length}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card yellow">
            <div className="card-header">
              <h5 className="card-title">Ventas Totales</h5>
            </div>
            <h2 className="card-value">S/.{getTotalSales().toFixed(2)}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card success">
            <div className="card-header">
              <h5 className="card-title">Entregados</h5>
            </div>
            <h2 className="card-value">{statusCounts.entregado}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card danger">
            <div className="card-header">
              <h5 className="card-title">Pendientes</h5>
            </div>
            <h2 className="card-value">{statusCounts.pendiente}</h2>
          </div>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Pedidos</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: 'auto' }}
            />
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <button className="btn btn-mass-yellow" onClick={handleExport} disabled={loading}>
              <Download size={16} className="me-1" />
              Exportar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Artículos</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Estado Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>{order.usuario?.nombre || 'N/A'}</td>
                  <td><strong>S./{parseFloat(order.montoTotal).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.estado)}`}>
                      {getStatusText(order.estado)}
                    </span>
                  </td>
                  <td>{getItemsCount(order)} items</td>
                  <td>{new Date(order.fechaPedido).toLocaleDateString()}</td>
                  <td>{order.metodoPago?.nombre || 'N/A'}</td>
                  <td>
                    <span className={`badge ${order.estadoPago === 'completado' ? 'badge-success' : 'badge-warning'}`}>
                      {order.estadoPago}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-view"
                      onClick={() => setShowOrderDetails(order)}
                      title="Ver detalles"
                    >
                      <Eye size={14} />
                    </button>
                    <div className="dropdown d-inline-block ms-1">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        disabled={loading}
                      >
                        Estado
                      </button>
                      <ul className="dropdown-menu">
                        {getStatusOptions(order.estado).map(status => (
                          <li key={status.value}>
                            <button
                              className="dropdown-item"
                              onClick={() => handleUpdateStatus(order.id, status.value)}
                            >
                              {status.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Modal de Detalles */}
      {showOrderDetails && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Pedido #{showOrderDetails.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Información del Cliente</h6>
                    <p><strong>Nombre:</strong> {showOrderDetails.usuario?.nombre || 'N/A'}</p>
                    <p><strong>Email:</strong> {showOrderDetails.usuario?.email || 'N/A'}</p>
                    <p><strong>Fecha del Pedido:</strong> {new Date(showOrderDetails.fechaPedido).toLocaleDateString()}</p>
                    <p><strong>Dirección de Envío:</strong> {showOrderDetails.direccionEnvio || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Información del Pedido</h6>
                    <p><strong>Estado:</strong> 
                      <span className={`badge ${getStatusBadge(showOrderDetails.estado)} ms-2`}>
                        {getStatusText(showOrderDetails.estado)}
                      </span>
                    </p>
                    <div className="mb-2">
                      <strong>Cambiar Estado:</strong>
                      <div className="dropdown d-inline-block ms-2">
                        <button
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          disabled={loading}
                        >
                          Cambiar
                        </button>
                        <ul className="dropdown-menu">
                          {getStatusOptions(showOrderDetails.estado).map(status => (
                            <li key={status.value}>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  handleUpdateStatus(showOrderDetails.id, status.value);
                                  setShowOrderDetails(null);
                                }}
                              >
                                {status.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p><strong>Método de Pago:</strong> {showOrderDetails.metodoPago?.nombre || 'N/A'}</p>
                    <p><strong>Estado de Pago:</strong> 
                      <span className={`badge ${showOrderDetails.estadoPago === 'completado' ? 'badge-success' : 'badge-warning'} ms-2`}>
                        {showOrderDetails.estadoPago}
                      </span>
                    </p>
                    <p><strong>Total de Artículos:</strong> {getItemsCount(showOrderDetails)}</p>
                    <p><strong>Total a Pagar:</strong> <span className="text-mass-blue fw-bold">S/.{parseFloat(showOrderDetails.montoTotal).toFixed(2)}</span></p>
                  </div>
                </div>
                
                {/* Detalles de productos */}
                {showOrderDetails.detallesPedidos && showOrderDetails.detallesPedidos.length > 0 && (
                  <div className="mt-4">
                    <h6>Productos del Pedido</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showOrderDetails.detallesPedidos.map((detalle, index) => (
                            <tr key={index}>
                              <td>{detalle.producto?.nombre || 'N/A'}</td>
                              <td>{detalle.cantidad}</td>
                              <td>S/.{parseFloat(detalle.precio).toFixed(2)}</td>
                              <td>S/.{(detalle.cantidad * parseFloat(detalle.precio)).toFixed(2)}</td>
                            </tr>
                            ))}
                          </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderDetails(null)}
                >
                  Cerrar
                </button>
                <button type="button" className="btn btn-mass-blue" onClick={() => handlePrintOrder(showOrderDetails)}>
                  Imprimir Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReports;