# Checkout - Estructura Refactorizada

## 📁 Estructura del Proyecto

```
src/components/checkout/
├── checkout.jsx                    # Componente principal (orquestador)
├── checkout.css                    # Estilos
├── checkout.old.jsx                # Backup del código original
│
├── hooks/                          # Custom Hooks
│   ├── useCheckoutData.js         # Cargar métodos pago, tarjetas, direcciones
│   ├── useCheckoutValidation.js   # Lógica de validación de formularios
│   └── useCheckoutForm.js         # Estado del formulario y handlers
│
├── steps/                          # Componentes de cada paso
│   ├── Step1Shipping.jsx          # Paso 1: Envío y datos usuario
│   ├── Step2Payment.jsx           # Paso 2: Métodos de pago
│   └── Step3Confirmation.jsx      # Paso 3: Confirmación
│
├── components/                     # Componentes reutilizables
│   ├── CheckoutHeader.jsx         # Header con indicador de pasos
│   ├── OrderSummary.jsx           # Sidebar resumen del pedido
│   └── ErrorMessage.jsx           # Mensajes de error
│
├── services/                       # Servicios API
│   ├── checkoutService.js         # API calls: pedidos, métodos pago, etc.
│   └── paymentService.js          # Lógica Mercado Pago
│
└── utils/                          # Utilidades
    ├── validations.js             # Funciones de validación
    ├── paymentStatus.js           # Determinar estado del pago
    └── formatters.js              # Formatear precios, tarjetas, etc.
```

## 🎯 Ventajas de la Refactorización

### Antes (checkout.jsx original)
- ❌ ~1600 líneas en un solo archivo
- ❌ Difícil de mantener y depurar
- ❌ Código duplicado
- ❌ Difícil de testear
- ❌ Cambios afectan todo el componente

### Después (estructura modular)
- ✅ Archivos pequeños (~50-200 líneas)
- ✅ Separación clara de responsabilidades
- ✅ Código reutilizable
- ✅ Fácil de testear (unit tests)
- ✅ Cambios localizados
- ✅ Mejor legibilidad

## 📦 Módulos Principales

### Hooks

#### `useCheckoutData.js`
Maneja la carga de datos desde el backend:
- Métodos de pago disponibles
- Tarjetas guardadas del usuario
- Direcciones guardadas

**Uso:**
```javascript
const { metodosPago, userCards, userAddresses, loading } = useCheckoutData(usuario, getAuthHeaders);
```

#### `useCheckoutValidation.js`
Maneja toda la lógica de validación:
- Validación de campos individuales
- Validación de pasos completos
- Manejo de errores y campos tocados

**Uso:**
```javascript
const validation = useCheckoutValidation();
const { errors, touched, validateFieldAndUpdate, isStep1Valid, isStep2Valid } = validation;
```

#### `useCheckoutForm.js`
Maneja el estado del formulario:
- Información de la tarjeta
- Método de pago seleccionado
- Dirección seleccionada
- Handlers para cambios

**Uso:**
```javascript
const form = useCheckoutForm(onChange, validation);
const { cardInfo, paymentMethod, handleFieldChange, onCardChange } = form;
```

### Servicios

#### `checkoutService.js`
Centraliza las llamadas API relacionadas con el checkout:
- `fetchMetodosPago()` - Obtener métodos de pago
- `fetchUserCards(userId, headers)` - Obtener tarjetas del usuario
- `fetchUserAddresses(userId, headers)` - Obtener direcciones
- `createOrder(pedidoData, token)` - Crear pedido

#### `paymentService.js`
Maneja la integración con Mercado Pago:
- `createMercadoPagoPreference(items)` - Crear preferencia
- `redirectToMercadoPago(data)` - Redirigir a MP
- `prepareItemsForMercadoPago(carrito)` - Formatear items

### Componentes

#### `CheckoutHeader.jsx`
Header con el indicador de pasos (Envío → Pago → Confirmación)

#### `OrderSummary.jsx`
Sidebar con el resumen del pedido:
- Lista de productos
- Subtotal, envío, impuestos
- Total
- Botón de acción

#### `ErrorMessage.jsx`
Componente reutilizable para mostrar mensajes de error

### Steps (Pasos)

#### `Step1Shipping.jsx`
Primer paso del checkout:
- Resumen de productos en el carrito
- Selección de tipo de entrega (delivery/pickup)
- Formulario de datos del usuario
- Selector de direcciones guardadas

#### `Step2Payment.jsx`
Segundo paso:
- Lista de métodos de pago disponibles
- Tarjetas guardadas del usuario
- Formulario de tarjeta de crédito
- Botón de Mercado Pago

#### `Step3Confirmation.jsx`
Tercer paso:
- Confirmación del pedido
- Detalles completos
- Estado del pago
- Botón para continuar comprando

### Utilidades

#### `validations.js`
Funciones de validación para todos los campos del formulario:
- `validators.fullName(value)`
- `validators.email(value)`
- `validators.phone(value)`
- `validators.cardNumber(value)`
- etc.

#### `paymentStatus.js`
Funciones para manejar el estado del pago:
- `determinePaymentStatus(result, paymentMethod, metodosPago)` 
- `getPaymentStatusText(estado)`
- `getPaymentStatusColor(estado)`

#### `formatters.js`
Funciones de formateo:
- `parsePrice(precio)` - Convertir precio a número
- `formatCardNumber(val)` - Formatear número de tarjeta
- `formatCardExpiry(val)` - Formatear fecha MM/AA
- `formatPrice(price)` - Formatear precio para mostrar

## 🚀 Cómo Usar

### Migración del código antiguo

1. **Backup** (ya hecho):
   ```bash
   # El archivo original se respaldó como checkout.old.jsx
   ```

2. **Aplicar la nueva versión**:
   ```bash
   # Renombrar checkout-refactored.jsx a checkout.jsx
   mv checkout-refactored.jsx checkout.jsx
   ```

3. **Verificar imports**:
   - Todos los imports se mantienen igual desde fuera del componente
   - La API del componente es la misma (props: activeStep, formData, onChange, etc.)

### Testing

Para probar cada módulo por separado:

```javascript
// Ejemplo: Testear validaciones
import { validators } from './utils/validations';

test('valida email correctamente', () => {
  expect(validators.email('test@test.com')).toBe('');
  expect(validators.email('invalid')).toBeTruthy();
});

// Ejemplo: Testear servicios
import { checkoutService } from './services/checkoutService';

test('obtiene métodos de pago', async () => {
  const metodos = await checkoutService.fetchMetodosPago();
  expect(Array.isArray(metodos)).toBe(true);
});
```

## 🔧 Mantenimiento

### Agregar un nuevo método de pago

1. Agregar validación en `utils/validations.js` si es necesario
2. Agregar lógica de renderizado en `Step2Payment.jsx`
3. Actualizar `paymentService.js` si requiere integración especial

### Agregar un nuevo campo al formulario

1. Agregar validador en `utils/validations.js`
2. Agregar campo en `Step1Shipping.jsx` o `Step2Payment.jsx`
3. Actualizar `useCheckoutValidation.js` si necesita lógica especial
4. Actualizar `isStep1Valid` o `isStep2Valid` según corresponda

### Modificar el flujo de pasos

1. Agregar nuevo step en `steps/`
2. Actualizar `CheckoutHeader.jsx` para incluir el nuevo paso
3. Agregar renderizado condicional en `checkout.jsx`
4. Actualizar navegación en funciones `next()` y `prev()`

## 📝 Notas Importantes

- **API_BASE**: Se calcula automáticamente usando `VITE_API_URL` o fallback a `localhost:443`
- **Validaciones**: Se ejecutan en tiempo real solo después de que el campo ha sido tocado
- **Mercado Pago**: Se maneja de forma separada, redirigiendo antes de crear el pedido local
- **Estado del pago**: Se calcula en base a la respuesta del servidor y tipo de método

## 🐛 Debugging

Si algo no funciona después de la refactorización:

1. **Verificar imports**: Asegúrate de que todos los paths sean correctos
2. **Console logs**: Los servicios tienen logs para debug (ver consola del navegador)
3. **Props**: Verifica que todos los componentes reciban las props necesarias
4. **Estado**: Los hooks manejan su propio estado, verifica que se estén usando correctamente

## 📚 Próximos Pasos

- [ ] Agregar tests unitarios para cada módulo
- [ ] Crear documentación de cada componente con JSDoc
- [ ] Optimizar re-renders con React.memo donde sea necesario
- [ ] Agregar manejo de loading states más granular
- [ ] Implementar error boundaries

---

**Autor:** Refactorización realizada el 30 de octubre de 2025  
**Versión:** 2.0 - Arquitectura modular
