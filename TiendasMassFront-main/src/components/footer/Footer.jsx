import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer py-4">
      <div className="container">
        <div className="row">
          <div className="col-12 mdp">
            <div className="metodos-pago d-flex align-items-center mb-5">
              <h4 className="section-title mb-0">MÉTODOS DE PAGO</h4>
              <img
                src="https://www.tiendasmass.com.pe/wp-content/uploads/2025/01/BannerMedioPagoWeb_Desktop.png"
                alt="Métodos de pago"
                className="payment-img img-fluid ms-4"
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-lg-9">
            <div className="row p-0">
              <div className="col-12 p-lg-0 mb-4 mb-lg-5 azul">
                <h5>CONÓCEME</h5>
                <div className="menu-footer-container">
                  <ul id="menu-footer" className="menu">
                    <li className="menu-item">
                      <a href="https://www.tiendasmass.com.pe/conoceme/">Conóceme</a>
                    </li>
                    <li className="menu-item">
                      <a href="https://www.tiendasmass.com.pe/precios-mass/">Precios Mass</a>
                    </li>
                    <li className="menu-item">
                      <a href="https://www.tiendasmass.com.pe/ubicame/">Ubícame</a>
                    </li>
                    <li className="menu-item">
                      <a href="https://www.tiendasmass.com.pe/productos/">Productos</a>
                    </li>
                    <li className="menu-item">
                      <a
                        href="https://linktr.ee/MassTrabajaConmigo?utm_source=qr_code"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Trabaja conmigo
                      </a>
                    </li>
                    <li className="menu-item">
                      <a href="https://www.tiendasmass.com.pe/ofrece-tu-local/">¿Cómo ofrecer mi local?</a>
                    </li>
                    <li className="menu-item">
                      <a
                        href="https://ofrecetulocal.tiendasmass.com.pe/local/registro/1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Alquila tu local
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-12 p-0 rrss d-none d-lg-flex">
                <h5>SÍGUEME EN</h5>
                <a href="https://www.facebook.com/TiendasMassPeru" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/facebook-color.webp"
                    alt="Facebook"
                    width="40"
                    height="40"
                  />
                </a>
                <a href="https://www.instagram.com/tiendasmassperu/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/instagram-color.webp"
                    alt="Instagram"
                    width="40"
                    height="40"
                  />
                </a>
                <a href="https://www.tiktok.com/@tiendasmassperu" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/tiktok-color.webp"
                    alt="TikTok"
                    width="40"
                    height="40"
                  />
                </a>
                <a href="https://www.youtube.com/@TiendasMass/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/youtube-color.webp"
                    alt="YouTube"
                    width="40"
                    height="40"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <h5 className="mb-2">Servicio al cliente</h5>
            <p className="mb-0 azul">Horario de atención:</p>
            <p className="azul">De lunes a domingo de 7 AM a 10 PM</p>
            <a href="mailto:servicioalcliente@tiendasmass.pe" className="azul">
              <p className="mb-2 mb-lg-3">servicioalcliente@tiendasmass.pe</p>
            </a>
            <a className="azul" style={{ cursor: 'pointer' }} id="btnModal">
              <p className="mb-2 mb-lg-0">Políticas de cambios y devoluciones</p>
            </a>
            <a href="https://www.tiendasmass.com.pe/legales" className="azul">
              <p className="mb-2 mb-lg-auto">Términos y condiciones</p>
            </a>
            <a href="https://ax.axteroid.com/consulta/20608280333" target="_blank" rel="noopener noreferrer" className="azul">
              <p className="mb-4 mb-lg-auto">Comprobante electrónico</p>
            </a>
            <a href="https://www.tiendasmass.com.pe/libro-de-reclamaciones/" className="azul d-none d-lg-block mt-3">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/uploads/2024/03/libroReclamaciones.webp"
                alt="Libro de Reclamaciones"
                width="200"
              />
            </a>
          </div>

          <div className="col-12 p-lg-0 rrss d-lg-none">
            <h5 className="mb-2 mb-lg-auto">SÍGUEME EN</h5>
            <a href="https://www.facebook.com/TiendasMassPeru" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/facebook-color.webp"
                alt="Facebook"
                width="40"
                height="40"
              />
            </a>
            <a href="https://www.instagram.com/tiendasmassperu/" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/instagram-color.webp"
                alt="Instagram"
                width="40"
                height="40"
              />
            </a>
            <a href="https://www.tiktok.com/@tiendasmassperu" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/tiktok-color.webp"
                alt="TikTok"
                width="40"
                height="40"
              />
            </a>
            <a href="https://www.youtube.com/@TiendasMass/" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/youtube-color.webp"
                alt="YouTube"
                width="40"
                height="40"
              />
            </a>
          </div>

          <div className="col-12 p-lg-0 rrss d-lg-none mt-3">
            <a href="https://www.tiendasmass.com.pe/libro-de-reclamaciones/">
              <img
                src="https://www.tiendasmass.com.pe/wp-content/uploads/2024/03/libroReclamaciones.webp"
                alt="Libro de Reclamaciones"
                width="200"
              />
            </a>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center mt-4">
            <p className="year">© Tiendas Mass 2025 <br /> Compañía Hard Discount S.A.C</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
