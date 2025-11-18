// ProductManager.jsx - Con validaciones completas
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, Search, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';
import { productValidators } from '../../utils/productosvalidaciones';
import { API_URL as BASE_URL } from '../../utils/constants';

const ProductManager = () => {
  const API_URL = `${BASE_URL}/api/products`;
  const CATEGORY_URL = `${BASE_URL}/api/categorias`;

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // ✅ Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    stock: '',
    marca: '',
    imagen: null,
    estado: true,
  });

  const productsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(CATEGORY_URL),
        ]);

        setProducts(productosRes.data);
        console.log('📦 Productos recibidos:', productosRes.data);
        setCategorias(categoriasRes.data);
        setError('');
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos. Por favor, recarga la página.',
        });
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const nombre = product.nombre || '';
    const descripcion = product.descripcion || '';

    const matchesSearch =
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === '' ||
      product.categoria?.id?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      marca: product.marca || '',
      imagen: null,
      categoriaId: product.categoria?.id?.toString() || '',
      estado: product.estado?.nombre === 'Activo',
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoriaId: '',
      stock: '',
      marca: '',
      imagen: null,
      estado: true,
    });
    setValidationErrors({});
    setShowModal(true);
  };

  // ✅ VALIDAR CAMPO INDIVIDUAL EN TIEMPO REAL
  const validateField = (fieldName, value) => {
    const error = productValidators[fieldName]?.(value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };

  // ✅ MANEJAR CAMBIOS CON VALIDACIÓN
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar después de cambiar (debounce ligero)
    setTimeout(() => {
      validateField(field, value);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDAR TODO EL FORMULARIO
    const { isValid, errors } = productValidators.validateForm(formData);

    if (!isValid) {
      setValidationErrors(errors);
      
      // Mostrar todos los errores en un SweetAlert
      const errorList = Object.entries(errors)
        .map(([field, error]) => `• ${field.charAt(0).toUpperCase() + field.slice(1)}: ${error}`)
        .join('<br>');

      swal.fire({
        icon: 'warning',
        title: 'Por favor corrige los siguientes errores:',
        html: errorList,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // ✅ VALIDAR DUPLICADOS
    if (productValidators.checkDuplicate(products, formData.nombre, editingProduct?.id)) {
      swal.fire({
        icon: 'warning',
        title: 'Producto duplicado',
        text: 'Ya existe un producto con ese nombre',
      });
      return;
    }

    // ✅ ALERTA DE STOCK BAJO
    if (productValidators.checkLowStock(parseInt(formData.stock))) {
      const result = await swal.fire({
        icon: 'warning',
        title: 'Stock bajo',
        text: `El stock (${formData.stock}) está por debajo del umbral recomendado (10 unidades). ¿Deseas continuar?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const form = new FormData();
    form.append('nombre', formData.nombre.trim());
    form.append('descripcion', formData.descripcion.trim());
    form.append('precio', productValidators.formatPrice(formData.precio));
    form.append('stock', productValidators.formatStock(formData.stock));
    form.append('marca', formData.marca.trim() || '');
    form.append('categoria_id', formData.categoriaId);
    form.append('estado', formData.estado.toString());

    if (formData.imagen) {
      console.log('📸 Archivo seleccionado:', formData.imagen);
      form.append('imagen', formData.imagen);
    }

    // Debug
    console.log('📤 Datos a enviar:');
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    try {
      setLoading(true);
      if (editingProduct) {
        const response = await axios.put(`${API_URL}/${editingProduct.id}`, form);
        setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
        swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Producto actualizado exitosamente',
        });
      } else {
        const res = await axios.post(API_URL, form);
        setProducts([res.data, ...products]);
        swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Producto creado exitosamente',
        });
      }
      setShowModal(false);
      setValidationErrors({});
      setError('');
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar el producto. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de eliminar este producto?',
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
        setProducts(products.filter(p => p.id !== id));
        swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Producto eliminado exitosamente',
        });
        setError('');
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el producto. Por favor, intenta de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (product) => {
    try {
      setLoading(true);
      const newEstado = product.estado?.nombre === 'Activo' ? false : true;
      
      const form = new FormData();
      form.append('estado', newEstado.toString());
      
      const response = await axios.put(`${API_URL}/${product.id}`, form);
      
      setProducts(products.map(p => p.id === product.id ? response.data : p));
      setError('');
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado del producto',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ VALIDACIÓN MEJORADA DE IMAGEN
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = productValidators.imagen(file);
    
    if (error) {
      swal.fire({
        icon: 'warning',
        title: 'Imagen inválida',
        text: error,
      });
      e.target.value = ''; // Limpiar input
      return;
    }

    // ✅ VALIDAR DIMENSIONES DE LA IMAGEN
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const minWidth = 100;
      const minHeight = 100;
      const maxWidth = 4000;
      const maxHeight = 4000;

      if (img.width < minWidth || img.height < minHeight) {
        swal.fire({
          icon: 'warning',
          title: 'Imagen muy pequeña',
          text: `La imagen debe tener al menos ${minWidth}x${minHeight} píxeles`,
        });
        e.target.value = '';
        return;
      }

      if (img.width > maxWidth || img.height > maxHeight) {
        swal.fire({
          icon: 'warning',
          title: 'Imagen muy grande',
          text: `La imagen no puede superar ${maxWidth}x${maxHeight} píxeles`,
        });
        e.target.value = '';
        return;
      }

      // Todo OK, guardar archivo
      setFormData({ ...formData, imagen: file });
      setValidationErrors(prev => ({ ...prev, imagen: null }));
    };

    img.onerror = () => {
      swal.fire({
        icon: 'error',
        title: 'Archivo inválido',
        text: 'No se pudo cargar la imagen. Verifica que sea un archivo válido.',
      });
      e.target.value = '';
    };
  };

  if (loading && products.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Productos</h1>
          <p className="text-muted">Administra el catálogo de productos del minimarket</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Productos</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>

            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Producto
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                      <img
                      src={product.imagen ? `${BASE_URL}/${product.imagen}` : '/placeholder-image.jpg'}
                      alt={product.nombre}
                      className="rounded"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </td>
                  <td>
                    <div>
                      <strong>{product.nombre}</strong>
                      <br />
                      <small className="text-muted">{product.descripcion}</small>
                      {product.marca && (
                        <>
                          <br />
                          <small className="text-info">Marca: {product.marca}</small>
                        </>
                      )}
                    </div>
                  </td>
                  <td>{product.categoria ? product.categoria.nombre : 'Sin categoría'}</td>
                  <td><strong>${Number(product.precio).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${product.stock > 20 ? 'badge-success' : product.stock > 5 ? 'badge-warning' : 'badge-danger'}`}>
                      {product.stock}
                      {/* ✅ INDICADOR DE STOCK BAJO */}
                      {productValidators.checkLowStock(product.stock) && (
                        <AlertTriangle size={12} className="ms-1" />
                      )}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${product.estado?.nombre === 'Activo' ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(product)}
                      style={{ border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      {product.estado?.nombre === 'Activo' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button className="btn-action btn-view me-1" title="Ver">
                      <Eye size={14} />
                    </button>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(product.id)}
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

      {/* Modal con Validaciones */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
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
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Nombre * 
                          <small className="text-muted ms-2">(3-100 caracteres)</small>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.nombre ? 'is-invalid' : ''}`}
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Ej: Leche Gloria Entera 1L"
                        />
                        {validationErrors.nombre && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Categoría *</label>
                        <select
                          className={`form-select ${validationErrors.categoriaId ? 'is-invalid' : ''}`}
                          value={formData.categoriaId}
                          onChange={(e) => handleInputChange('categoriaId', e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.nombre}
                            </option>
                          ))}
                        </select>
                        {validationErrors.categoriaId && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.categoriaId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="form-label">
                          Marca 
                          <small className="text-muted ms-2">(Opcional, máx. 50 caracteres)</small>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.marca ? 'is-invalid' : ''}`}
                          value={formData.marca}
                          onChange={(e) => handleInputChange('marca', e.target.value)}
                          placeholder="Ej: La Favorita, Nestlé, Gloria"
                          disabled={loading}
                        />
                        {validationErrors.marca && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.marca}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Descripción 
                      <small className="text-muted ms-2">(Opcional, máx. 500 caracteres)</small>
                    </label>
                    <textarea
                      className={`form-control ${validationErrors.descripcion ? 'is-invalid' : ''}`}
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      disabled={loading}
                      placeholder="Descripción detallada del producto"
                      maxLength={500}
                    ></textarea>
                    <small className="text-muted">
                      {formData.descripcion.length}/500 caracteres
                    </small>
                    {validationErrors.descripcion && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.descripcion}
                      </div>
                    )}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          Precio * 
                          <small className="text-muted ms-2">(máx. $999,999.99)</small>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="999999.99"
                          className={`form-control ${validationErrors.precio ? 'is-invalid' : ''}`}
                          value={formData.precio}
                          onChange={(e) => handleInputChange('precio', e.target.value)}
                          required
                          disabled={loading}
                          placeholder="0.00"
                        />
                        {validationErrors.precio && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.precio}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          Stock * 
                          <small className="text-muted ms-2">(entero, máx. 999,999)</small>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="999999"
                          step="1"
                          className={`form-control ${validationErrors.stock ? 'is-invalid' : ''}`}
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                          required
                          disabled={loading}
                          placeholder="0"
                        />
                        {validationErrors.stock && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.stock}
                          </div>
                        )}
                        {formData.stock && productValidators.checkLowStock(parseInt(formData.stock)) && (
                          <small className="text-warning d-block mt-1">
                            <AlertTriangle size={12} className="me-1" />
                            Stock bajo (umbral: 10 unidades)
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          Imagen 
                          <small className="text-muted ms-2">(Opcional)</small>
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          className={`form-control ${validationErrors.imagen ? 'is-invalid' : ''}`}
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                        <small className="text-muted d-block mt-1">
                          Máx. 5MB. Formatos: JPG, PNG, GIF, WEBP
                          <br />
                          Dimensiones: 100x100 - 4000x4000 px
                        </small>
                        {validationErrors.imagen && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.imagen}
                          </div>
                        )}
                        {formData.imagen && (
                          <small className="text-success d-block mt-1">
                            ✓ {formData.imagen.name} ({(formData.imagen.size / 1024 / 1024).toFixed(2)} MB)
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="estadoCheck"
                        checked={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="estadoCheck">
                        Producto activo
                      </label>
                    </div>
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
                        {editingProduct ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingProduct ? 'Actualizar' : 'Guardar'
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

export default ProductManager;