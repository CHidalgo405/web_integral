# Acta de entrega y aceptacion
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Version del formato:** 1.0
**Fecha de preparacion:** 14 de julio de 2026
**Estado:** Borrador para completar y firmar

> Este documento no acredita aceptacion mientras existan campos esenciales vacios o falten las firmas autorizadas. Las reservas aceptadas deben tener responsable y fecha compromiso.

<!-- PAGEBREAK -->

## 1. Identificacion de las partes

| Campo | Informacion |
|---|---|
| Cliente / razon social | La Familia / __________________________________________ |
| Representante del cliente | __________________________________________ |
| Equipo o proveedor | __________________________________________ |
| Representante de entrega | __________________________________________ |
| Fecha efectiva de entrega | ____ / ____ / ______ |
| Version de aplicacion | __________________________________________ |
| Commit o etiqueta entregada | __________________________________________ |
| URL de produccion | __________________________________________ |
| URL de API | __________________________________________ |

## 2. Objeto

Por medio de la presente se deja constancia de la entrega del sistema web Tiendita Maday y de la documentacion indicada en esta acta. La aceptacion se limita a la version, alcance, condiciones, reservas y evidencias expresamente registradas; no incorpora compromisos verbales ni funcionalidades futuras no descritas.

## 3. Alcance funcional presentado

- Autenticacion, recuperacion y control de acceso por roles.
- Catalogo, categorias, productos, precios, imagenes y codigos de barras.
- Carrito, direcciones, checkout, entrega/recoleccion y pedidos.
- Punto de venta, apertura/cierre de caja y ventas del cajero.
- Inventario, ajustes y movimientos auditables.
- Administracion de usuarios y roles.
- Proveedores, abasto y recepcion de mercancia.
- Promociones, caducidades y funciones administrativas.
- Integraciones configurables con PayPal, Google, correo y Cloudinary.
- API, PostgreSQL, migraciones y despliegue contenerizado/Railway.

La funcionalidad se considera incluida solo cuando esta presente en la revision identificada y configurada con los servicios de terceros necesarios.

## 4. Entregables documentales

| Entregable | Recibido | Observaciones |
|---|---|---|
| 00 LEEME PRIMERO | [ ] | __________________________________ |
| 01 Manual de Usuario | [ ] | __________________________________ |
| 02 Guia de Operacion, Respaldo y Recuperacion | [ ] | __________________________________ |
| 03 Reporte de Pruebas y Limitaciones | [ ] | __________________________________ |
| Codigo fuente y migraciones | [ ] | __________________________________ |
| Documentacion tecnica y OpenAPI | [ ] | __________________________________ |
| Acceso a repositorio y version etiquetada | [ ] | __________________________________ |

## 5. Transferencia de control

| Servicio o activo | Propietario final | Acceso verificado | Observaciones |
|---|---|---|---|
| GitHub | __________________ | [ ] | __________________ |
| Railway | __________________ | [ ] | __________________ |
| PostgreSQL | __________________ | [ ] | __________________ |
| Dominio / DNS | __________________ | [ ] | __________________ |
| PayPal | __________________ | [ ] | Sandbox / Live: __________ |
| Google OAuth | __________________ | [ ] | __________________ |
| Cloudinary | __________________ | [ ] | __________________ |
| EmailJS / correo | __________________ | [ ] | __________________ |
| Canal de soporte | __________________ | [ ] | __________________ |
| Copia de respaldo | __________________ | [ ] | Fecha: __________ |

Las claves fueron transferidas mediante: ________________________________________________. Las partes confirman que no se incluyeron secretos en Git ni en esta acta.

## 6. Prueba de aceptacion

| Caso | Resultado | Evidencia / observacion |
|---|---|---|
| Acceso de administrador y gestion de usuario | Aprobado / Pendiente / No aplica | __________________ |
| Apertura, venta en efectivo y cierre de caja | Aprobado / Pendiente / No aplica | __________________ |
| Venta con tarjeta y conciliacion | Aprobado / Pendiente / No aplica | __________________ |
| Entrada/salida de inventario con auditoria | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con recoleccion | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con entrega | Aprobado / Pendiente / No aplica | __________________ |
| PayPal en sandbox | Aprobado / Pendiente / No aplica | __________________ |
| Recuperacion de contrasena | Aprobado / Pendiente / No aplica | __________________ |
| Carga de imagen de producto | Aprobado / Pendiente / No aplica | __________________ |
| Respaldo y restauracion aislada | Aprobado / Pendiente / No aplica | __________________ |

## 7. Resultados tecnicos conocidos al preparar el acta

- Backend: 19 pruebas aprobadas, 0 fallidas y 2 integraciones omitidas por falta de base aislada.
- Frontend: compilacion aprobada con advertencias de presupuesto y dependencias CommonJS.
- Frontend: comando de pruebas no aprobado porque Vitest no encontro pruebas ejecutables.
- Prueba visual completa de los cinco roles: pendiente.
- Respaldo y restauracion: pendiente de evidencia.

Estos elementos deben revisarse junto con `03_Reporte_de_Pruebas_y_Limitaciones.pdf` y reflejarse como reservas si no se resuelven antes de firmar.

## 8. Reservas y pendientes aceptados

| Numero | Pendiente o reserva | Prioridad | Responsable | Fecha compromiso | Criterio de cierre |
|---|---|---|---|---|---|
| 1 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 2 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 3 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 4 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |

## 9. Soporte, garantia y costos

| Condicion | Acuerdo |
|---|---|
| Inicio de garantia | ____ / ____ / ______ |
| Fin o duracion | __________________________________________ |
| Horario de atencion | __________________________________________ |
| Correo / telefono | __________________________________________ |
| Tiempo objetivo para incidente critico | __________________________________________ |
| Correcciones incluidas | __________________________________________ |
| Mejoras o cambios fuera de alcance | __________________________________________ |
| Responsable de renovaciones de terceros | __________________________________________ |

Salvo acuerdo escrito, la garantia corrige defectos reproducibles del alcance entregado y no incluye nuevas funciones, datos capturados incorrectamente, indisponibilidad de terceros, perdida de credenciales ni cambios solicitados despues de la aceptacion.

## 10. Declaracion de decision

Marque una sola opcion:

- [ ] **Aceptacion final.** El cliente recibe la version indicada sin reservas abiertas.
- [ ] **Aceptacion condicionada.** El cliente recibe la version con las reservas de la seccion 8.
- [ ] **No aceptada.** Se requiere corregir los puntos anexos antes de una nueva revision.

Observaciones generales:

________________________________________________________________________________

________________________________________________________________________________

________________________________________________________________________________

## 11. Firmas

| Por el cliente | Por el equipo/proveedor |
|---|---|
| Nombre: ______________________________ | Nombre: ______________________________ |
| Cargo: _______________________________ | Cargo: _______________________________ |
| Firma: _______________________________ | Firma: _______________________________ |
| Fecha: ____ / ____ / ______ | Fecha: ____ / ____ / ______ |

## 12. Cierre de transferencia

- [ ] Los datos de identificacion y URLs estan completos.
- [ ] La revision entregada esta etiquetada y accesible.
- [ ] El cliente controla las cuentas y servicios indicados.
- [ ] Se rotaron secretos temporales o compartidos.
- [ ] Existe al menos un respaldo reciente bajo control del cliente.
- [ ] Se explico como restaurar y escalar un incidente.
- [ ] Los pendientes tienen responsable y fecha.
- [ ] Ambas partes conservan una copia identica del acta firmada.

> Anexe a esta acta la version final del reporte de pruebas, la lista de reservas y cualquier evidencia de restauracion o pagos que forme parte de la decision.
