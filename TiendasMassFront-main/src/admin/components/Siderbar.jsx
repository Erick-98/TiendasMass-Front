import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Folder, Users, ShoppingCart, Settings, CreditCard, UserPlus, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

const URL = "http://localhost:443"; // URL de Azure

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/categorias', label: 'Categorías', icon: Folder },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { to: '/admin/reportes', label: 'Pedidos', icon: ShoppingCart },
    { to: '/admin/estados', label: 'Estados', icon: Settings },
    { to: '/admin/metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
    { to: '/admin/crear-admin', label: 'Crear Admin', icon: UserPlus },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: '¿Desea Salir del panel de administrativo?',
      text: '¿Estás seguro de que quieres salir del panel administrativo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar datos de admin
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has salido del panel administrativo',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirigir al home o menú principal
        navigate('/');  // Aquí redirige al home, o menú principal según lo que necesites
      }
    });
  };

  const getAdminInfo = () => {
    try {
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        const userData = JSON.parse(adminUser);
        return {
          nombre: userData.nombre,
          email: userData.email,
          rol: userData.rol?.nombre
        };
      }
    } catch (error) {
      console.error('Error al obtener datos de admin:', error);
    }
    return null;
  };

  const adminInfo = getAdminInfo();

  return (
    <nav className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">M</div>
          {!collapsed && <div className="logo-text">Mass Admin</div>}
        </div>
      </div>

      {/* Información del administrador */}
      {adminInfo && !collapsed && (
        <div className="admin-info">
          <div className="admin-name">{adminInfo.nombre}</div>
          <div className="admin-email">{adminInfo.email}</div>
          <div className="admin-role">{adminInfo.rol}</div>
        </div>
      )}

      <ul className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <li key={item.to} className="nav-item">
              <Link
                to={item.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="nav-icon" />
                {!collapsed && <span className="nav-text">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Botón de logout */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-button custom-logout-button"
          title={collapsed ? 'Cerrar sesión' : ''}
        >
          <LogOut className="nav-icon" />
          {!collapsed && <span className="nav-text">Cerrar Sesión</span>}
        </button>
        <button
          onClick={() => navigate('/')}
          className="logout-button exit-panel-button"
          style={{ marginTop: 8, background: '#f5f5f5', color: '#d35400', border: '1px solid #d35400' }}
          title={collapsed ? 'Salir del panel' : ''}
        >
          <span className="nav-icon" role="img" aria-label="Salir">🚪</span>
          {!collapsed && <span className="nav-text">Salir del panel</span>}
        </button>
      </div>

    </nav>
  );
};

export default Sidebar;

/*
Agrega en tu CSS:
.exit-panel-button:hover {
  background: #ffe5d0;
  color: #fff;
  border-color: #d35400;
}
.custom-logout-button {
  background: #f8f9fa;
  color: #b71c1c;
  border: 1.5px solid #b71c1c;
  border-radius: 8px;
  width: 100%;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s, border 0.2s;
  cursor: pointer;
  margin-bottom: 4px;
}
.custom-logout-button .nav-icon {
  font-size: 1.3rem;
}
.custom-logout-button:hover {
  background: #ffb3b3;
  color: #fff;
  border-color: #e53935;
}
*/