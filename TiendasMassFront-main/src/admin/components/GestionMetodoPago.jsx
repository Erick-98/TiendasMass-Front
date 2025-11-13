import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = "http://localhost:443";

const PaymentMethodManager = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    comision: 0
  });

  // Cargar métodos de pago desde el backend
  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
  const response = await fetch(`${API_URL}/api/metodos-pago`);
      if (!response.ok) {
        throw new Error('Error al cargar métodos de pago');
      }
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los métodos de pago'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const filteredMethods = paymentMethods.filter(method =>
    method.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (method.descripcion && method.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      nombre: method.nombre,
      descripcion: method.descripcion || '',
      comision: method.comision || 0
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      nombre: '',
      descripcion: '',
      comision: 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const url = editingMethod 
        ? `${API_URL}/api/metodos-pago/${editingMethod.id}`
        : `${API_URL}/api/metodos-pago`;
      
      const method = editingMethod ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      const result = await response.json();
      
      if (editingMethod) {
        setPaymentMethods(paymentMethods.map(m =>
          m.id === editingMethod.id ? result : m
        ));
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Método de pago actualizado correctamente'
        });
      } else {
        setPaymentMethods([result, ...paymentMethods]);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Método de pago creado correctamente'
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error en la operación'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/metodos-pago/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar');
        }

        setPaymentMethods(paymentMethods.filter(m => m.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Método de pago eliminado correctamente'
        });
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar método de pago'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="payment-method-manager fade-in">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-mass-blue mb-0">Métodos de Pago</h1>
            <p className="text-muted">Gestiona los métodos de pago disponibles en el sistema</p>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-mass-blue" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-method-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Métodos de Pago</h1>
          <p className="text-muted">Gestiona los métodos de pago disponibles en el sistema</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Métodos de Pago</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar métodos de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Método
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Método</th>
                <th>Descripción</th>
                <th>Comisión</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMethods.map((method) => (
                <tr key={method.id}>
                  <td><strong>{method.nombre}</strong></td>
                  <td>{method.descripcion || 'Sin descripción'}</td>
                  <td>
                    <span className={`badge ${method.comision === 0 ? 'badge-success' : 'badge-warning'}`}>
                      {method.comision || 0}%
                    </span>
                  </td>
                  <td>{new Date(method.creadoEn).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(method)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(method.id)}
                      title="Eliminar"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMethods.length === 0 && !loading && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron métodos de pago</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMethod ? 'Editar Método de Pago' : 'Agregar Método de Pago'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Nombre del Método *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comisión (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="form-control"
                      value={formData.comision}
                      onChange={(e) => setFormData({ ...formData, comision: parseFloat(e.target.value) || 0 })}
                      disabled={loading}
                    />
                    <small className="text-muted">Porcentaje de comisión aplicado a las transacciones</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingMethod ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingMethod ? 'Actualizar' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;