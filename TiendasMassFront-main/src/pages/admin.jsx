import React from 'react';
import '../styles/admin.css'; 
import Header from '../admin/components/Header';
import Sidebar from '../admin/components/Siderbar';
import { Outlet } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="admin-layout" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenedor derecho: Header arriba y contenido abajo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header alineado arriba del contenido */}
        <Header />

        {/* Contenido principal debajo del header */}
        <main className="admin-main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet /> {/* Renderiza las subrutas */}
        </main>
      </div>
    </div>
  );
};

export default Admin;
