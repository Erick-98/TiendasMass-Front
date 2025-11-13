import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield, FaSave, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './SetupAdmin.css';
const API_URL = "http://localhost:443";
const SetupAdmin = () => {
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
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();

  // Verificar estado del sistema al cargar
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/setup/status`);
      const data = await response.json();
      
      setNeedsSetup(data.needsSetup);
      setCheckingSetup(false);

      if (!data.needsSetup) {
        Swal.fire({
          icon: 'info',
          title: 'Sistema ya configurado',
          text: 'El sistema ya tiene un administrador. Serás redirigido al login.',
          timer: 3000,
          showConfirmButton: false
        });
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error al verificar estado del sistema:', error);
      setCheckingSetup(false);
      setNeedsSetup(true); // Asumir que necesita setup si hay error
    }
  };

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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const userData = {
        ...formData
      };

      // Remover confirmPassword del objeto
      delete userData.confirmPassword;

      const response = await fetch(`${API_URL}/api/setup/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Administrador Creado Exitosamente!',
          text: `El administrador ${formData.nombre} ha sido creado. Ahora puedes iniciar sesión.`,
          confirmButtonText: 'Ir al Login'
        }).then(() => {
          navigate('/admin');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al Crear Administrador',
          text: data.error || 'No se pudo crear el administrador',
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    } catch (error) {
      console.error('Error al crear administrador:', error);
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

  if (checkingSetup) {
    return (
      <div className="setup-loading">
        <div className="loading-spinner"></div>
        <p>Verificando estado del sistema...</p>
      </div>
    );
  }

  if (!needsSetup) {
    return null; // Será redirigido por el useEffect
  }

  return (
    <div className="setup-admin-container">
      <div className="setup-admin-card">
        <div className="setup-admin-header">
          <div className="setup-icon">
            <FaUserShield />
          </div>
          <h1>Configuración Inicial</h1>
          <p>Bienvenido a Tiendas Mass. Necesitamos crear el primer administrador del sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-admin-form">
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

          <div className="setup-actions">
            <button
              type="submit"
              className="setup-button"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Creando...' : 'Crear Administrador'}
            </button>
          </div>
        </form>

        <div className="setup-footer">
          <div className="setup-info">
            <FaCheck className="info-icon" />
            <div>
              <h4>¿Qué se creará?</h4>
              <ul>
                <li>Rol de Administrador</li>
                <li>Estado "Activo" para usuarios</li>
                <li>Primer usuario administrador</li>
                <li>Acceso completo al sistema</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin; 