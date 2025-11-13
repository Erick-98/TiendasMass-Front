import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';

// ============================================
// 🔒 MÓDULO DE VALIDACIONES
// ============================================
const validators = {
  nombre: (value) => {
    if (!value || value.trim() === '') {
      return 'El nombre del estado es requerido';
    }
    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (value.trim().length > 50) {
      return 'El nombre no puede exceder 50 caracteres';
    }
    // Permitir letras, números, espacios y algunos caracteres especiales
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/;
    if (!nameRegex.test(value.trim())) {
      return 'El nombre solo puede contener letras, números, espacios, guiones y guión bajo';
    }
    return null;
  },

  descripcion: (value) => {
    if (value && value.trim() !== '') {
      if (value.trim().length < 10) {
        return 'La descripción debe tener al menos 10 caracteres';
      }
      if (value.length > 500) {
        return 'La descripción no puede exceder 500 caracteres';
      }
      // Validar que no sea solo espacios o caracteres especiales
      if (/^[\s\W]+$/.test(value)) {
        return 'La descripción debe contener texto válido';
      }
    }
    return null;
  },

  color: (value) => {
    if (!value || value.trim() === '') {
      return 'El color es requerido';
    }
    // Validar formato hexadecimal
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(value)) {
      return 'El color debe estar en formato hexadecimal (#RRGGBB)';
    }
    // No permitir colores muy claros (difíciles de leer)
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness > 220) {
      return 'El color es demasiado claro. Elige un color más oscuro para mejor visibilidad';
    }
    return null;
  },

  orden: (value, maxOrder) => {
    if (!value && value !== 0) {
      return 'El orden es requerido';
    }
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return 'El orden debe ser un número válido';
    }
    if (numValue < 1) {
      return 'El orden debe ser mayor o igual a 1';
    }
    if (numValue > maxOrder + 1) {
      return `El orden no puede ser mayor a ${maxOrder + 1}`;
    }
    return null;
  }
};

const API_URL = "http://localhost:443";

const StatusManager = () => {
  const [statuses, setStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#6c757d',
    activo: true,
    orden: 1
  });

  // Estados para validación
  const [fieldErrors, setFieldErrors] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/estados`);
      if (!response.ok) {
        throw new Error('Error al cargar estados');
      }
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const filteredStatuses = statuses
    .filter(status =>
      status.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (status.descripcion && status.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.orden - b.orden);

  // ============================================
  // 🔍 VALIDACIÓN DE FORMULARIO
  // ============================================
  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'nombre':
        error = validators.nombre(value);
        break;
      case 'descripcion':
        error = validators.descripcion(value);
        break;
      case 'color':
        error = validators.color(value);
        break;
      case 'orden':
        const maxOrder = editingStatus ? statuses.length : statuses.length + 1;
        error = validators.orden(value, maxOrder);
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const errors = {};
    
    const fieldsToValidate = ['nombre', 'descripcion', 'color', 'orden'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Validar nombre duplicado
    const nombreExiste = statuses.some(s => 
      s.nombre.toLowerCase() === formData.nombre.trim().toLowerCase() && 
      (!editingStatus || s.id !== editingStatus.id)
    );
    if (nombreExiste) {
      errors.nombre = 'Ya existe un estado con este nombre';
    }

    // Validar orden duplicado
    const ordenExiste = statuses.some(s => 
      s.orden === parseInt(formData.orden) && 
      (!editingStatus || s.id !== editingStatus.id)
    );
    if (ordenExiste) {
      errors.orden = 'Ya existe un estado con este orden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // 📝 MANEJO DE CAMBIOS EN INPUTS
  // ============================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });

    // Validar el campo en tiempo real (excepto checkbox)
    if (type !== 'checkbox') {
      const error = validateField(name, newValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleEdit = (status) => {
    setEditingStatus(status);
    setFormData({
      nombre: status.nombre,
      descripcion: status.descripcion || '',
      color: status.color,
      activo: status.activo,
      orden: status.orden
    });
    setFieldErrors({});
    setShowValidationSummary(false);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#6c757d',
      activo: true,
      orden: statuses.length + 1
    });
    setFieldErrors({});
    setShowValidationSummary(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationSummary(false);

    // Validar formulario completo
    const isValid = validateForm();

    if (!isValid) {
      setShowValidationSummary(true);
      return;
    }

    try {
      setLoading(true);
      const url = editingStatus 
        ? `${API_URL}/api/estados/${editingStatus.id}`
        : `${API_URL}/api/estados`;
      
      const method = editingStatus ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          color: formData.color,
          activo: formData.activo,
          orden: parseInt(formData.orden)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      const result = await response.json();
      
      if (editingStatus) {
        setStatuses(statuses.map(s =>
          s.id === editingStatus.id ? result : s
        ));
      } else {
        setStatuses([...statuses, result]);
      }

      setShowModal(false);
      setFieldErrors({});
    } catch (error) {
      console.error('Error:', error);
      setFieldErrors({ submit: error.message || 'Error en la operación' });
      setShowValidationSummary(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estado? Esta acción no se puede deshacer')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/estados/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar');
        }

        setStatuses(statuses.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (id) => {
    try {
      const status = statuses.find(s => s.id === id);
      if (!status) return;

      const response = await fetch(`${API_URL}/api/estados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...status,
          activo: !status.activo
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      const updatedStatus = await response.json();
      setStatuses(statuses.map(s =>
        s.id === id ? updatedStatus : s
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const moveStatus = async (id, direction) => {
    try {
      const currentStatus = statuses.find(s => s.id === id);
      if (!currentStatus) return;

      const newOrder = direction === 'up' ? currentStatus.orden - 1 : currentStatus.orden + 1;
      const swapStatus = statuses.find(s => s.orden === newOrder);

      if (swapStatus) {
        const response = await fetch(`${API_URL}/api/estados/orden/actualizar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estados: [
              { id: id, orden: newOrder },
              { id: swapStatus.id, orden: currentStatus.orden }
            ]
          }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el orden');
        }

        const updatedStatuses = await response.json();
        setStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading && statuses.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#0066cc', margin: '0 0 8px 0' }}>Gestión de Estados</h1>
          <p style={{ color: '#6c757d', margin: 0 }}>Configura los estados de los pedidos y su flujo</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Cargando estados...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0066cc', margin: '0 0 8px 0' }}>Gestión de Estados</h1>
        <p style={{ color: '#6c757d', margin: 0 }}>Configura los estados de los pedidos y su flujo</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Estados de Pedidos</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar estados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 36px 8px 12px', borderRadius: '4px', border: '1px solid #ced4da', width: '200px' }}
              />
              <Search style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} size={16} />
            </div>
            <button 
              onClick={handleAdd}
              disabled={loading}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
            >
              <Plus size={16} />
              Agregar Estado
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Orden</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Descripción</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Color</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.map((status) => (
                <tr key={status.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        onClick={() => moveStatus(status.id, 'up')}
                        disabled={status.orden === 1 || loading}
                        style={{ padding: '4px', border: '1px solid #ced4da', backgroundColor: 'white', borderRadius: '4px', cursor: status.orden === 1 ? 'not-allowed' : 'pointer' }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveStatus(status.id, 'down')}
                        disabled={status.orden === statuses.length || loading}
                        style={{ padding: '4px', border: '1px solid #ced4da', backgroundColor: 'white', borderRadius: '4px', cursor: status.orden === statuses.length ? 'not-allowed' : 'pointer' }}
                      >
                        <ArrowDown size={12} />
                      </button>
                      <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{status.orden}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: status.color,
                        color: 'white'
                      }}
                    >
                      {status.nombre}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{status.descripcion || 'Sin descripción'}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: status.color,
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}
                      ></div>
                      <span>{status.color}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleActive(status.id)}
                      disabled={loading}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: status.activo ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}
                    >
                      {status.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleEdit(status)}
                      title="Editar"
                      disabled={loading}
                      style={{ padding: '6px', marginRight: '8px', border: 'none', backgroundColor: '#ffc107', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(status.id)}
                      title="Eliminar"
                      disabled={loading}
                      style={{ padding: '6px', border: 'none', backgroundColor: '#dc3545', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStatuses.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: '#6c757d' }}>No se encontraron estados</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            width: '90%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0 }}>{editingStatus ? 'Editar Estado' : 'Agregar Estado'}</h5>
              <button 
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#6c757d' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              {showValidationSummary && Object.keys(fieldErrors).length > 0 && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c2c7',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <strong style={{ color: '#842029' }}>Errores de validación:</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#842029' }}>
                    {Object.entries(fieldErrors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre del Estado *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.nombre ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.nombre && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.nombre}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Descripción</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.descripcion ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                {fieldErrors.descripcion && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.descripcion}
                  </small>
                )}
                <small style={{ color: '#6c757d', display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>
                  Mínimo 10 caracteres (opcional)
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Color *</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    style={{ 
                      width: '100%', 
                      height: '40px',
                      padding: '4px', 
                      borderRadius: '4px', 
                      border: fieldErrors.color ? '1px solid #dc3545' : '1px solid #ced4da',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  />
                  {fieldErrors.color && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                      {fieldErrors.color}
                    </small>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Orden *</label>
                  <input
                    type="number"
                    name="orden"
                    min="1"
                    value={formData.orden}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      border: fieldErrors.orden ? '1px solid #dc3545' : '1px solid #ced4da',
                      boxSizing: 'border-box'
                    }}
                  />
                  {fieldErrors.orden && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                      {fieldErrors.orden}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span>Estado activo</span>
                </label>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '8px 16px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {loading ? (editingStatus ? 'Actualizando...' : 'Guardando...') : (editingStatus ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusManager;