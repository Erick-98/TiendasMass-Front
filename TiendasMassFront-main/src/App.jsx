import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Categorias from './pages/categorias';
import CheckoutPage from './pages/CheckoutPage';
import Contacto from './pages/Contacto';
import { CarritoProvider } from './context/carContext';
import { UsuarioProvider } from './context/userContext';
import ResultadosBusqueda from './pages/ResultadosBusqueda';
import React from 'react';
import UserProfile from './pages/perfil'; 
import DetalleProducto from './components/productos/detalleproductomodal';

import Admin from './pages/admin';
import Dashboard from './admin/components/Dashboard';
import GestionCategorias from './admin/components/GestionCategorias';
import GestionEstados from './admin/components/GestionEstados';
import GestionMetodoPago from './admin/components/GestionMetodoPago';
import GestionProducto from './admin/components/GestionProducto';
import GestionUsuarios from './admin/components/GestionUsuarios';
import ReportesPedidos from './admin/components/ReportesPedidos';
import CrearAdmin from './admin/components/CrearAdmin';
import AdminRoute from './components/AdminRoute';

import './App.css';

function App() {
  return (
    <UsuarioProvider>
      <CarritoProvider>
        <Router>
          <Routes>
            {/* Rutas del panel de administración */}
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categorias" element={<GestionCategorias />} />
              <Route path="estados" element={<GestionEstados />} />
              <Route path="metodos-pago" element={<GestionMetodoPago />} />
              <Route path="productos" element={<GestionProducto />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="reportes" element={<ReportesPedidos />} />
              <Route path="crear-admin" element={<CrearAdmin />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            <Route path="/buscar" element={<ResultadosBusqueda />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/perfil" element={<UserProfile />} /> 
            <Route path="/contacto" element={<Contacto />} /> 
          </Routes>
        </Router>
      </CarritoProvider>
    </UsuarioProvider>
  );
}

export default App;



