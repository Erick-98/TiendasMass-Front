import React from "react";
import '../styles/Contacto.css';
import Footer from '../components/footer/Footer'; // Asegúrate de que la ruta sea correcta
import Navbar from '../components/navbar/Navbar'; // Asegúrate de que la ruta sea correcta

const Contacto = () => {
  return (
    <div className="contacto-page">
      <Navbar />
      <section className="bienvenida-mass">
        <div className="top-section">
          <div className="text">
            <h2>¡HOLA!<br />SOY TU TIENDA MASS</h2>
            <p className="txt-banner">Soy la tienda con los mejores precios y los productos necesarios para tu hogar, siempre cerquita a ti.</p>
          </div>
          <div className="image">
            <img src="https://www.tiendasmass.com.pe/wp-content/themes/mass/img/DSC_34711.webp" alt="Tienda Mass" />
        </div>
      </div>

      <div className="bottom-section">
        <div className="card"> <div className="card-img-wrapper"> <img src="https://www.tiendasmass.com.pe/wp-content/uploads/2023/05/DSC_34341.png" alt="Trabajadora Mass" /> </div> <div className="card-text"> <h3>MI PROPUESTA DE VALOR</h3> <p> "Soy una tienda con los precios más bajos cerca de ti, y lo consigo gracias a mis surtidos optimizados especializados en marcas propias de calidad que cubren las necesidades diarias de mi caser@." </p> </div> </div>

        <div className="explicacion">
          <h3>Soy una tienda de precios bajos</h3>
          <p className="subtitulo">¿Cómo lo logro?</p>
          <ul>
            <li><strong>PROCESOS SIMPLES</strong></li>
            <li><strong>COSTOS BAJOS</strong></li>
            <li><strong>PRECIOS BAJOS SIEMPRE</strong></li>
          </ul>
          <p className="txt-explicacion">
            Manteniendo siempre procesos simples y costos bajos, logro tener los mejores precios todos los días cerca de tu hogar.
            <br />
            ¡Pero eso no es todo! También me esfuerzo en mantener los precios en donde para asegurarte que yo tengo los mejores.
          </p>
        </div>
      </div>
    </section>




    {/* Footer al final */}
      <Footer />
    </div>
    

  );
};


export default Contacto;