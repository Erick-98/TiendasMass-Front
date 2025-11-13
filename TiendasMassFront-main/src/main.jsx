import React from 'react' 
import ReactDOM from 'react-dom/client';
import App from './App';  // Importa el componente App de forma correcta

 const root = ReactDOM.createRoot(document.getElementById('root'));
 root.render(
    <React.StrictMode>
    <App />  {/* Aquí solo se debe usar una vez */}
  </React.StrictMode>
   
 );