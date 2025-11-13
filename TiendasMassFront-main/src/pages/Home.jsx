import React, { useState } from 'react';
import '../styles/Home.css';
import Footer from '../components/footer/Footer';
import Navbar from '../components/navbar/Navbar';
import ProductCarousel from '../components/carousel/productCarousel';
import WhatsAppButton from '../button/whatsappbutton';
import Banner from '../components/carousel/banner';
import ProductDetailModal from '../components/productos/detalleproductomodal';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalOpen(false);
  };

  return (
    <div className="home-page">
      <Navbar abrirModal={openModal}/>

      {/* Banners principales */}
      <div className="banner-container">
        <Banner />
      </div>

      {/* Texto destacado con fondo azul */}
      <div className="blue-container">
        <section className="bg-azul-personalizado py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h2>¡LOS MEJORES PRECIOS DEL BARRIO!</h2>
                <p>
                  Caser@, a mí nadie me gana, yo tengo siempre los{' '}
                  <strong>mejores precios</strong>, y además, estoy{' '}
                  <strong>cerca a tu hogar</strong>.
                </p>
                <p>
                  ¡No te pierdas los mejores precios del barrio aquí!
                </p>
                <a href="/admin" className="btn btn-light mt-3">
                  QUIERO VER
                </a>
              </div>
              <div className="col-md-6 text-center">
                <img
                  className="img-fluid"
                  src="https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/mano-catalogos.webp"
                  alt="Catálogo"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Productos destacados: PRECIOS MÁS MASS */}
      <div className="productos-container">
        <section className="bg-light-custom py-5">
          <div className="container-fluid px-5">
            <h2 className="sub text-left mb-4 text-primary">PRECIOS MÁS MASS</h2>
            <ProductCarousel onProductClick={openModal} />
          </div>
        </section>
      </div>

      {/* Productos destacados: MASS CALIDAD */}
      <div className="productos-container">
        <section className="bg-light-custom2 py-5">
          <div className="container-fluid px-5">
            <h2 className="sub text-left mb-4 text-primary">MENOR PRECIO, MASS CALIDAD</h2>
            <ProductCarousel onProductClick={openModal} />
          </div>
        </section>
      </div>

      {/* Modal de detalle de producto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={closeModal}
      />

      {/* Botón de WhatsApp */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
      