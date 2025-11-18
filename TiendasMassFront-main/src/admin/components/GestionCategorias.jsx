import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';
import { API_URL as URL } from '../../utils/constants';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: true
  });

  const API_URL = `${URL}/api/categorias`;

  // Constantes para validaciones
  const VALIDATION_RULES = {
    NOMBRE_MIN_LENGTH: 3,
    NOMBRE_MAX_LENGTH: 50,
    DESCRIPCION_MAX_LENGTH: 200,
    NOMBRE_REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        console.log('📦 Categorías recibidas:', res.data);
        setCategories(res.data);
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron obtener las categorías.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(category =>
      (category.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // ✨ NUEVA FUNCIÓN: Validación completa del formulario
  const validateForm = () => {
    // Validar antes de hacer trim
    if (!formData.nombre || formData.nombre.trim() === '') {
      swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la categoría es obligatorio',
      });
      return false;
    }

    const nombre = formData.nombre.trim();
    const descripcion = formData.descripcion.trim();

    // Validar longitud mínima del nombre
    if (nombre.length < VALIDATION_RULES.NOMBRE_MIN_LENGTH) {
      swal.fire({
        icon: 'warning',
        title: 'Nombre muy corto',
        text: `El nombre debe tener al menos ${VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres`,
      });
      return false;
    }

    // Validar longitud máxima del nombre
    if (nombre.length > VALIDATION_RULES.NOMBRE_MAX_LENGTH) {
      swal.fire({
        icon: 'warning',
        title: 'Nombre muy largo',
        text: `El nombre no puede exceder ${VALIDATION_RULES.NOMBRE_MAX_LENGTH} caracteres`,
      });
      return false;
    }

    // Validar caracteres especiales
    if (!VALIDATION_RULES.NOMBRE_REGEX.test(nombre)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no válidos',
        text: 'El nombre solo puede contener letras, números, espacios, guiones y guiones bajos',
      });
      return false;
    }

    // Validar longitud de descripción
    if (descripcion.length > VALIDATION_RULES.DESCRIPCION_MAX_LENGTH) {
      swal.fire({
        icon: 'warning',
        title: 'Descripción muy larga',
        text: `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPCION_MAX_LENGTH} caracteres`,
      });
      return false;
    }

    // Validar nombres duplicados
    const nombreExistente = categories.find(cat => 
      cat.nombre.toLowerCase() === nombre.toLowerCase() && 
      cat.id !== editingCategory?.id
    );

    if (nombreExistente) {
      swal.fire({
        icon: 'warning',
        title: 'Nombre duplicado',
        text: 'Ya existe una categoría con este nombre',
      });
      return false;
    }

    return true;
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion,
      estado: category.estado?.nombre === 'Activo'
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      estado: true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✨ Ejecutar validaciones
    if (!validateForm()) {
      return;
    }

    // Preparar datos limpios
    const nombreLimpio = formData.nombre.trim();
    const descripcionLimpia = formData.descripcion.trim();

    // Validación final antes de enviar
    if (!nombreLimpio) {
      swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'El nombre no puede estar vacío',
      });
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('nombre', nombreLimpio);
      form.append('descripcion', descripcionLimpia);
      form.append('estado', formData.estado.toString());

      if (editingCategory) {
        // Actualizar
        const response = await axios.put(`${API_URL}/${editingCategory.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setCategories(categories.map(c =>
          c.id === editingCategory.id ? response.data : c
        ));
        
        swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'Categoría actualizada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear
        const res = await axios.post(API_URL, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories([res.data, ...categories]);
        
        swal.fire({
          icon: 'success',
          title: 'Creada',
          text: 'Categoría creada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowModal(false);
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar la categoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: '¿Está seguro de eliminar esta categoría?',
      text: "Esta acción no se puede deshacer.",
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
        await axios.delete(`${API_URL}/${id}`);
        setCategories(categories.filter(c => c.id !== id));
        swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La categoría ha sido eliminada.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la categoría.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // ✨ FUNCIÓN MEJORADA: Validar antes de cambiar estado
  const toggleActive = async (category) => {
    // Validar si la categoría tiene productos asociados y se va a desactivar
    if (category.estado?.nombre === 'Activo' && category.productos?.length > 0) {
      const result = await swal.fire({
        title: '¡Atención!',
        text: `Esta categoría tiene ${category.productos.length} producto(s) asociado(s). ¿Desea desactivarla de todas formas?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setLoading(true);
      const newEstado = category.estado?.nombre === 'Activo' ? false : true;
      
      const form = new FormData();
      form.append('estado', newEstado.toString());
      
      const response = await axios.put(`${API_URL}/${category.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setCategories(categories.map(c => c.id === category.id ? response.data : c));
      
      swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La categoría ha sido ${newEstado ? 'activada' : 'desactivada'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado de la categoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Categorías</h1>
          <p className="text-muted">Organiza y administra las categorías de productos</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Categorías</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Categoría
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td><strong>{category.nombre}</strong></td>
                    <td>{category.descripcion}</td>
                    <td>
                      <span className="badge badge-primary">
                        {category.productos?.length || 0} productos
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${category.estado?.nombre === 'Activo' ? 'badge-success' : 'badge-danger'}`}
                        onClick={() => toggleActive(category)}
                        style={{ border: 'none', cursor: 'pointer' }}
                        disabled={loading}
                      >
                        {category.estado?.nombre === 'Activo' ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-edit me-1"
                        onClick={() => handleEdit(category)}
                        title="Editar"
                        disabled={loading}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(category.id)}
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
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
                    <label className="form-label">
                      Nombre * 
                      <small className="text-muted ms-2">
                        ({formData.nombre.length}/{VALIDATION_RULES.NOMBRE_MAX_LENGTH})
                      </small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Electrónica, Ropa, Alimentos"
                      maxLength={VALIDATION_RULES.NOMBRE_MAX_LENGTH}
                      required
                      disabled={loading}
                    />
                    <small className="text-muted">
                      Mínimo {VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres. Solo letras, números, espacios y guiones.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Descripción
                      <small className="text-muted ms-2">
                        ({formData.descripcion.length}/{VALIDATION_RULES.DESCRIPCION_MAX_LENGTH})
                      </small>
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe brevemente esta categoría"
                      maxLength={VALIDATION_RULES.DESCRIPCION_MAX_LENGTH}
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="estado"
                      checked={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="estado">
                      Categoría activa
                    </label>
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
                  <button type="submit" className="btn btn-mass-blue" disabled={loading || !formData.nombre.trim()}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingCategory ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingCategory ? 'Actualizar' : 'Guardar'
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

export default CategoryManager;