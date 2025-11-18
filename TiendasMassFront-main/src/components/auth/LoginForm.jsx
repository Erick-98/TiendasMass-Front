// LoginForm.jsx - Con validaciones completas (Solo SweetAlert)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuario } from '../../context/userContext';
import './AuthStyles.css';
import Swal from 'sweetalert2';
import { API_URL } from '../../utils/constants';

// ✅ VALIDACIONES PERSONALIZADAS
const validators = {
  email: (value) => {
    if (!value || value.trim() === '') {
      return 'El correo es requerido';
    }

    // Regex estricto para email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return 'Formato de correo inválido (ejemplo@correo.com)';
    }

    if (value.length > 254) {
      return 'El correo es demasiado largo';
    }

    return null;
  },

  password: (value) => {
    if (!value) {
      return 'La contraseña es requerida';
    }

    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (value.length > 128) {
      return 'La contraseña es demasiado larga';
    }

    // Detectar solo espacios
    if (value.trim() === '') {
      return 'La contraseña no puede ser solo espacios';
    }

    return null;
  }
};

function LoginForm({ switchToRegister }) {
  const navigate = useNavigate();
  const { login } = useUsuario();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // ✅ Validar TODO el formulario antes de enviar
  const validateForm = () => {
    const errors = [];

    const emailError = validators.email(formData.email);
    if (emailError) errors.push(`• Email: ${emailError}`);

    const passwordError = validators.password(formData.password);
    if (passwordError) errors.push(`• Contraseña: ${passwordError}`);

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDAR ANTES DE ENVIAR AL SERVIDOR
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor corrige los siguientes errores:',
        html: validationErrors.join('<br>'),
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando login...');

      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(), // ✅ Normalizar email
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📨 Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        hasToken: !!data.token
      });

      if (response.ok && data.token) {
        console.log('✅ Datos válidos recibidos, procesando login...');

        try {
          await login(data, formData.remember);
          console.log('✅ Context actualizado exitosamente');

          await Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${data.nombre || data.usuario?.nombre || 'Usuario'}`,
            timer: 1500,
            showConfirmButton: false
          });

          navigate('/');

        } catch (contextError) {
          console.error('❌ Error en el contexto:', contextError);
          Swal.fire({
            icon: 'error',
            title: 'Error interno',
            text: 'Error al procesar los datos de usuario'
          });
        }

      } else {
        const errorMessage = data.message || data.error || 'Credenciales inválidas';

        console.log('❌ Login falló:', {
          status: response.status,
          message: errorMessage
        });

        Swal.fire({
          icon: 'error',
          title: getErrorTitle(response.status),
          text: errorMessage
        });
      }

    } catch (error) {
      console.error('❌ Error de red:', error);

      let errorMessage = 'Error de conexión. Verifica tu internet.';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. ¿Está funcionando el backend?';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorTitle = (status) => {
    switch (status) {
      case 400: return 'Datos inválidos';
      case 401: return 'Credenciales incorrectas';
      case 403: return 'Acceso denegado';
      case 404: return 'Usuario no encontrado';
      case 500: return 'Error del servidor';
      default: return 'Error de autenticación';
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mínimo 8 caracteres"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <label htmlFor="remember">Recordarme</label>
          </div>
          <div className="forgot-password">
            <a href="#" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="form-footer">
          <p>
            ¿No tienes cuenta?
            <button
              type="button"
              onClick={switchToRegister}
              className="switch-form-button"
              disabled={isLoading}
            >
              Regístrate
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;