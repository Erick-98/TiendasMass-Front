import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Banner from '../components/carousel/banner';
import Footer from '../components/footer/Footer';
import ProductCard from '../components/productos/productCard';
import '../styles/SearchResults.css';
import ProductDetailModal from '../components/productos/detalleproductomodal';
import { API_URL } from '../utils/constants';

const ResultadosBusqueda = () => {
    const [productos, setProductos] = useState([]);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');
    // Estado para el modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
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

    useEffect(() => {
        const buscarProductos = async () => {
            if (!query) return;
            try {
                const res = await fetch(`${API_URL}/api/products?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setProductos(data);
            } catch (error) {
                console.error('Error al buscar:', error);
            }
        };
        buscarProductos();
    }, [query]);

    return (
        <div className="search-results-page">
        
            <Navbar />
            <Banner titulo="RESULTADOS DE BÚSQUEDA" />


            <section className="search-section">
                <div className="search-header">
                    <h2 className="search-title">RESULTADOS DE BÚSQUEDA</h2>
                    <h4>
                        Resultados para: <em>"{query}"</em> ({productos.length} producto{productos.length !== 1 && 's'} encontrados)
                    </h4>
                </div>

                {productos.length === 0 ? (
                    <p className="empty-result">No se encontraron productos.</p>
                ) : (
                    <div className="productos-grid">
                        {productos.map(producto => (
                            <div key={producto.id} className="producto-item">
                                <ProductCard
                                    key={producto.id}
                                    producto={producto}
                                    onClick={openModal}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
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

export default ResultadosBusqueda;