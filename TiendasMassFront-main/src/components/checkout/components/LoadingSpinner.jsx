import React from 'react';
import { IoReloadCircle } from 'react-icons/io5';
import './LoadingSpinner.css';

/**
 * Componente de carga/spinner mejorado con múltiples variantes
 * 
 * @param {string} message - Mensaje a mostrar debajo del spinner
 * @param {string} size - Tamaño: 'small', 'medium' (default), 'large'
 * @param {string} variant - Variante: 'primary' (default), 'secondary', 'overlay'
 * @param {boolean} fullScreen - Si debe ocupar toda la pantalla
 * @param {string} color - Color personalizado para el spinner
 * @param {string} className - Clases CSS adicionales
 */
const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 'medium',
  variant = 'primary',
  fullScreen = false,
  color = null,
  className = ''
}) => {
  const containerClass = `
    loading-spinner 
    loading-spinner--${size} 
    loading-spinner--${variant} 
    ${fullScreen ? 'loading-spinner--fullscreen' : ''} 
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClass}>
      <div className="loading-spinner__content">
        <IoReloadCircle 
          className="loading-spinner__icon" 
          style={color ? { color } : undefined}
          aria-label="Cargando"
        />
        {message && (
          <p className="loading-spinner__message" role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Variante con puntos animados
 */
export const LoadingDots = ({ 
  message = 'Cargando...', 
  color = '#e53e3e',
  size = 'medium' 
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__content">
        <div className="loading-dots" aria-label="Cargando">
          <span className="loading-dots__dot" style={{ background: color }}></span>
          <span className="loading-dots__dot" style={{ background: color }}></span>
          <span className="loading-dots__dot" style={{ background: color }}></span>
        </div>
        {message && (
          <p className="loading-spinner__message" role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Loader pequeño para usar en línea (botones, textos)
 */
export const InlineLoader = ({ 
  message = '', 
  size = 20,
  color = null 
}) => {
  return (
    <span className="loading-spinner loading-spinner--inline">
      <IoReloadCircle 
        className="loading-spinner__icon" 
        style={{ 
          fontSize: `${size}px`,
          ...(color && { color })
        }}
        aria-label="Cargando"
      />
      {message && (
        <span className="loading-spinner__message">{message}</span>
      )}
    </span>
  );
};

/**
 * Skeleton loader para placeholders
 */
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px',
  borderRadius = '4px',
  className = '' 
}) => {
  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{ width, height, borderRadius }}
      aria-label="Cargando contenido"
    />
  );
};

// Exportación por defecto
export default LoadingSpinner;

/* ============================================
   EJEMPLOS DE USO:
   ============================================

// 1. Spinner básico
<LoadingSpinner />

// 2. Spinner con mensaje personalizado
<LoadingSpinner message="Cargando productos..." />

// 3. Spinner pequeño
<LoadingSpinner size="small" message="Cargando..." />

// 4. Spinner grande para páginas
<LoadingSpinner size="large" message="Inicializando..." />

// 5. Overlay que cubre toda la pantalla
<LoadingSpinner variant="overlay" message="Procesando pago..." />

// 6. Pantalla completa
<LoadingSpinner fullScreen message="Cargando aplicación..." />

// 7. Color personalizado
<LoadingSpinner color="#F7B500" message="Subiendo..." />

// 8. Variante sin borde
<LoadingSpinner variant="secondary" />

// 9. Loader con puntos
<LoadingDots message="Conectando..." color="#3b82f6" />

// 10. Loader en línea (para botones)
<button disabled>
  <InlineLoader message="Guardando" size={16} />
</button>

// 11. Skeleton para placeholders
<SkeletonLoader width="200px" height="30px" />

*/