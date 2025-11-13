
import React from 'react';
import { Menu, Bell, ChevronRight } from 'lucide-react';

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <Menu />
        </button>
        <nav className="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="#">Inicio</a>
            </li>
            <li className="breadcrumb-item active">Panel de Control</li>
          </ol>
        </nav>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          <Bell />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <div className="user-avatar">A</div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
