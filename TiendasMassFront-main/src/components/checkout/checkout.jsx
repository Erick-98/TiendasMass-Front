import React, { useState, useEffect } from 'react';
import { useCarrito } from '../../context/carContext';
import { useUsuario } from '../../context/userContext';
import { useCheckoutData } from './hooks/useCheckoutData';
import { useCheckoutValidation } from './hooks/useCheckoutValidation';
import { useCheckoutForm } from './hooks/useCheckoutForm';
import { CheckoutHeader } from './components/CheckoutHeader';
import { OrderSummary } from './components/OrderSummary';
import LoadingSpinner from './components/LoadingSpinner';
import { Step1Shipping } from './steps/Step1Shipping';
import { Step2Payment } from './steps/Step2Payment';
import { Step3Confirmation } from './steps/Step3Confirmation';
import { checkoutService } from './services/checkoutService';
import { paymentService } from './services/paymentService';
import { determinePaymentStatus } from './utils/paymentStatus';
import { parsePrice } from './utils/formatters';
import './checkout.css';

export default function Checkout({
  activeStep,
  setActiveStep,
  formData,
  setFormData,
  onChange,
}) {
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [error, setError] = useState('');
  const [mpReturnStatus, setMpReturnStatus] = useState(null); // 🔥 NUEVO: Estado para mostrar mensaje de retorno

  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    quitarProducto,
    total: carritoTotal,
    vaciarCarrito,
  } = useCarrito();

  const { usuario, getAuthHeaders } = useUsuario();

  const { metodosPago, userCards, userAddresses, loading: dataLoading } = useCheckoutData(
    usuario,
    getAuthHeaders
  );

  const validation = useCheckoutValidation();

  const form = useCheckoutForm(onChange, validation, formData);

  // Cargar datos del usuario en el formulario
  useEffect(() => {
    if (usuario) {
      if (!formData.fullName) onChange('fullName', usuario.nombre || '');
      if (!formData.email) onChange('email', usuario.email || '');
      if (!formData.phone) onChange('phone', usuario.telefono || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // 🔥 NUEVO: Detectar retorno de Mercado Pago y crear pedido
  useEffect(() => {
    const handleMercadoPagoReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const paymentId = urlParams.get('payment_id');
      const preferenceId = urlParams.get('preference_id');

      // Si viene de Mercado Pago
      if (status && (paymentId || preferenceId)) {
        console.log('🔄 Retorno de Mercado Pago detectado:', { status, paymentId, preferenceId });
        
        // Mostrar mensaje de retorno
        setMpReturnStatus(status);

        // Si el pago fue exitoso y tenemos carrito, crear el pedido
        if (status === 'approved' || status === 'success') {
          // Verificar si ya creamos el pedido (para evitar duplicados)
          const pedidoGuardado = sessionStorage.getItem('pedido_mp_procesado');
          if (pedidoGuardado) {
            console.log('✅ Pedido ya fue procesado anteriormente');
            // Limpiar URL
            window.history.replaceState({}, '', '/checkout');
            return;
          }

          if (carrito && carrito.length > 0) {
            try {
              console.log('💾 Creando pedido después de pago exitoso...');
              setLoading(true);
              
              // Crear el pedido automáticamente
              const result = await crearPedido();
              
              if (result) {
                // Marcar como procesado
                sessionStorage.setItem('pedido_mp_procesado', 'true');
                console.log('✅ Pedido creado exitosamente:', result);
                
                // Avanzar a confirmación
                setActiveStep(3);
                
                // Limpiar el estado de retorno después de 3 segundos
                setTimeout(() => setMpReturnStatus(null), 3000);
              }
            } catch (err) {
              console.error('❌ Error al crear pedido:', err);
              setError('El pago fue exitoso pero hubo un error al crear el pedido. Por favor contacta a soporte.');
            } finally {
              setLoading(false);
            }
          }
        } else if (status === 'pending') {
          setError('⏳ Tu pago está pendiente de aprobación. Te notificaremos cuando se confirme.');
        } else if (status === 'failure') {
          setError('❌ El pago fue rechazado. Por favor intenta nuevamente.');
        }

        // Limpiar parámetros de la URL después de un momento
        setTimeout(() => {
          window.history.replaceState({}, '', '/checkout');
        }, 500);
      }
    };

    handleMercadoPagoReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular totales
  const subtotal = carritoTotal;
  const shippingCost = formData.deliveryType === 'pickup' ? 0 : 9.99;
  const taxes = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shippingCost + taxes).toFixed(2);

  // Crear pedido
  const crearPedido = async () => {
    setLoading(true);
    setError('');

    try {
      if (!carrito || carrito.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Faltan datos requeridos del usuario');
      }

      if (!form.paymentMethod) {
        throw new Error('Debes seleccionar un método de pago');
      }

      // Determinar método de pago
      let metodoPagoId = null;
      if (form.paymentMethod === 'userCard') {
        if (!form.selectedCardId) {
          throw new Error('Debes seleccionar una tarjeta');
        }
        const metodoTarjeta = metodosPago.find(
          (m) =>
            m.tipo === 'tarjeta' ||
            m.nombre?.toLowerCase().includes('tarjeta')
        );
        metodoPagoId = metodoTarjeta ? metodoTarjeta.id : metodosPago[0]?.id;
      } else {
        metodoPagoId = parseInt(form.paymentMethod);
      }

      // Construir dirección de envío
      let direccionEnvio = '';
      if (formData.deliveryType === 'delivery') {
        if (form.useCustomAddress || !form.selectedAddressId) {
          // Usar dirección personalizada o dirección del formData si no hay dirección seleccionada
          direccionEnvio = `${formData.address}, ${formData.city} ${formData.zipCode}`;
        } else if (form.selectedAddressId && form.selectedAddressId !== 'custom') {
          const selectedAddress = userAddresses.find(
            (addr) => addr.id.toString() === form.selectedAddressId
          );
          if (selectedAddress) {
            direccionEnvio = `${selectedAddress.calle}, ${selectedAddress.ciudad} ${selectedAddress.codigoPostal}`;
            if (selectedAddress.referencia) {
              direccionEnvio += ` (${selectedAddress.referencia})`;
            }
          }
        }
      } else {
        direccionEnvio = formData.selectedStore || 'Recojo en tienda';
      }

      const pedidoData = {
        usuarioId: usuario?.id || null,
        direccionEnvio: direccionEnvio,
        metodoPagoId: metodoPagoId,
        montoTotal: total,
        detalles: carrito.map((item) => ({
          productoId: parseInt(item.id),
          cantidad: parseInt(item.cantidad),
        })),
      };

      if (form.paymentMethod === 'userCard' && form.selectedCardId) {
        const selectedCard = userCards.find(
          (card) => card.id.toString() === form.selectedCardId
        );
        if (selectedCard) {
          pedidoData.tarjetaInfo = {
            tarjetaId: selectedCard.id,
            tipoTarjeta: selectedCard.tipoTarjeta,
            numeroEnmascarado: selectedCard.numeroEnmascarado,
            fechaVencimiento: selectedCard.fechaVencimiento,
            nombreEnTarjeta: selectedCard.nombreEnTarjeta,
          };
        }
      }

      console.log('📦 Enviando datos:', JSON.stringify(pedidoData, null, 2));

      const result = await checkoutService.createOrder(
        pedidoData,
        usuario?.token
      );

      console.log('✅ Pedido creado:', result);

      const selectedMethod = metodosPago.find(
        (m) => m.id.toString() === form.paymentMethod
      );

      const estadoPagoCalculado = determinePaymentStatus(
        result,
        selectedMethod
      );

      let detallesPedidos = [];
      if (
        Array.isArray(result.detallesPedidos) &&
        result.detallesPedidos.length > 0
      ) {
        detallesPedidos = result.detallesPedidos.map((detalle, index) => ({
          id: detalle.id || `detalle_${result.pedidoId}_${index}`,
          cantidad: detalle.cantidad,
          precio: detalle.precio,
          subtotal: detalle.subtotal || detalle.precio * detalle.cantidad,
          producto: {
            id:
              detalle.producto?.id ||
              detalle.productoId ||
              carrito[index]?.id,
            nombre:
              detalle.producto?.nombre ||
              carrito[index]?.nombre ||
              carrito[index]?.title ||
              'Producto sin nombre',
          },
        }));
      } else {
        detallesPedidos = carrito.map((item, index) => ({
          id: `detalle_${result.pedidoId}_${index}`,
          cantidad: item.cantidad,
          precio: parsePrice(item.precio),
          subtotal: parsePrice(item.precio) * item.cantidad,
          producto: {
            id: item.id,
            nombre: item.nombre || item.title || 'Producto sin nombre',
          },
        }));
      }

      setPedidoCreado({
        id: result.pedidoId || result.id,
        montoTotal: result.montoTotal || total,
        direccionEnvio: result.direccionEnvio || pedidoData.direccionEnvio,
        estado: result.estado || 'PENDIENTE',
        estadoPago: estadoPagoCalculado,
        metodoPago: {
          id: pedidoData.metodoPagoId,
          nombre:
            selectedMethod?.nombre ||
            result.metodoPago?.nombre ||
            'Método no especificado',
        },
        detallesPedidos,
        resumen: {
          items: detallesPedidos,
          subtotal: subtotal,
          shippingCost: shippingCost,
          taxes: taxes,
          total: total,
        },
      });

      if (vaciarCarrito) {
        vaciarCarrito();
      }

      setActiveStep(3);
      
      // 🔥 NUEVO: Retornar el pedido creado para poder usarlo en el useEffect
      return {
        id: result.pedidoId || result.id,
        montoTotal: result.montoTotal || total,
        success: true
      };
    } catch (error) {
      console.error('💥 Error:', error);

      if (error.message.includes('Usuario no encontrado')) {
        setError(
          'Debes estar registrado para realizar un pedido. Por favor inicia sesión.'
        );
      } else if (error.message.includes('Método de pago inválido')) {
        setError('Método de pago no válido. Por favor selecciona otro.');
      } else if (error.message.includes('stock')) {
        setError(
          'Algunos productos no tienen stock suficiente. Revisa tu carrito.'
        );
      } else if (
        error.name === 'TypeError' &&
        error.message.includes('fetch')
      ) {
        setError(
          'Error de conexión. Verifica que el servidor esté funcionando.'
        );
      } else {
        setError(error.message || 'Error al procesar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar Mercado Pago
  const handleMercadoPago = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('💳 Iniciando pago con Mercado Pago...');
      
      // 🔥 NUEVO: Limpiar el flag de pedido procesado antes de iniciar nuevo pago
      sessionStorage.removeItem('pedido_mp_procesado');

      // Validar carrito
      if (!carrito || carrito.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Preparar items
      const items = paymentService.prepareItemsForMercadoPago(carrito);
      console.log('📦 Items preparados:', items);

      // Preparar información del comprador (opcional pero recomendado)
      const payerInfo = paymentService.preparePayerInfo(usuario);
      
      // Crear preferencia
      const data = await paymentService.createMercadoPagoPreference(items, payerInfo);
      
      if (!data.success) {
        throw new Error(data.message || 'Error al crear la preferencia');
      }

      console.log('✅ Preferencia creada, redirigiendo...');
      
      // Mostrar mensaje de redirección
      setError('Redirigiendo a Mercado Pago...');
      
      // Redirigir a Mercado Pago
      paymentService.redirectToMercadoPago(data);
      
    } catch (e) {
      console.error('❌ Error MP:', e);
      setError(e.message || 'Error al iniciar pago con Mercado Pago. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  // Navegación
  const next = async () => {
    if (activeStep === 2) {
      const selectedMethod = metodosPago.find(
        (m) => String(m.id) === String(form.paymentMethod)
      );
      const isMercadoPago =
        selectedMethod?.nombre?.toLowerCase().includes('mercado pago') ||
        selectedMethod?.tipo?.toLowerCase() === 'mercadopago';

      if (isMercadoPago) {
        await handleMercadoPago();
        return;
      }
      await crearPedido();
    } else {
      // Mostrar loading al cambiar de paso
      setStepLoading(true);
      // Simular un pequeño delay para la transición
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveStep((s) => Math.min(s + 1, 3));
      setStepLoading(false);
    }
  };

  const prev = () => setActiveStep((s) => Math.max(s - 1, 1));

  return (
    <div className="checkout-container">
      <CheckoutHeader activeStep={activeStep} />

      {error && (
        <div
          className="error-message"
          style={{
            background: '#fee',
            color: '#c33',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #fcc',
          }}
        >
          {error}
        </div>
      )}

      <div className="checkout-main">
        <section className="left">
          {/* 🔥 NUEVO: Mensaje de retorno de Mercado Pago */}
          {mpReturnStatus && (
            <div className={`mp-return-message ${mpReturnStatus === 'approved' || mpReturnStatus === 'success' ? 'success' : mpReturnStatus === 'pending' ? 'warning' : 'error'}`}>
              {mpReturnStatus === 'approved' || mpReturnStatus === 'success' ? (
                <>
                  <span className="mp-icon">✅</span>
                  <div>
                    <strong>¡Pago exitoso!</strong>
                    <p>Procesando tu pedido...</p>
                  </div>
                </>
              ) : mpReturnStatus === 'pending' ? (
                <>
                  <span className="mp-icon">⏳</span>
                  <div>
                    <strong>Pago pendiente</strong>
                    <p>Te notificaremos cuando se confirme.</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="mp-icon">❌</span>
                  <div>
                    <strong>Pago rechazado</strong>
                    <p>Por favor intenta nuevamente.</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {dataLoading ? (
            <LoadingSpinner message="Cargando información del checkout..." />
          ) : stepLoading ? (
            <LoadingSpinner message="Procesando..." />
          ) : (
            <>
              {activeStep === 1 && (
                <Step1Shipping
                  carrito={carrito}
                  formData={formData}
                  errors={validation.errors}
                  userAddresses={userAddresses}
                  selectedAddressId={form.selectedAddressId}
                  useCustomAddress={form.useCustomAddress}
                  usuario={usuario}
                  shippingCost={shippingCost}
                  handleFieldChange={(name, value) =>
                    form.handleFieldChange(name, value, formData)
                  }
                  handleBlur={(name) => validation.handleBlur(name, formData)}
                  handleDeliveryTypeChange={form.handleDeliveryTypeChange}
                  handleAddressChange={(addressId) =>
                    form.handleAddressChange(addressId, userAddresses, onChange)
                  }
                  aumentarCantidad={aumentarCantidad}
                  disminuirCantidad={disminuirCantidad}
                  quitarProducto={quitarProducto}
                />
              )}

              {activeStep === 2 && (
                <Step2Payment
                  metodosPago={metodosPago}
                  userCards={userCards}
                  paymentMethod={form.paymentMethod}
                  cardInfo={form.cardInfo}
                  errors={validation.errors}
                  selectedCardId={form.selectedCardId}
                  setSelectedCardId={form.setSelectedCardId}
                  handlePaymentMethodChange={form.handlePaymentMethodChange}
                  onCardChange={form.onCardChange}
                  handleBlur={(name) => validation.handleBlur(name, formData)}
                  handleMercadoPago={handleMercadoPago}
                  loading={loading}
                />
              )}

              {activeStep === 3 && <Step3Confirmation pedidoCreado={pedidoCreado} />}

              <div className="actions">
                {activeStep > 1 && activeStep < 3 && (
                  <button
                    className="btn-secondary"
                    onClick={prev}
                    disabled={loading}
                  >
                    Atrás
                  </button>
                )}
                {activeStep < 3 && (
                  <button
                    className="btn-primary"
                    onClick={next}
                    disabled={
                      loading ||
                      stepLoading ||
                      (activeStep === 1 &&
                        !validation.isStep1Valid(formData, carrito)) ||
                      (activeStep === 2 &&
                        !validation.isStep2Valid(
                          form.paymentMethod,
                          form.cardInfo,
                          metodosPago,
                          form.selectedCardId
                        ))
                    }
                  >
                    {loading || stepLoading
                      ? 'Procesando...'
                      : activeStep === 2
                      ? 'Realizar Pedido'
                      : 'Continuar'}
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        <OrderSummary
          carrito={carrito}
          pedidoCreado={pedidoCreado}
          activeStep={activeStep}
          subtotal={subtotal}
          shippingCost={shippingCost}
          taxes={taxes}
          total={total}
          loading={loading}
          isStep1Valid={validation.isStep1Valid(formData, carrito)}
          isStep2Valid={validation.isStep2Valid(
            form.paymentMethod,
            form.cardInfo,
            metodosPago,
            form.selectedCardId
          )}
          onNext={next}
        />
      </div>
    </div>
  );
}
