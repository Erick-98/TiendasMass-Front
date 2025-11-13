// CompanyLogo.jsx
import React from 'react';
import './AuthStyles.css';
import logo from '../../assets/logo.png'; 
function CompanyLogo() {
  return (
    <div className="logo-container">
      <div className="logo-placeholder">
        {
        <img 
          src={logo}
          alt="Logo de la empresa" 
          className="company-logo" 
        />
        }
      </div>
    </div>
  );
}

export default CompanyLogo;