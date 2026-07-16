# Guion de demostración funcional
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Versión:** 2.0
**Fecha:** 16 de julio de 2026
**Revisión preparada:** `4fd88e2`

> Guion ensayable para demostrar flujo completo, CRUD, reportes, validaciones y manejo de errores sin improvisar ni poner en riesgo datos reales.

<!-- PAGEBREAK -->

## 1. Objetivo y mensaje central

Al terminar la demostración, el cliente y los evaluadores deben comprender que Tiendita Maday:

- Integra cliente, caja, inventario y administración.
- Mantiene reglas sensibles en el servidor.
- Aplica permisos distintos a cinco roles.
- Conserva trazabilidad de ventas y movimientos.
- Cuenta con código, pruebas y documentación verificables.
- Expone con honestidad los pendientes antes de producción.

**Duración objetivo:** 22 a 28 minutos de sistema en vivo, más preguntas.

## 2. Participantes sugeridos

| Persona | Responsabilidad durante la demo |
|---|---|
| Presentador principal | Conduce el relato, tiempos y transiciones. |
| Operador | Maneja navegador y evita silencios. Puede ser la misma persona. |
| Responsable técnico | Explica arquitectura, API, datos y seguridad. |
| Responsable de evidencia | Abre Git, pruebas, métricas y documentación. |
| Respaldo | Resuelve acceso/entorno y prepara capturas si falla internet. |

Cada integrante debe poder explicar al menos un aporte propio y relacionarlo con un commit verificable.

## 3. Preparación 24 horas antes

### 3.1 Entorno

- [ ] Confirmar URL de frontend y API.
- [ ] Registrar commit exacto y no desplegar cambios de último minuto.
- [ ] Probar desde la misma red, equipo, pantalla y navegador.
- [ ] Confirmar que API, base, correo sandbox, Cloudinary y mapas responden.
- [ ] Mantener PayPal en sandbox.
- [ ] Crear respaldo antes de cargar datos de demostración.
- [ ] Descargar una copia local de diapositivas, PDFs y capturas.
- [ ] Desactivar extensiones/notificaciones que puedan mostrar datos privados.

### 3.2 Cuentas

Preparar cuentas personales de demostración:

| Rol | Cuenta | Verificada |
|---|---|---|
| Administrador | __________________________ | [ ] |
| Gerente | __________________________ | [ ] |
| Cajero | __________________________ | [ ] |
| Almacén | __________________________ | [ ] |
| Cliente | __________________________ | [ ] |

No escribir contraseñas en esta hoja. Probarlas y guardarlas en un gestor seguro.

### 3.3 Datos controlados

- Producto temporal `DEMO-001`, nombre visible “Producto Demo”, precio y stock conocidos.
- Categoría y unidad ya existentes.
- Cliente demo con dirección en zona cubierta.
- Caja cerrada al inicio y fondo preparado.
- Al menos dos productos activos con stock.
- Una promoción vigente y otra fuera de vigencia para explicar validación.
- Una venta/pedido previo para reportes.

## 4. Orden de ventanas

1. Diapositivas en modo presentación.
2. Frontend en sesión cerrada.
3. Pestañas separadas para admin, cajero, almacén y cliente; abrir solo al usar.
4. Swagger UI en `/api-docs`.
5. Repositorio Git en la revisión final.
6. Carpeta `Entregables`.
7. Capturas de contingencia disponibles sin conexión.

Evite navegar por carpetas al azar. Use marcadores o enlaces ya preparados.

## 5. Secuencia principal

### 5.1 Apertura — 1 minuto

**Decir:** “Tiendita Maday centraliza venta en línea, punto de venta, inventario y administración. Veremos una operación completa y después la evidencia técnica.”

**Mostrar:** diapositiva de problema/solución y pantalla de login.

**Criterio:** el público entiende quién usa el sistema y qué problema resuelve antes de ver menús.

### 5.2 Autenticación y permisos — 2 minutos

1. Intentar login con un dato incompleto para mostrar validación.
2. Iniciar sesión como administrador.
3. Mostrar que llega al panel.
4. Mencionar los cinco roles y que la API también valida permisos.
5. Si el tiempo lo permite, abrir una ruta administrativa en sesión cliente y mostrar rechazo/redirección.

**Decir:** “Ocultar un botón no es seguridad; el backend vuelve a revisar token y rol.”

**Resultado esperado:** validación visible, login correcto y acceso acorde al rol.

### 5.3 CRUD de producto — 4 minutos

Use únicamente el producto temporal.

| Operación | Acción en vivo | Evidencia |
|---|---|---|
| Alta | Admin → Productos → Nuevo; capturar SKU `DEMO-001`, nombre, categoría, precio, costo, stock e imagen opcional. | Mensaje de éxito y producto en lista. |
| Consulta | Buscar por nombre/SKU y abrir detalle o edición. | Datos persistidos. |
| Modificación | Cambiar precio o stock mínimo y guardar. | Lista/detalle refleja nuevo valor. |
| Eliminación | Eliminar o desactivar el producto demo según la acción implementada; confirmar consecuencia. | Ya no aparece como activo/consultable. |

Antes de eliminar, explique que datos con historial no deben borrarse a ciegas. Si el sistema usa desactivación, nombre la diferencia y por qué conserva trazabilidad.

**Validaciones a mostrar:** SKU duplicado, nombre vacío o precio no válido. Ejecute solo una para no consumir tiempo.

### 5.4 Flujo de compra cliente — 4 minutos

1. Cambiar a cuenta cliente.
2. Buscar un producto y abrir detalle.
3. Agregar dos unidades.
4. Revisar y modificar cantidad en carrito.
5. Proceder al checkout.
6. Confirmar identidad y dirección.
7. Mostrar cálculo de entrega/recolección.
8. Revisar descuento, envío y total.
9. Completar con método de prueba o detener antes del cobro live.
10. Abrir Pedidos y mostrar folio/estado.

**Decir:** “El carrito es una intención; el servidor recalcula productos, promoción, envío y stock antes de confirmar.”

![Flujo de checkout preparado para la demostración.](capturas/13_cliente_checkout.png)

### 5.5 Punto de venta — 4 minutos

1. Iniciar sesión como cajero.
2. Abrir caja con fondo inicial.
3. Buscar por nombre/SKU o simular código de barras.
4. Agregar dos productos y modificar cantidad.
5. Seleccionar cliente o público general.
6. Presionar Cobrar.
7. Elegir efectivo, capturar monto y mostrar cambio.
8. Confirmar una sola vez.
9. Abrir Mis ventas y localizar folio.
10. Mostrar corte: efectivo esperado, contado y diferencia; no cerrar si afectará otra parte de la demo.

**Resultado esperado:** venta registrada, existencia descontada y resumen del turno actualizado.

![Cobro en efectivo: método, recibido, cambio y confirmación.](capturas/23_cajero_cobro.png)

### 5.6 Inventario auditable — 3 minutos

1. Entrar como almacén.
2. Buscar el producto vendido y señalar el descuento.
3. Presionar Ajustar.
4. Elegir Entrada, cantidad pequeña, motivo y nota “Demostración SHD”.
5. Mostrar vista previa y confirmar.
6. Abrir Movimientos y localizar el registro.
7. Señalar responsable, anterior, nuevo, fecha, motivo y nota.

**Manejo de error:** intentar una salida mayor al stock o una cantidad cero y mostrar rechazo sin guardar.

![Historial de movimientos con trazabilidad.](capturas/32_almacen_movimientos.png)

### 5.7 Reportes y administración — 3 minutos

Mostrar, sin recorrer cada fila:

- Dashboard: ventas, pedidos, existencias y clientes.
- Tendencia y productos más vendidos.
- Mis ventas del cajero y corte.
- Inventario: stock bajo, valor y movimientos.
- Pedidos: estado y detalle.
- Finanzas: gastos/auditoría para propietario.

**Decir:** “Los reportes operativos provienen de las mismas transacciones; no son una captura separada.”

Si el evaluador exige “generación de reportes”, mostrar el comprobante/recibo PDF implementado y guardar un ejemplo en una carpeta temporal, verificando folio, fecha y total.

## 6. Validaciones y errores — 3 minutos

Preparar tres casos, ejecutar dos:

| Caso | Acción | Respuesta esperada | Mensaje a explicar |
|---|---|---|---|
| Campo requerido | Guardar producto/usuario sin nombre | Error junto al campo, sin alta. | Prevención temprana. |
| Stock insuficiente | Vender/sacar más de lo disponible | API rechaza y no descuenta parcialmente. | Integridad del negocio. |
| Permiso insuficiente | Cliente abre ruta admin | Redirección/403. | Menor privilegio. |
| Caja cerrada | Intentar cobrar sin apertura | Operación bloqueada. | Ciclo de turno. |
| Entrega fuera de zona | Elegir punto no cubierto | No permite confirmar o informa cobertura. | Tarifa/autorización del servidor. |
| Pago cancelado | Cancelar PayPal sandbox | Pedido no marcado como pagado. | Evitar cobros/estados falsos. |

Nunca provoque una excepción destructiva en vivo. Los errores deben ser casos controlados con recuperación conocida.

## 7. Evidencia técnica — 4 minutos

### 7.1 Repositorio

1. Mostrar `main`, commit final y remoto.
2. Abrir el historial y gráfica de contribuciones.
3. Explicar el criterio de alias.
4. Mostrar dos commits propios de integrantes presentes.
5. Indicar con honestidad la evidencia pendiente de Adán si aún no se asocia su identidad.

### 7.2 Organización

Mostrar las carpetas FrontEnd, Backend, Database y Entregables. No abrir todo; explicar responsabilidad de cada una.

### 7.3 Base y API

1. Mostrar `schema.mmd` o la diapositiva de 33 entidades por dominios.
2. Abrir Swagger UI.
3. Elegir un endpoint de lectura que no revele datos sensibles.
4. Señalar autorización, respuestas y errores documentados.

### 7.4 Pruebas

Mostrar el reporte y resultado:

- Backend: 19 aprobadas, 0 fallidas, 2 omitidas sin bases aisladas.
- Frontend: build aprobado; suite automatizada pendiente de configuración.
- 25 capturas del recorrido de cinco roles.

**Decir:** “No presentamos los tests omitidos como aprobados; están registrados con su condición de cierre.”

## 8. Cierre — 2 minutos

**Resumen verbal:**

1. Se integraron ventas digitales, POS, inventario y administración.
2. Los roles y validaciones protegen operaciones.
3. Git, pruebas, capturas y documentación respaldan lo mostrado.
4. Producción requiere cerrar los pendientes registrados: integraciones, restauración, suite frontend, marca y evidencia faltante.

**Mostrar:** resultados obtenidos y trabajo futuro.

**Pregunta al cliente:** “¿El flujo presentado corresponde a la forma en que esperan operar la tienda y qué reserva desean registrar antes de aceptación?”

## 9. Plan de contingencia

| Falla | Respuesta inmediata |
|---|---|
| Sin internet | Usar entorno local previamente probado. |
| Railway caído | Mostrar capturas y video corto; explicar sin ocultar la falla. |
| Base no responde | No reinicializar; mostrar respaldo de evidencia y logs controlados. |
| Integración externa falla | Cambiar a sandbox/captura y continuar flujo interno. |
| Cuenta bloqueada | Usar cuenta de respaldo del mismo rol, no una admin compartida. |
| Proyector ilegible | Aumentar zoom y usar diapositivas; no editar CSS en vivo. |
| Datos demo alterados | Restaurar dataset preparado antes de la sesión. |
| Tiempo reducido | Ejecutar login, CRUD, POS, inventario y cierre; omitir recorridos secundarios. |

## 10. Ensayo cronometrado

| Bloque | Objetivo | Ensayo 1 | Ensayo 2 | Responsable |
|---|---:|---:|---:|---|
| Apertura + login | 3 min | ____ | ____ | __________ |
| CRUD producto | 4 min | ____ | ____ | __________ |
| Compra cliente | 4 min | ____ | ____ | __________ |
| POS | 4 min | ____ | ____ | __________ |
| Inventario | 3 min | ____ | ____ | __________ |
| Reportes/errores | 5 min | ____ | ____ | __________ |
| Evidencia técnica | 4 min | ____ | ____ | __________ |
| Cierre | 2 min | ____ | ____ | __________ |

Detenga el ensayo cuando un paso falle, registre causa y reinicie desde datos limpios. Un ensayo se considera aprobado cuando dos recorridos consecutivos terminan dentro del tiempo.

## 11. Lista de salida

- [ ] Todos conocen el orden y quién habla.
- [ ] Cuentas y datos demo funcionan.
- [ ] Producto temporal se puede crear y eliminar/desactivar.
- [ ] Caja comienza en el estado planeado.
- [ ] Stock y dirección permiten los flujos.
- [ ] Reportes contienen datos visibles.
- [ ] Pruebas/capturas/repositorio abren sin buscar.
- [ ] Presentación y PDFs existen offline.
- [ ] Plan de contingencia asignado.
- [ ] Checklist SHD impreso o listo para enviar.
- [ ] Datos demo se limpiarán después.

## 12. Registro de la demostración

| Campo | Resultado |
|---|---|
| Fecha y hora | ______________________________________________ |
| Revisión mostrada | ______________________________________________ |
| Entorno / URL | ______________________________________________ |
| Duración | ______________________________________________ |
| Casos omitidos | ______________________________________________ |
| Incidencias | ______________________________________________ |
| Reservas del cliente | ______________________________________________ |
| Próxima acción y responsable | ______________________________________________ |

> La mejor demostración no es la que nunca muestra un error: es la que prueba que el sistema evita datos inválidos, explica lo ocurrido y permite continuar sin perder control.
