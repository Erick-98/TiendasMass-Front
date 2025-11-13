import React, { useState } from 'react';
import Productos from '../components/productos/productos';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import Banner from '../components/carousel/banner';
import '../styles/categorias.css';
import ProductDetailModal from '../components/productos/detalleproductomodal';

// Ajusta esto al nombre/case correcto de tu archivo:
import CategoryCarousel from '../components/carousel/categoriacarousel';

const Categorias = () => {
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  // Estado para el modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handler para seleccionar categoría
  const handleSelectCategoria = (cat) => {
    setCategoriaActiva(cat);
  };

  // Abrir modal con producto seleccionado
  const openModal = (producto) => {
    setSelectedProduct(producto);
    setModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setSelectedProduct(null);
    setModalOpen(false);
  };

  return (
    <div className="categorias-page">
      <header className="header">
        <Navbar />
        <Banner />
      </header>

      <main className="layout-contenido">
        <section className="categorias-grid-container">
          <h2 className="sub">CATEGORÍAS</h2>
          <CategoryCarousel onSelect={handleSelectCategoria} />
        </section>

        <h2 className="sub">PRODUCTOS</h2>
        <section className="productos-grid-container">
          <Productos
            categoriaId={categoriaActiva?.id}
            onProductClick={openModal} // <-- Pasamos el handler para abrir modal
          />
        </section>
      </main>

      {/* Renderizamos el modal */}
      <ProductDetailModal
        isOpen={modalOpen}
        product={selectedProduct}
        onClose={closeModal}
      />

      <Footer />
    </div>
  );
};

export default Categorias;
