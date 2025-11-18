import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import './styleperfil.css';
import Swal from 'sweetalert2';
import { API_URL } from '../../utils/constants';
const Profile = ({ userData, setUserData }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    codigoPostal: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        telefono: userData.telefono || '',
        ciudad: userData.ciudad || '',
        direccion: userData.direccion || '',
        codigoPostal: userData.codigoPostal || ''
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/usuarios/update/${userData.id}`, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar los datos');

      const result = await response.json();

      // ✅ Actualiza userData y formData
      setUserData(result.usuario);
      setFormData(result.usuario);

      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Perfil actualizado correctamente',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el perfil',
      });
    }
  };



  const handleToggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setFormData({
        nombre: userData.nombre || '',
        telefono: userData.telefono || '',
        ciudad: userData.ciudad || '',
        direccion: userData.direccion || '',
        codigoPostal: userData.codigoPostal || ''
      });
      setIsEditing(true);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mi Perfil</h2>
          <p>Gestiona tu información personal</p>
        </div>
        <button className="edit-btn" onClick={handleToggleEdit}>
          <Edit3 size={16} />
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                />
              ) : (
                <div className="field-display">{userData.nombre}</div>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="field-display">{userData.email}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              ) : (
                <div className="field-display">{userData.telefono}</div>
              )}
            </div>

            <div className="form-group">
              <label>Ciudad</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                />
              ) : (
                <div className="field-display">{userData.ciudad}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dirección</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                />
              ) : (
                <div className="field-display">{userData.direccion}</div>
              )}
            </div>

            <div className="form-group">
              <label>Código Postal</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                />
              ) : (
                <div className="field-display">{userData.codigoPostal}</div>
              )}
            </div>
          </div>

          

        </div>
      </div>
    </div>
  );
};

export default Profile;
