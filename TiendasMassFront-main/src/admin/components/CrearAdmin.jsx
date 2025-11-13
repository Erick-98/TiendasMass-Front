import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield, FaSave, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './CrearAdmin.css';
const API_URL = "http://localhost:443";
const CrearAdmin = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState('');

  // Cargar roles disponibles
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/api/roles`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        if (response.ok) {
          const rolesData = await response.json();
          setRoles(rolesData);
          // Seleccionar rol de administrador por defecto si existe
          const adminRol = rolesData.find(rol => 
            rol.nombre.toLowerCase().includes('admin') || 
            rol.nombre.toLowerCase().includes('administrador')
          );
          if (adminRol) {
            setSelectedRol(adminRol.id.toString());
          }
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };

    cargarRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      Swal.fire('Error', 'El nombre es requerido', 'error');
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire('Error', 'El email es requerido', 'error');
      return false;
    }
    if (!formData.password) {
      Swal.fire('Error', 'La contraseña es requerida', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return false;
    }
    if (!selectedRol) {
      Swal.fire('Error', 'Debe seleccionar un rol', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const adminToken = localStorage.getItem('adminToken');
      const userData = {
        ...formData,
        rolId: parseInt(selectedRol)
      };

      // Remover confirmPassword del objeto
      delete userData.confirmPassword;

      const response = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario Administrador Creado!',
          text: `El usuario ${formData.nombre} ha sido creado exitosamente`,
          confirmButtonText: 'Continuar'
        });

        // Limpiar formulario
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          codigoPostal: ''
        });
        setSelectedRol('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al Crear Usuario',
          text: data.error || 'No se pudo crear el usuario',
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Cancelar creación?',
      text: 'Se perderán todos los datos ingresados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          codigoPostal: ''
        });
        setSelectedRol('');
      }
    });
  };

  return (
    <div className="crear-admin-container">
      <div className="crear-admin-card">
        <div className="crear-admin-header">
          <h1><FaUserShield /> Crear Usuario Administrador</h1>
          <p>Complete los datos para crear un nuevo usuario con permisos administrativos</p>
        </div>

        <form onSubmit={handleSubmit} className="crear-admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                <FaUser className="input-icon" />
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@tiendamass.com"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                Confirmar Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">
                <FaUser className="input-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+51 999 999 999"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rol">
                <FaUserShield className="input-icon" />
                Rol *
              </label>
              <select
                id="rol"
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value)}
                required
                className="form-input"
              >
                <option value="">Seleccionar rol</option>
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id.toString()}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">
              <FaUser className="input-icon" />
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Av. Principal 123"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ciudad">
                <FaUser className="input-icon" />
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Lima"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codigoPostal">
                <FaUser className="input-icon" />
                Código Postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                placeholder="15001"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              <FaTimes /> Cancelar
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Creando...' : 'Crear Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearAdmin; 