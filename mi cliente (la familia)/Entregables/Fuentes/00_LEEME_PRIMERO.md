# Paquete de entrega al cliente
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Versión documentada:** 1.1
**Fecha de corte del código:** 14 de julio de 2026
**Fecha de documentación:** 15 de julio de 2026
**Estado:** Entrega documental para revisión y aceptación

> Este documento es el punto de entrada del paquete. Explica qué se entrega, cómo comenzar y qué datos deben completarse antes de firmar la aceptación.

<!-- PAGEBREAK -->

## 1. Propósito de la entrega

Este paquete concentra la información necesaria para usar, operar, respaldar y aceptar formalmente Tiendita Maday. Los documentos separan las instrucciones de negocio, que utiliza la familia en la operación diaria, de las instrucciones técnicas, que corresponden a la persona responsable del servicio.

La documentación usa **Tiendita Maday** como nombre del sistema y **La Familia** como cliente. Antes de publicar material comercial se debe confirmar si la marca visible definitiva será Tiendita Maday, Verdulería Retama u otro nombre aprobado por el cliente.

## 2. Contenido del paquete

| Archivo | Para quién | Propósito |
|---|---|---|
| `00_LEEME_PRIMERO.pdf` | Todas las partes | Índice, inicio rápido y estado de entrega. |
| `01_Manual_de_Usuario.pdf` | Propietario, gerente, cajero, almacén y clientes | Uso cotidiano del sistema por rol, con capturas de pantalla reales y pasos detallados. |
| `02_Guia_de_Operacion_Respaldo_y_Recuperacion.pdf` | Responsable técnico y propietario | Despliegue, actualizaciones, respaldos, restauración e incidentes. |
| `03_Reporte_de_Pruebas_y_Limitaciones.pdf` | Cliente y equipo de desarrollo | Evidencia ejecutada, resultados, riesgos y pendientes. |
| `04_Acta_de_Entrega_y_Aceptacion.pdf` | Representantes autorizados | Lista de verificación, reservas y firmas de aceptación. |
| `Fuentes/` | Equipo responsable | Versiones editables, capturas de pantalla y generador reproducible de los documentos. |

## 3. Inicio rápido para el cliente

1. Confirmar con el equipo la **URL oficial del frontend** y abrirla desde un navegador actualizado.
2. Confirmar que el propietario puede iniciar sesión con una cuenta `admin` o `manager`.
3. Cambiar las contraseñas temporales y activar solamente las cuentas necesarias.
4. Revisar la configuración de tienda, moneda, ubicación, zonas de entrega y métodos de pago.
5. Registrar o importar productos, precios, costos, existencias y códigos de barras.
6. Crear cuentas separadas para cajeros y almacén; nunca compartir la cuenta administrativa.
7. Realizar una venta de prueba, un ajuste de inventario y un cierre de caja.
8. Confirmar que existe un respaldo reciente y que el responsable sabe restaurarlo.
9. Revisar el reporte de pruebas y documentar cualquier reserva en el acta de aceptación.

![Página de inicio del cliente en la versión documentada.](capturas/10_cliente_inicio.png)

## 4. Roles principales

| Rol | Uso principal | Acceso sensible |
|---|---|---|
| `admin` | Propietario o administrador del sistema | Control administrativo, usuarios, finanzas y configuración. |
| `manager` | Gerencia de tienda | Comparte la operación administrativa; debe asignarse solo a personal de confianza. |
| `cashier` | Punto de venta y operaciones propias | Caja abierta, ventas y corte de su turno. |
| `stock` | Existencias y movimientos | Ajustes de entrada/salida con trazabilidad. |
| `customer` | Compra en línea | Catálogo, carrito, direcciones, pedidos y perfil personal. |

> Cada persona debe tener su propia cuenta. El historial de caja, inventario y pedidos pierde valor si varias personas comparten credenciales.

## 5. Datos que deben completarse antes de la firma

| Dato | Valor acordado |
|---|---|
| Nombre comercial definitivo | ______________________________________________ |
| URL del sitio | ______________________________________________ |
| URL de la API | ______________________________________________ |
| Propietario de Railway | ______________________________________________ |
| Propietario del dominio | ______________________________________________ |
| Responsable de respaldos | ______________________________________________ |
| Correo real de soporte | ______________________________________________ |
| Teléfono y horario de soporte | ______________________________________________ |
| Periodo de garantía | ______________________________________________ |
| Fecha prevista de entrada en producción | ______________________________________________ |

## 6. Cuentas y servicios que deben transferirse

- [ ] Repositorio GitHub y permisos del propietario.
- [ ] Proyecto Railway y sus servicios de frontend, backend y PostgreSQL.
- [ ] Dominio y configuración DNS, si aplica.
- [ ] Aplicación PayPal y confirmación de modo sandbox o producción.
- [ ] Google OAuth y orígenes/redirecciones autorizados.
- [ ] Cloudinary para imágenes de inventario.
- [ ] Servicio EmailJS o servicio de correo equivalente.
- [ ] Correo y teléfono publicados como soporte.
- [ ] Ubicación del respaldo y responsable de probar la restauración.

Las contraseñas y secretos se entregan mediante un gestor de contraseñas o canal cifrado. **No deben escribirse en este paquete ni almacenarse en Git.**

## 7. Estado documental y reservas conocidas

Este paquete describe el comportamiento observado en el código con fecha de corte 14 de julio de 2026. El reporte de pruebas registra que el backend aprobó sus pruebas no dependientes de base aislada y que el frontend compiló. El 15 de julio de 2026 se ejecutó además un recorrido visual de los cinco roles en un entorno local; las capturas de ese recorrido ilustran el Manual de Usuario y la evidencia del reporte. Siguen pendientes las pruebas integrales automatizadas con base aislada y la suite frontend ejecutable.

La documentación técnica histórica contiene referencias a Angular 17 y roles antiguos. El código actual utiliza Angular 21.2 y los roles `admin`, `manager`, `cashier`, `stock` y `customer`. Para operar la versión actual prevalecen esta entrega, el código etiquetado y el archivo de migraciones.

## 8. Orden recomendado de lectura

1. El propietario y gerente leen el Manual de Usuario.
2. La persona técnica revisa la Guía de Operación, Respaldo y Recuperación.
3. Ambas partes revisan el Reporte de Pruebas y Limitaciones.
4. Se completan los datos pendientes y se ejecuta una prueba de aceptación.
5. Solo entonces se firma el Acta de Entrega y Aceptación.

## 9. Control de la entrega

| Elemento | Identificador |
|---|---|
| Repositorio | `Christba03/Tiendita-Maday` |
| Rama de documentación | `docs/entregables-cliente` |
| Versión de documentos | 1.1 |
| Fecha de corte del código | 14 de julio de 2026 |
| Idioma | Español |
| Formato final | PDF, con fuentes Markdown y capturas reproducibles |

> La firma del acta no debe realizarse con campos vacíos. Si existe un pendiente aceptado, debe escribirse como reserva, asignar responsable y establecer fecha compromiso.
