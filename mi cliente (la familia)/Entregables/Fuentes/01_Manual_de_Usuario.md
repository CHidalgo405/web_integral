# Manual de usuario
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Version:** 1.0
**Fecha:** 14 de julio de 2026
**Perfiles cubiertos:** Cliente, cajero, almacen, gerente y administrador

> Guia practica de operacion. Los nombres exactos de algunos botones pueden variar ligeramente con futuras actualizaciones, pero los permisos y flujos descritos corresponden a la version documentada.

<!-- PAGEBREAK -->

## 1. Antes de comenzar

Utilice una version vigente de Chrome, Edge, Firefox o Safari y una conexion estable. En equipos compartidos, cierre sesion al terminar. No permita que el navegador guarde la contrasena administrativa en una computadora de caja o almacen.

### 1.1 Inicio de sesion

1. Abra la URL oficial proporcionada por el responsable tecnico.
2. Ingrese el correo o identificador y la contrasena de su cuenta.
3. El sistema lo enviara al area correspondiente a su rol.
4. Si su rol acaba de cambiar, cierre la sesion y vuelva a entrar para renovar sus permisos.

| Rol | Destino principal |
|---|---|
| Cliente | Catalogo y pagina de inicio. |
| Cajero | Caja y punto de venta. |
| Almacen | Existencias. |
| Administrador o gerente | Panel administrativo. |

### 1.2 Recuperacion de acceso

Use **Olvide mi contrasena** en la pantalla de acceso. El enlace de recuperacion debe llegar al correo registrado y tiene vigencia limitada. Si no llega, revise spam y confirme con soporte que el servicio de correo esta configurado. Nunca envie contrasenas por mensajeria.

### 1.3 Estados y mensajes

- Un mensaje verde confirma que la operacion termino.
- Un mensaje de validacion indica que falta un dato o que el formato no es valido.
- Un error de permisos significa que la cuenta no tiene el rol requerido.
- Si la aplicacion anuncia una actualizacion durante caja, inventario o checkout, termine o cancele la operacion actual antes de recargar.

## 2. Cliente: compra en linea

### 2.1 Consultar y seleccionar productos

1. Inicie sesion como cliente.
2. Recorra el catalogo o utilice busqueda y categorias.
3. Abra el detalle para revisar precio, disponibilidad y opiniones.
4. Seleccione la cantidad y agregue el producto al carrito.
5. Revise el carrito antes de continuar; elimine o cambie cantidades si es necesario.

El precio y la existencia finales se validan nuevamente en el servidor al confirmar la compra. Lo mostrado en una pestana antigua no garantiza disponibilidad.

### 2.2 Direccion, entrega y pago

1. En checkout, identifique al comprador y seleccione o registre una direccion.
2. Elija recoleccion o entrega cuando esas opciones esten habilitadas.
3. Para entrega, confirme el punto del mapa y la zona. La tarifa se calcula en el servidor.
4. Revise productos, descuentos, envio y total.
5. Seleccione el metodo de pago disponible y confirme una sola vez.
6. Espere la pantalla de resultado y guarde el numero del pedido.

> Si PayPal confirma el cobro pero el sistema no muestra el pedido, no repita el pago. Guarde el identificador de PayPal y comuniquelo a soporte para conciliacion.

### 2.3 Pedidos y perfil

En **Mis pedidos** puede consultar el estado y abrir el detalle. En **Perfil** puede administrar informacion personal, direcciones y metodos disponibles. Los terminos, privacidad y ayuda se encuentran tambien en el perfil.

## 3. Cajero: apertura, venta y corte

### 3.1 Abrir caja

1. Inicie sesion con una cuenta `cashier`, `admin` o `manager` autorizada.
2. Abra **Caja** y registre el fondo inicial contado.
3. Confirme la apertura. No inicie ventas hasta que el sistema indique caja abierta.

Cada cajero opera su propia caja. Una venta requiere un empleado vinculado a la cuenta y una caja abierta.

### 3.2 Registrar una venta

1. Busque productos por catalogo, nombre, SKU o codigo de barras.
2. Verifique cantidad y precio mostrados.
3. Seleccione o cree un cliente si la venta necesita asociacion.
4. Elija efectivo o tarjeta segun la operacion.
5. En efectivo, capture el importe recibido y compruebe el cambio calculado.
6. En tarjeta, confirme primero la aprobacion en la terminal externa.
7. Confirme la venta y entregue o guarde el comprobante.

El servidor vuelve a calcular precios, stock y total dentro de una transaccion. No entregue mercancia si la interfaz informa que la venta no se completo.

### 3.3 Consultar ventas y cerrar caja

1. Abra **Mis ventas** para revisar las operaciones de su turno.
2. Al terminar, cuente el efectivo fisico sin modificar ventas anteriores.
3. Inicie el corte y capture el monto contado.
4. Revise el esperado y la diferencia.
5. Confirme el cierre y reporte inmediatamente cualquier diferencia.

| Situacion | Accion correcta |
|---|---|
| Producto no aparece | Solicitar al administrador revisar producto activo, stock y codigo. |
| Stock insuficiente | Ajustar la cantidad; no completar por fuera del sistema. |
| Terminal rechaza tarjeta | No confirmar la venta como pagada. |
| Venta duplicada | Detenerse y pedir revision; no borrar registros manualmente. |
| Diferencia de caja | Registrar el monto real y explicar la diferencia al responsable. |

## 4. Almacen: existencias y movimientos

### 4.1 Consultar existencias

1. Inicie sesion con rol `stock` o use **Abrir Inventario** desde administracion.
2. Revise productos, unidad, existencia, costo y minimo.
3. Filtre por nombre, SKU, categoria, estado o codigo de barras.
4. Atienda alertas de stock bajo y productos con caducidad.

### 4.2 Registrar una entrada o salida manual

1. En el producto correcto, seleccione **Ajustar**.
2. Elija **Entrada** o **Salida**.
3. Capture una cantidad entera positiva.
4. Seleccione el motivo y escriba una nota que permita auditar el movimiento.
5. Revise la vista previa y confirme.
6. Compruebe el resultado en **Movimientos**.

El sistema no permite stock negativo. Cada ajuste guarda responsable, cantidad anterior, cantidad nueva, fecha, motivo y nota.

### 4.3 Buenas practicas de inventario

- Registre recepciones y ajustes cuando ocurren, no al final de la semana.
- No utilice una entrada para ocultar una devolucion o venta mal registrada.
- Escriba notas concretas: proveedor, folio, merma, rotura o conteo fisico.
- Compare periodicamente el inventario fisico con el sistema.
- No comparta la cuenta de almacen entre turnos.

## 5. Administracion y gerencia

Los roles `admin` y `manager` comparten el panel administrativo. Algunas funciones de propietario, en particular **Finanzas** y **Configuracion**, pueden exigir permiso de propietario adicional.

### 5.1 Panel y modulos

| Modulo | Operacion principal |
|---|---|
| Dashboard | Resumen, metricas y actividad del negocio. |
| Productos | Productos, categorias, precios, costos, stock e imagenes. |
| Pedidos | Consulta y actualizacion del ciclo de pedidos. |
| Usuarios | Alta, activacion y asignacion de roles. |
| Abasto | Proveedores, compras y recepcion. |
| Caducidades | Lotes proximos a vencer y seguimiento. |
| Promociones | Reglas y vigencias promocionales. |
| Finanzas | Caja, gastos y reportes restringidos al propietario. |
| Configuracion | Datos y reglas de tienda restringidos al propietario. |

### 5.2 Crear usuarios y asignar roles

1. Abra **Administracion > Usuarios**.
2. Cree una cuenta con nombre, correo y contrasena temporal.
3. Asigne el rol minimo necesario.
4. Entregue la credencial temporal por un canal seguro.
5. Pida a la persona iniciar sesion y cambiar su contrasena.
6. Desactive las cuentas de personal que deja de colaborar.

Asignar `manager` concede control administrativo amplio, incluida la gestion de usuarios. El administrador y gerente no pueden desactivar su propia cuenta ni retirarse a si mismos los permisos desde el panel.

### 5.3 Productos y abasto

Al crear o modificar un producto, confirme nombre, categoria, unidad, SKU, codigo de barras, precio, costo, stock minimo, caducidad e imagen. Evite reutilizar codigos de barras. En recepciones de mercancia, use el flujo de abasto para conservar trazabilidad en lugar de un ajuste manual generico.

### 5.4 Pedidos, promociones y caducidades

- Revise pedidos pendientes y cambie el estado solo cuando la operacion real lo justifique.
- Defina promociones con fecha de inicio y fin; pruebe su efecto antes de publicarlas.
- Atienda lotes por caducar y documente merma o retiro.
- No modifique directamente PostgreSQL para resolver una incidencia operativa ordinaria.

## 6. Seguridad operativa

- Use contrasenas unicas y no las comparta.
- Mantenga solo una o dos cuentas con acceso de propietario.
- Desactive cuentas sin uso.
- Revise diferencias de caja y movimientos de inventario con responsable.
- Evite operar desde redes publicas o dispositivos sin bloqueo.
- Cierre sesion antes de entregar el equipo a otra persona.
- Reporte pagos inconsistentes, accesos desconocidos o cambios no autorizados.

## 7. Solucion rapida de problemas

| Problema | Verificacion inicial | Escalar cuando |
|---|---|---|
| No inicia sesion | Correo, contrasena, cuenta activa y conexion. | La recuperacion no llega o varias cuentas fallan. |
| Pantalla sin datos | Conexion, recargar una vez y volver a iniciar sesion. | El problema ocurre en varios equipos. |
| No permite vender | Caja abierta, empleado vinculado, stock y rol. | Los datos son correctos y la API rechaza la venta. |
| Tarifa de envio inesperada | Punto del mapa, zona y configuracion. | La direccion esta bien y el calculo se repite. |
| Imagen no carga | Formato, tamano y conexion. | Falla en todos los productos nuevos. |
| Diferencia de inventario | Historial de movimientos y ventas recientes. | No existe movimiento que explique la diferencia. |

## 8. Listas de cierre diario

### Cajero

- [ ] Todas las ventas del turno aparecen en Mis ventas.
- [ ] La terminal externa coincide con las ventas con tarjeta.
- [ ] El efectivo fue contado y el corte fue confirmado.
- [ ] Las diferencias tienen una explicacion entregada al responsable.
- [ ] La sesion se cerro.

### Gerente o propietario

- [ ] No hay pedidos detenidos sin responsable.
- [ ] Se revisaron alertas de bajo stock y caducidad.
- [ ] Se revisaron diferencias de caja.
- [ ] No existen cuentas activas de personal dado de baja.
- [ ] El respaldo mas reciente esta dentro del objetivo acordado.
