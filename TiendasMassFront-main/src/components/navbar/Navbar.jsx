import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUsuario } from '../../context/userContext';
import { useCarrito } from '../../context/carContext';
import Carrito from '../car/Carrito';
import './navbar.css';
import logo from '../../assets/logo.png';
const API_URL = "http://localhost:443";

// Componente SearchBar separado
const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  sugerencias, 
  setSugerencias, 
  navigate, 
  setMenuOpen, 
  abrirModal 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen?.(false);
      setSugerencias([]);
    }
  };

  return (
    <div className="search-wrapper">
      <form
        className="navbar-search"
        onSubmit={handleSubmit}
        role="search"
      >
        <input
          type="search"
          placeholder="Buscar productos…"
          className="navbar-search-input"
          aria-label="Buscar productos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" aria-label="Buscar" className="navbar-search-btn">
          <i className="bi bi-search" style={{ fontSize: '18px', color: '#0033a0' }}></i>
        </button>
      </form>

      {searchTerm && sugerencias.length > 0 && (
        <ul className="search-suggestions">
          {sugerencias.map(prod => (
            <li
              key={prod.id}
              onClick={() => {
                abrirModal(prod);
                setSearchTerm('');
                setSugerencias([]);
                setMenuOpen?.(false);
              }}
            >
              {prod.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Componente CartCounter separado
const CartCounter = ({ totalItems }) => (
  totalItems > 0 ? <span className="cart-counter">{totalItems}</span> : null
);

// Componente CartButton separado
const CartButton = ({ onClick, totalItems, className = "" }) => (
  <button 
    className={`icon-btn ${className}`} 
    aria-label="Carrito" 
    onClick={onClick}
  >
    <i 
      className="bi bi-basket3-fill" 
      style={{ fontSize: '22px', color: '#0033a0' }}
    ></i>
    <CartCounter totalItems={totalItems} />
  </button>
);

// Componente UserButton separado
const UserButton = ({ 
  isLoggedIn, 
  nombreUsuario, 
  handleLoginClick, 
  handleLogout, 
  isMobile = false, 
  closeMenu, 
  esAdmin // nuevo prop
}) => {
  if (!isLoggedIn) {
    return (
      <button className="login-btn" onClick={handleLoginClick}>
        <i className="bi bi-person-fill" style={{ marginRight: '6px' }}></i>
        Iniciar sesión
      </button>
    );
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-primary dropdown-toggle login-btn"
        type="button"
        id={isMobile ? "dropdownMenuButton" : "dropdownMenuButtonDesktop"}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {isMobile ? nombreUsuario : `¡Hola!, ${nombreUsuario}`}
      </button>
      <ul className="dropdown-menu" aria-labelledby={isMobile ? "dropdownMenuButton" : "dropdownMenuButtonDesktop"}>
        {esAdmin && (
          <li>
            <Link className="dropdown-item" to="/admin" onClick={isMobile ? closeMenu : undefined}>
              <i className="bi bi-speedometer2" style={{ marginRight: 6, fontSize: 18 }}></i>
              Panel de Administrador
            </Link>
          </li>
        )}
        <li>
          <Link className="dropdown-item" to="/perfil" onClick={isMobile ? closeMenu : undefined}>
            Perfil
          </Link>
        </li>
        <li>
          <button className="dropdown-item" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

// Componente BurgerButton separado
const BurgerButton = ({ menuOpen, toggleMenu }) => (
  <button 
    className="navbar-burger" 
    onClick={toggleMenu} 
    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
  >
    <span className="burger-bar"></span>
    <span className="burger-bar"></span>
    <span className="burger-bar"></span>
  </button>
);

// Componente MobileMenu separado
const MobileMenu = ({ 
  menuOpen, 
  searchTerm, 
  setSearchTerm, 
  sugerencias, 
  setSugerencias, 
  navigate, 
  setMenuOpen, 
  abrirModal, 
  closeMenu, 
  toggleCarrito, 
  totalItems, 
  isLoggedIn, 
  nombreUsuario, 
  handleLoginClick, 
  handleLogout, 
  mostrarCarrito, 
  usuario, 
  esAdmin // nuevo prop
}) => (
  <div className={`navbar-content${menuOpen ? ' open' : ''}`}>
    <div className="navbar-search-mobile">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sugerencias={sugerencias}
        setSugerencias={setSugerencias}
        navigate={navigate}
        setMenuOpen={setMenuOpen}
        abrirModal={abrirModal}
      />
    </div>

    <ul className="navbar-links">
      <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
      <li><Link to="/categorias" onClick={closeMenu}>Categorías</Link></li>
      <li><Link to="/contacto" onClick={closeMenu}>Contacto</Link></li>
    </ul>

    <div className="navbar-mobile-actions">
      <CartButton onClick={toggleCarrito} totalItems={totalItems} />
      <UserButton
        isLoggedIn={isLoggedIn}
        nombreUsuario={nombreUsuario}
        handleLoginClick={handleLoginClick}
        handleLogout={handleLogout}
        isMobile={true}
        closeMenu={closeMenu}
        esAdmin={esAdmin}
      />
      {mostrarCarrito && (
        <div className="carrito-dropdown">
          <Carrito />
        </div>
      )}
    </div>
  </div>
);

// Componente Navbar principal
const Navbar = ({ abrirModal }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  const navigate = useNavigate();
  const { usuario, logout } = useUsuario();
  const { carrito } = useCarrito();

  const isLoggedIn = Boolean(usuario);
  const nombreUsuario = usuario?.nombre || 'Usuario';
  const totalItems = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);

  const esAdmin = usuario && (
    ["admin", "ADMIN", "Administrador"].includes(usuario.rol?.nombre) ||
    usuario.rol?.id === 1 ||
    usuario.rol?.id === 3
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSugerencias([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/products?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSugerencias(data.slice(0, 5));
      } catch (err) {
        console.error('Error buscando productos:', err);
        setSugerencias([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleLoginClick = () => navigate('/login');
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleCarrito = () => setMostrarCarrito(!mostrarCarrito);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`navbar-container${menuOpen ? ' menu-open' : ''}${scrolled ? ' scrolled' : ''}`}>
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}

      <nav className="navbar">
        <div className="navbar-main">
          <div className="navbar-logo">
            <Link to="/" onClick={closeMenu}>
              <img src={logo} alt="logo" />
            </Link>
          </div>

          <div className="navbar-search-desktop">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sugerencias={sugerencias}
              setSugerencias={setSugerencias}
              navigate={navigate}
              setMenuOpen={setMenuOpen}
              abrirModal={abrirModal}
            />
          </div>

          <BurgerButton menuOpen={menuOpen} toggleMenu={toggleMenu} />

          <MobileMenu
            menuOpen={menuOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sugerencias={sugerencias}
            setSugerencias={setSugerencias}
            navigate={navigate}
            setMenuOpen={setMenuOpen}
            abrirModal={abrirModal}
            closeMenu={closeMenu}
            toggleCarrito={toggleCarrito}
            totalItems={totalItems}
            isLoggedIn={isLoggedIn}
            nombreUsuario={nombreUsuario}
            handleLoginClick={handleLoginClick}
            handleLogout={handleLogout}
            mostrarCarrito={mostrarCarrito}
            usuario={usuario}
            esAdmin={esAdmin}
          />

          <div className="navbar-actions">
            <div className="cart-container">
              <CartButton onClick={toggleCarrito} totalItems={totalItems} />
              {mostrarCarrito && (
                <div className="carrito-dropdown">
                  <Carrito />
                </div>
              )}
            </div>
            <UserButton
              isLoggedIn={isLoggedIn}
              nombreUsuario={nombreUsuario}
              handleLoginClick={handleLoginClick}
              handleLogout={handleLogout}
              esAdmin={esAdmin}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;