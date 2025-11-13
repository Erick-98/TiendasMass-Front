// AuthContainer.jsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CompanyLogo from './CompanyLogo';
import './AuthStyles.css';


function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  
  const switchView = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <CompanyLogo />
        
        {isLogin ? (
          <LoginForm switchToRegister={switchView} />
        ) : (
          <RegisterForm switchToLogin={switchView} />
        )}
      </div>
    
    </div>
  );
}

export default AuthContainer;