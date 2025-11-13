// RegisterForm.jsx - Validación SOLO con SweetAlert (sin cambios de CSS)
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AuthStyles.css';

const API_URL = "http://localhost:443";

// ✅ Validaciones (mismo código)
const validators = {
  name: (value) => {
    if (!value || value.trim() === '') {
      return 'El nombre es requerido';
    }
    if (value.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (value.trim().length > 100) {
      return 'El nombre es demasiado largo';
    }
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(value.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return null;
  },

  email: (value) => {
    if (!value || value.trim() === '') {
      return 'El correo es requerido';
    }
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
    if (!/[A-Z]/.test(value)) {
      return 'Debe contener al menos una mayúscula';
    }
    if (!/[a-z]/.test(value)) {
      return 'Debe contener al menos una minúscula';
    }
    if (!/[0-9]/.test(value)) {
      return 'Debe contener al menos un número';
    }
    if (/\s/.test(value)) {
      return 'No puede contener espacios';
    }
    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) {
      return 'Debes confirmar la contraseña';
    }
    if (value !== originalPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },

  address: (value) => {
    if (value && value.trim() !== '') {
      if (value.trim().length < 5) {
        return 'La dirección debe tener al menos 5 caracteres';
      }
      if (value.length > 200) {
        return 'La dirección es demasiado larga';
      }
    }
    return null;
  }
};

function RegisterForm({ switchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ✅ Validar TODO y mostrar errores con SweetAlert
  const validateForm = () => {
    const errors = [];

    const nameError = validators.name(formData.name);
    if (nameError) errors.push(`• Nombre: ${nameError}`);

    const emailError = validators.email(formData.email);
    if (emailError) errors.push(`• Email: ${emailError}`);

    const passwordError = validators.password(formData.password);
    if (passwordError) errors.push(`• Contraseña: ${passwordError}`);

    const confirmPasswordError = validators.confirmPassword(
      formData.confirmPassword,
      formData.password
    );
    if (confirmPasswordError) errors.push(`• Confirmar: ${confirmPasswordError}`);

    const addressError = validators.address(formData.address);
    if (addressError) errors.push(`• Dirección: ${addressError}`);

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validar y mostrar TODOS los errores en un solo SweetAlert
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Por favor corrige los siguientes errores:',
        html: validationErrors.join('<br>'),
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          direccion: formData.address.trim() || ""
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          confirmButtonText: 'OK'
        });
        
        switchToLogin();
      } else {
        let errorMessage = data.message || 'Error al registrarse';

        if (response.status === 409 || errorMessage.includes('existe')) {
          errorMessage = 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: errorMessage
        });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      
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

  return (
    <div className="form-container">
      <h2 className="form-title">Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ingresa tu nombre"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
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
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mínimo 8 caracteres"
            disabled={isLoading}
            required
          />
          <small style={{ display: 'block', color: '#6c757d', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Debe tener: 8+ caracteres, mayúscula, minúscula y número
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="register-confirmPassword">Confirmar contraseña</label>
          <input
            id="register-confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repite tu contraseña"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-address">
            Dirección <span style={{color: '#6c757d', fontSize: '0.85rem'}}>(opcional)</span>
          </label>
          <input
            id="register-address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Calle, número, ciudad"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="form-footer">
          <p>
            ¿Ya tienes cuenta?
            <button
              type="button"
              onClick={switchToLogin}
              className="switch-form-button"
              disabled={isLoading}
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;