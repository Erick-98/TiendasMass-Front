import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Componente para mostrar mensajes de error
 */
export const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-message">
      <AlertCircle size={14} />
      <span>{error}</span>
    </div>
  );
};

export default ErrorMessage;
