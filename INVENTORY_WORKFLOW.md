# Flujo de inventario — Tiendita Maday

## Acceso del rol

- `stock`: entra directamente a `/inventory` y puede consultar existencias, costos, mínimos y movimientos.
- `admin`: puede abrir el mismo módulo desde **Admin → Abrir Inventario**.
- `manager`: comparte el panel administrativo y puede abrir el mismo módulo.
- Clientes y cajeros no pueden registrar ajustes manuales de stock.

Para asignar al encargado, el administrador abre **Admin → Usuarios**, selecciona
la cuenta y cambia su rol a **Almacén**. La persona debe cerrar sesión y volver a
entrar para recibir los permisos nuevos.

## Operación diaria

1. Abrir **Existencias** para revisar productos, unidades disponibles y alertas.
2. Buscar por nombre, SKU, categoría, estado o código de barras.
3. Presionar **Ajustar** y elegir **Entrada** o **Salida**.
4. Indicar una cantidad entera, el motivo y una nota opcional.
5. Confirmar la vista previa. El sistema nunca permite que el stock quede negativo.
6. Abrir **Movimientos** para consultar producto, cantidad anterior, cantidad nueva,
   responsable, fecha, motivo y notas.

## Permisos y seguridad

- El rol `stock` no puede crear o desactivar productos, cambiar precios, administrar
  proveedores ni entrar a recursos de administración.
- Cada ajuste se ejecuta dentro de una transacción de PostgreSQL con bloqueo del
  producto para evitar que dos operaciones dejen una cantidad incorrecta.
- Cada entrada o salida manual queda guardada en `inventory_movements` con el usuario
  autenticado y los valores anterior y nuevo.
- Las ventas y recepciones automáticas conservan sus propios registros operativos;
  este historial corresponde a ajustes manuales de inventario.

## Endpoints principales

- `GET /api/inventory`
- `GET /api/inventory/low-stock`
- `GET /api/inventory/barcode/:barcode`
- `GET /api/inventory/movements`
- `POST /api/inventory/:id/adjustments`

## Base de datos y pruebas

En una base existente se debe ejecutar una sola vez:

```bash
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/006_inventory_movements.sql"
```

Las pruebas de permisos se ejecutan con `npm test` dentro de `Arquitectura/Backend`.
La prueba transaccional completa requiere una base aislada inicializada con
`Database/init.sql`:

```bash
INVENTORY_TEST_DATABASE_URL="postgresql://.../tiendita_test" npm test
```
