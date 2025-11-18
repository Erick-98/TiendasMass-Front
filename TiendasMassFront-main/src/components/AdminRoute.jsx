import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUsuario } from '../context/userContext';
import SetupAdmin from '../admin/components/SetupAdmin';
import { API_URL } from '../utils/constants';

const AdminRoute = ({ children }) => {
  const { usuario } = useUsuario();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/setup/status`);
      const data = await response.json();
      setNeedsSetup(data.needsSetup);
      setCheckingSetup(false);
    } catch (error) {
      setCheckingSetup(false);
      setNeedsSetup(false);
    }
  };

  if (checkingSetup) {
    return <div>Verificando sistema...</div>;
  }

  if (needsSetup) {
    return <SetupAdmin />;
  }

  // Si no hay usuario autenticado, redirigir al login normal
  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Verificar si es admin
  const esAdmin = usuario && (
    ["admin", "ADMIN", "Administrador"].includes(usuario.rol?.nombre) ||
    usuario.rol?.id === 1 ||
    usuario.rol?.id === 3
  );

  if (!esAdmin) {
    return <Navigate to="/" />;
  }

  // Si es admin, mostrar el contenido protegido
  return children;
};

export default AdminRoute; 