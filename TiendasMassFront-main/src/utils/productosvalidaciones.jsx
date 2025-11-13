// utils/productValidators.js - Validadores reutilizables

export const productValidators = {
  // ✅ VALIDACIÓN DE NOMBRE
  nombre: (value) => {
    if (!value || value.trim() === '') {
      return 'El nombre del producto es requerido';
    }

    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    if (value.length > 100) {
      return 'El nombre no puede superar los 100 caracteres';
    }

    // Detectar caracteres peligrosos (XSS)
    const dangerousChars = /<script|<iframe|javascript:|onerror=/i;
    if (dangerousChars.test(value)) {
      return 'El nombre contiene caracteres no permitidos';
    }

    // Validar que no sea solo espacios o caracteres especiales
    if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(value)) {
      return 'El nombre debe contener al menos letras o números';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE DESCRIPCIÓN
  descripcion: (value) => {
    // La descripción es opcional
    if (!value || value.trim() === '') {
      return null; // Permitir descripción vacía
    }

    if (value.length > 500) {
      return 'La descripción no puede superar los 500 caracteres';
    }

    // Detectar HTML/Scripts maliciosos
    const dangerousChars = /<script|<iframe|javascript:|onerror=/i;
    if (dangerousChars.test(value)) {
      return 'La descripción contiene caracteres no permitidos';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE PRECIO
  precio: (value) => {
    if (!value || value === '') {
      return 'El precio es requerido';
    }

    const precio = parseFloat(value);

    if (isNaN(precio)) {
      return 'El precio debe ser un número válido';
    }

    if (precio <= 0) {
      return 'El precio debe ser mayor a 0';
    }

    if (precio > 999999.99) {
      return 'El precio no puede superar $999,999.99';
    }

    // Validar máximo 2 decimales
    if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
      return 'El precio solo puede tener hasta 2 decimales';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE STOCK
  stock: (value) => {
    if (value === '' || value === null || value === undefined) {
      return 'El stock es requerido';
    }

    const stock = parseInt(value, 10);

    if (isNaN(stock)) {
      return 'El stock debe ser un número válido';
    }

    if (stock < 0) {
      return 'El stock no puede ser negativo';
    }

    if (stock > 999999) {
      return 'El stock no puede superar 999,999 unidades';
    }

    // Validar que sea entero (no decimales)
    if (!Number.isInteger(parseFloat(value))) {
      return 'El stock debe ser un número entero';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE MARCA
  marca: (value) => {
    // La marca es opcional
    if (!value || value.trim() === '') {
      return null;
    }

    if (value.length > 50) {
      return 'La marca no puede superar los 50 caracteres';
    }

    // Permitir letras, números, espacios y algunos caracteres especiales
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s&.\-]+$/.test(value)) {
      return 'La marca contiene caracteres no válidos';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE CATEGORÍA
  categoriaId: (value) => {
    if (!value || value === '') {
      return 'Debes seleccionar una categoría';
    }

    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0) {
      return 'Categoría inválida';
    }

    return null;
  },

  // ✅ VALIDACIÓN DE IMAGEN
  imagen: (file) => {
    if (!file) {
      return null; // La imagen es opcional
    }

    // Validar que sea un archivo
    if (!(file instanceof File)) {
      return 'Archivo inválido';
    }

    // Validar tipo MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP)';
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'La imagen no puede superar los 5MB';
    }

    // Validar tamaño mínimo (evitar imágenes muy pequeñas)
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      return 'La imagen es demasiado pequeña';
    }

    return null;
  },

  // ✅ VALIDACIÓN COMPLETA DEL FORMULARIO
  validateForm: (formData) => {
    const errors = {};

    const nombreError = productValidators.nombre(formData.nombre);
    if (nombreError) errors.nombre = nombreError;

    const descripcionError = productValidators.descripcion(formData.descripcion);
    if (descripcionError) errors.descripcion = descripcionError;

    const precioError = productValidators.precio(formData.precio);
    if (precioError) errors.precio = precioError;

    const stockError = productValidators.stock(formData.stock);
    if (stockError) errors.stock = stockError;

    const marcaError = productValidators.marca(formData.marca);
    if (marcaError) errors.marca = marcaError;

    const categoriaError = productValidators.categoriaId(formData.categoriaId);
    if (categoriaError) errors.categoriaId = categoriaError;

    const imagenError = productValidators.imagen(formData.imagen);
    if (imagenError) errors.imagen = imagenError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // ✅ VALIDACIÓN DE STOCK BAJO (Para alertas)
  checkLowStock: (stock, threshold = 10) => {
    return stock <= threshold;
  },

  // ✅ VALIDACIÓN DE DUPLICADOS (Para buscar antes de guardar)
  checkDuplicate: (products, nombre, excludeId = null) => {
    return products.some(
      p => p.nombre.toLowerCase() === nombre.toLowerCase() && 
           p.id !== excludeId
    );
  },

  // ✅ FORMATEAR PRECIO (Antes de mostrar)
  formatPrice: (price) => {
    return parseFloat(price).toFixed(2);
  },

  // ✅ FORMATEAR STOCK (Quitar decimales)
  formatStock: (stock) => {
    return parseInt(stock, 10);
  }
};

export default productValidators;