import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

// ============================================
// 🔒 MÓDULO DE VALIDACIONES
// ============================================
const validators = {
  nombre: (value) => {
    if (!value || value.trim() === '') {
      return 'El nombre es requerido';
    }
    if (value.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (value.trim().length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(value.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return null;
  },

  email: (value) => {
    if (!value || value.trim() === '') {
      return 'El correo electrónico es requerido';
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return 'Formato de correo inválido (ejemplo@correo.com)';
    }
    if (value.length > 254) {
      return 'El correo es demasiado largo (máx. 254 caracteres)';
    }
    return null;
  },

  password: (value, isRequired = true) => {
    if (!value) {
      return isRequired ? 'La contraseña es requerida' : null;
    }
    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (value.length > 128) {
      return 'La contraseña es demasiado larga (máx. 128 caracteres)';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Debe contener al menos una letra mayúscula';
    }
    if (!/[a-z]/.test(value)) {
      return 'Debe contener al menos una letra minúscula';
    }
    if (!/[0-9]/.test(value)) {
      return 'Debe contener al menos un número';
    }
    if (/\s/.test(value)) {
      return 'No puede contener espacios en blanco';
    }
    return null;
  },

  direccion: (value) => {
    if (value && value.trim() !== '') {
      const trimmedValue = value.trim();
      
      if (trimmedValue.length < 5) {
        return 'La dirección debe tener al menos 5 caracteres';
      }
      
      if (trimmedValue.length > 200) {
        return 'La dirección es demasiado larga (máx. 200 caracteres)';
      }
      
      // Debe contener al menos una letra y un número
      if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedValue)) {
        return 'La dirección debe contener al menos una letra';
      }
      
      // Validar caracteres permitidos: letras, números, espacios, coma, punto, guión, #
      const direccionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-#°]+$/;
      if (!direccionRegex.test(trimmedValue)) {
        return 'La dirección contiene caracteres no permitidos';
      }
      
      // No puede ser solo números o solo espacios
      if (/^\d+$/.test(trimmedValue) || /^\s+$/.test(trimmedValue)) {
        return 'La dirección debe incluir texto descriptivo';
      }
    }
    return null;
  },

  telefono: (value) => {
    if (value && value.trim() !== '') {
      const trimmedValue = value.trim();
      
      // Remover espacios, guiones, paréntesis y + para validar solo números
      const numbersOnly = trimmedValue.replace(/[\s\-\(\)\+\.]/g, '');
      
      // Debe contener solo dígitos después de limpiar
      if (!/^\d+$/.test(numbersOnly)) {
        return 'El teléfono solo puede contener números y símbolos: + ( ) - .';
      }
      
      // Validar longitud de números (sin símbolos)
      if (numbersOnly.length < 7) {
        return 'El teléfono debe tener al menos 7 dígitos';
      }
      
      if (numbersOnly.length > 15) {
        return 'El teléfono no puede tener más de 15 dígitos';
      }
      
      // Longitud total del campo (con símbolos)
      if (trimmedValue.length > 20) {
        return 'El teléfono es demasiado largo (máx. 20 caracteres)';
      }
      
      // Validar formato general: acepta +51, (01), espacios, guiones
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{0,4}$/;
      if (!phoneRegex.test(trimmedValue)) {
        return 'Formato de teléfono inválido. Ej: 987654321, +51987654321, (01)4567890';
      }
    }
    return null;
  },

  ciudad: (value) => {
    if (value && value.trim() !== '') {
      const trimmedValue = value.trim();
      
      if (trimmedValue.length < 2) {
        return 'La ciudad debe tener al menos 2 caracteres';
      }
      
      if (trimmedValue.length > 100) {
        return 'La ciudad es demasiado larga (máx. 100 caracteres)';
      }
      
      // Solo letras, espacios y algunos caracteres especiales permitidos (guión para ciudades compuestas)
      const cityRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'\.]+$/;
      if (!cityRegex.test(trimmedValue)) {
        return 'La ciudad solo puede contener letras, espacios, guión y apóstrofo';
      }
      
      // No puede ser solo espacios o guiones
      if (/^[\s\-]+$/.test(trimmedValue)) {
        return 'La ciudad debe contener letras';
      }
      
      // No puede empezar o terminar con guión
      if (trimmedValue.startsWith('-') || trimmedValue.endsWith('-')) {
        return 'La ciudad no puede empezar o terminar con guión';
      }
      
      // No puede tener números
      if (/\d/.test(trimmedValue)) {
        return 'La ciudad no puede contener números';
      }
    }
    return null;
  },

  codigoPostal: (value) => {
    if (value && value.trim() !== '') {
      const trimmedValue = value.trim();
      
      // Solo dígitos
      if (!/^\d+$/.test(trimmedValue)) {
        return 'El código postal solo puede contener números';
      }
      
      if (trimmedValue.length < 4) {
        return 'El código postal debe tener al menos 4 dígitos';
      }
      
      if (trimmedValue.length > 10) {
        return 'El código postal no puede tener más de 10 dígitos';
      }
      
      // Validar que no sea todo ceros
      if (/^0+$/.test(trimmedValue)) {
        return 'El código postal no puede ser solo ceros';
      }
      
      // Validar formatos comunes para Perú (5 dígitos) o permitir otros países
      const postalRegex = /^\d{4,10}$/;
      if (!postalRegex.test(trimmedValue)) {
        return 'Formato de código postal inválido';
      }
    }
    return null;
  },

  rol: (value) => {
    if (!value || value === '') {
      return 'Debe seleccionar un rol';
    }
    return null;
  }
};

const GestionUsuario = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    codigoPostal: '',
    estadoId: 1,
    active: true,
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const API_URL = 'http://localhost:443';

  const rolMapping = {
    'admin': 'Administrador',
    'cliente': 'Cliente'
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles`);
      if (!response.ok) throw new Error('Error al obtener roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/usuarios`);
      if (!response.ok) throw new Error('Error al obtener usuarios');
      const data = await response.json();
      
      const formatted = data.map(user => ({
        ...user,
        rol: rolMapping[user.rol?.nombre] || user.rol?.nombre || 'Cliente',
        lastLogin: new Date().toISOString(),
        active: true,
      }));
      setUsers(formatted);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'nombre':
        error = validators.nombre(value);
        break;
      case 'email':
        error = validators.email(value);
        break;
      case 'password':
        error = validators.password(value, !editingUser);
        break;
      case 'direccion':
        error = validators.direccion(value);
        break;
      case 'telefono':
        error = validators.telefono(value);
        break;
      case 'ciudad':
        error = validators.ciudad(value);
        break;
      case 'codigoPostal':
        error = validators.codigoPostal(value);
        break;
      case 'rol':
        error = validators.rol(value);
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const errors = {};
    
    const fieldsToValidate = [
      'nombre', 'email', 'password', 'rol', 
      'direccion', 'telefono', 'ciudad', 'codigoPostal'
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === '' || user.rol.id?.toString() === selectedRole;
    return matchSearch && matchRole;
  });

  const handleEdit = user => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol?.id?.toString() || user.rolId?.toString() || '2',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      ciudad: user.ciudad || '',
      codigoPostal: user.codigoPostal || '',
      estadoId: user.estadoId || user.estado?.id || 1,
      active: user.active ?? true,
    });
    setFieldErrors({});
    setShowValidationSummary(false);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '2',
      direccion: '',
      telefono: '',
      ciudad: '',
      codigoPostal: '',
      estadoId: 1,
      active: true,
    });
    setFieldErrors({});
    setShowValidationSummary(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationSummary(false);

    const isValid = validateForm();

    if (!isValid) {
      setShowValidationSummary(true);
      return;
    }

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        direccion: formData.direccion.trim(),
        estadoId: formData.estadoId,
        telefono: formData.telefono.trim(),
        ciudad: formData.ciudad.trim(),
        codigoPostal: formData.codigoPostal.trim(),
        rolId: parseInt(formData.rol)
      };

      if (!editingUser || formData.password) {
        dataToSend.password = formData.password;
      }

      let response;
      if (editingUser) {
        response = await fetch(`${API_URL}/api/usuarios/update/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
      } else {
        response = await fetch(`${API_URL}/api/usuarios/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar usuario');
      }

      setShowModal(false);
      setFieldErrors({});
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      
      let errorMessage = 'Error al guardar usuario';
      
      if (error.message.includes('409') || error.message.includes('existe')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setShowValidationSummary(true);
      setFieldErrors({ submit: errorMessage });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`${API_URL}/api/usuarios/delete/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar usuario');
        }
        
        fetchUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const toggleActive = (id) => {
    setUsers(users.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'Administrador':
        return '#dc3545';
      case 'Vendedor':
        return '#ffc107';
      default:
        return '#0066cc';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0066cc', margin: '0 0 8px 0' }}>Gestión de Usuarios</h1>
        <p style={{ color: '#6c757d', margin: 0 }}>Administra usuarios del sistema</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Lista de Usuarios</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 36px 8px 12px', borderRadius: '4px', border: '1px solid #ced4da', width: '200px' }}
              />
              <Search style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} size={16} />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="">Todos los roles</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id.toString()}>
                  {rol.nombre === 'admin' ? 'Administrador' : rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                </option>
              ))}
            </select>
            <button 
              onClick={handleAdd}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
            >
              <Plus size={16} />
              Agregar Usuario
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Correo</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Rol</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Último Acceso</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}><strong>{user.nombre}</strong></td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: getRoleBadge(user.rol),
                      color: 'white'
                    }}>
                      {user.rol}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleActive(user.id)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: user.active ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      title="Editar"
                      style={{ padding: '6px', marginRight: '8px', border: 'none', backgroundColor: '#ffc107', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      title="Eliminar"
                      style={{ padding: '6px', border: 'none', backgroundColor: '#dc3545', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h5 style={{ margin: 0 }}>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h5>
              <button 
                onClick={() => setShowModal(false)}
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
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
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
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Correo *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.email ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.email && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.email}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Contraseña {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.password ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.password && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.password}
                  </small>
                )}
                <small style={{ color: '#6c757d', display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>
                  {editingUser 
                    ? 'Dejar en blanco para mantener la contraseña actual'
                    : 'Mín. 8 caracteres, mayúscula, minúscula y número'}
                </small>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.rol ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id.toString()}>
                      {rol.nombre === 'admin' ? 'Administrador' : rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                    </option>
                  ))}
                </select>
                {fieldErrors.rol && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.rol}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.direccion ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.direccion && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.direccion}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.ciudad ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.ciudad && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.ciudad}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.telefono ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.telefono && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.telefono}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Código Postal</label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: fieldErrors.codigoPostal ? '1px solid #dc3545' : '1px solid #ced4da',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.codigoPostal && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    {fieldErrors.codigoPostal}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Usuario activo</span>
                </label>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                style={{ padding: '8px 16px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {editingUser ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuario;