# Acta de entrega y aceptación
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Versión del formato:** 1.1
**Fecha de preparación:** 15 de julio de 2026
**Estado:** Borrador para completar y firmar

> Este documento no acredita aceptación mientras existan campos esenciales vacíos o falten las firmas autorizadas. Las reservas aceptadas deben tener responsable y fecha compromiso.

<!-- PAGEBREAK -->

## 1. Identificación de las partes

| Campo | Información |
|---|---|
| Cliente / razón social | La Familia / __________________________________________ |
| Representante del cliente | __________________________________________ |
| Equipo o proveedor | __________________________________________ |
| Representante de entrega | __________________________________________ |
| Fecha efectiva de entrega | ____ / ____ / ______ |
| Versión de aplicación | __________________________________________ |
| Commit o etiqueta entregada | __________________________________________ |
| URL de producción | __________________________________________ |
| URL de API | __________________________________________ |

## 2. Objeto

Por medio de la presente se deja constancia de la entrega del sistema web Tiendita Maday y de la documentación indicada en esta acta. La aceptación se limita a la versión, alcance, condiciones, reservas y evidencias expresamente registradas; no incorpora compromisos verbales ni funcionalidades futuras no descritas.

## 3. Alcance funcional presentado

- Autenticación, recuperación y control de acceso por roles.
- Catálogo, categorías, productos, precios, imágenes y códigos de barras.
- Carrito, direcciones, checkout, entrega/recolección y pedidos.
- Punto de venta, apertura/cierre de caja y ventas del cajero.
- Inventario, ajustes y movimientos auditables.
- Administración de usuarios y roles.
- Proveedores, abasto y recepción de mercancía.
- Promociones, caducidades y funciones administrativas.
- Integraciones configurables con PayPal, Google, correo y Cloudinary.
- API, PostgreSQL, migraciones y despliegue contenerizado/Railway.

La funcionalidad se considera incluida solo cuando está presente en la revisión identificada y configurada con los servicios de terceros necesarios.

## 4. Entregables documentales

| Entregable | Recibido | Observaciones |
|---|---|---|
| 00 LEEME PRIMERO | [ ] | __________________________________ |
| 01 Manual de Usuario (con capturas) | [ ] | __________________________________ |
| 02 Guía de Operación, Respaldo y Recuperación | [ ] | __________________________________ |
| 03 Reporte de Pruebas y Limitaciones | [ ] | __________________________________ |
| Código fuente y migraciones | [ ] | __________________________________ |
| Documentación técnica y OpenAPI | [ ] | __________________________________ |
| Acceso a repositorio y versión etiquetada | [ ] | __________________________________ |

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

## 6. Prueba de aceptación

| Caso | Resultado | Evidencia / observación |
|---|---|---|
| Acceso de administrador y gestión de usuario | Aprobado / Pendiente / No aplica | __________________ |
| Apertura, venta en efectivo y cierre de caja | Aprobado / Pendiente / No aplica | __________________ |
| Venta con tarjeta y conciliación | Aprobado / Pendiente / No aplica | __________________ |
| Entrada/salida de inventario con auditoría | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con recolección | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con entrega | Aprobado / Pendiente / No aplica | __________________ |
| PayPal en sandbox | Aprobado / Pendiente / No aplica | __________________ |
| Recuperación de contraseña | Aprobado / Pendiente / No aplica | __________________ |
| Carga de imagen de producto | Aprobado / Pendiente / No aplica | __________________ |
| Respaldo y restauración aislada | Aprobado / Pendiente / No aplica | __________________ |

## 7. Resultados técnicos conocidos al preparar el acta

- Backend: 19 pruebas aprobadas, 0 fallidas y 2 integraciones omitidas por falta de base aislada.
- Frontend: compilación aprobada con advertencias de presupuesto y dependencias CommonJS.
- Frontend: comando de pruebas no aprobado porque Vitest no encontró pruebas ejecutables.
- Prueba visual de los cinco roles: ejecutada el 15 de julio de 2026 en entorno local con evidencia fotográfica (ver reporte de pruebas); pendiente de repetirse en el entorno definitivo.
- Respaldo y restauración: pendiente de evidencia.

Estos elementos deben revisarse junto con `03_Reporte_de_Pruebas_y_Limitaciones.pdf` y reflejarse como reservas si no se resuelven antes de firmar.

## 8. Reservas y pendientes aceptados

| Número | Pendiente o reserva | Prioridad | Responsable | Fecha compromiso | Criterio de cierre |
|---|---|---|---|---|---|
| 1 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 2 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 3 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |
| 4 | __________________________ | Alta/Media/Baja | __________ | __________ | __________________ |

## 9. Soporte, garantía y costos

| Condición | Acuerdo |
|---|---|
| Inicio de garantía | ____ / ____ / ______ |
| Fin o duración | __________________________________________ |
| Horario de atención | __________________________________________ |
| Correo / teléfono | __________________________________________ |
| Tiempo objetivo para incidente crítico | __________________________________________ |
| Correcciones incluidas | __________________________________________ |
| Mejoras o cambios fuera de alcance | __________________________________________ |
| Responsable de renovaciones de terceros | __________________________________________ |

Salvo acuerdo escrito, la garantía corrige defectos reproducibles del alcance entregado y no incluye nuevas funciones, datos capturados incorrectamente, indisponibilidad de terceros, pérdida de credenciales ni cambios solicitados después de la aceptación.

## 10. Declaración de decisión

Marque una sola opción:

- [ ] **Aceptación final.** El cliente recibe la versión indicada sin reservas abiertas.
- [ ] **Aceptación condicionada.** El cliente recibe la versión con las reservas de la sección 8.
- [ ] **No aceptada.** Se requiere corregir los puntos anexos antes de una nueva revisión.

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

- [ ] Los datos de identificación y URLs están completos.
- [ ] La revisión entregada está etiquetada y accesible.
- [ ] El cliente controla las cuentas y servicios indicados.
- [ ] Se rotaron secretos temporales o compartidos.
- [ ] Existe al menos un respaldo reciente bajo control del cliente.
- [ ] Se explicó cómo restaurar y escalar un incidente.
- [ ] Los pendientes tienen responsable y fecha.
- [ ] Ambas partes conservan una copia idéntica del acta firmada.

> Anexe a esta acta la versión final del reporte de pruebas, la lista de reservas y cualquier evidencia de restauración o pagos que forme parte de la decisión.
