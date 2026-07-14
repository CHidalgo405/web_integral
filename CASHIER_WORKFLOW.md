# Flujo de cajero — Tiendita Maday

## Roles

- `customer`: comprador de la tienda en línea. Solo accede a catálogo, perfil, carrito y sus pedidos.
- `cashier`: empleado de caja. Entra directamente a `/cashier` y únicamente puede operar su propia caja y ventas.
- `admin`: administra usuarios, inventario y pedidos; también puede abrir el punto de venta.
- `stock`: cuenta con su propia interfaz de inventario y no tiene permisos POS.
- `manager`: se conserva para la futura interfaz gerencial, sin permisos POS por ahora.

La migración `Database/migrations/004_customer_cashier_roles.sql` separa clientes existentes de cajeros sin alterar inventario, ventas o contraseñas.

## Alta de un cajero

1. Iniciar sesión como administrador.
2. Abrir **Admin → Usuarios**.
3. Usar **Nuevo cajero** para crear nombre, correo, contraseña y PIN opcional.
4. También puede cambiarse una cuenta existente a **Cajero / Cobrador** desde su selector de rol.
5. El cajero debe volver a iniciar sesión si su rol acaba de cambiar.

## Operación diaria

1. El cajero inicia sesión y es dirigido a `/cashier/register`.
2. Registra el fondo inicial y abre su caja.
3. Agrega productos mediante catálogo, búsqueda, SKU o código de barras.
4. Opcionalmente selecciona o crea un cliente del directorio.
5. Cobra en efectivo o tarjeta. Para efectivo, el sistema calcula el cambio.
6. La API vuelve a consultar precios y stock dentro de una transacción; el navegador no decide el total final.
7. La venta queda atribuida al empleado autenticado y el efectivo se registra como movimiento de caja.
8. En **Mis ventas**, el cajero consulta únicamente sus operaciones.
9. Al terminar, cuenta el efectivo y realiza el corte; se registra la diferencia contra el monto esperado.

## Reglas de seguridad

- Una venta POS requiere JWT con rol `cashier` o `admin`, un empleado vinculado y una caja abierta.
- El cajero no puede consultar proveedores, gastos, auditorías globales ni ventas de otros empleados.
- Precios, importes y disponibilidad se validan en PostgreSQL antes de confirmar la venta.
- Las ventas en efectivo afectan la caja; las ventas con tarjeta se registran como pagadas pero no incrementan el efectivo esperado.
- La integración con terminal bancaria es externa: la interfaz solicita confirmar que la terminal aprobó el pago.

## Endpoints principales

- `GET /api/cash-register/status`
- `POST /api/cash-register/open`
- `POST /api/cash-register/close`
- `POST /api/purchases/pos`
- `GET /api/purchases?date=YYYY-MM-DD`
- `GET /api/inventory/barcode/:barcode`
- `POST /api/users/cashiers` — solo administrador

## Pruebas

Las pruebas rápidas de autorización se ejecutan con `npm test` dentro de
`Arquitectura/Backend`. La prueba transaccional completa requiere una base
aislada inicializada con `Database/init.sql`:

```bash
POS_TEST_DATABASE_URL="postgresql://.../tiendita_test" npm test
```

Esta prueba abre una caja temporal, vende una unidad, verifica el descuento de
stock y el movimiento de efectivo, y finalmente cierra con diferencia cero.
