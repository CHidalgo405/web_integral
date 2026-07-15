# Paquete de entrega al cliente
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Version documentada:** 1.0
**Fecha de corte:** 14 de julio de 2026
**Estado:** Entrega documental para revision y aceptacion

> Este documento es el punto de entrada del paquete. Explica que se entrega, como comenzar y que datos deben completarse antes de firmar la aceptacion.

<!-- PAGEBREAK -->

## 1. Proposito de la entrega

Este paquete concentra la informacion necesaria para usar, operar, respaldar y aceptar formalmente Tiendita Maday. Los documentos separan las instrucciones de negocio, que utiliza la familia en la operacion diaria, de las instrucciones tecnicas, que corresponden a la persona responsable del servicio.

La documentacion usa **Tiendita Maday** como nombre del sistema y **La Familia** como cliente. Antes de publicar material comercial se debe confirmar si la marca visible definitiva sera Tiendita Maday, Verduleria Retama u otro nombre aprobado por el cliente.

## 2. Contenido del paquete

| Archivo | Para quien | Proposito |
|---|---|---|
| `00_LEEME_PRIMERO.pdf` | Todas las partes | Indice, inicio rapido y estado de entrega. |
| `01_Manual_de_Usuario.pdf` | Propietario, gerente, cajero, almacen y clientes | Uso cotidiano del sistema por rol. |
| `02_Guia_de_Operacion_Respaldo_y_Recuperacion.pdf` | Responsable tecnico y propietario | Despliegue, actualizaciones, respaldos, restauracion e incidentes. |
| `03_Reporte_de_Pruebas_y_Limitaciones.pdf` | Cliente y equipo de desarrollo | Evidencia ejecutada, resultados, riesgos y pendientes. |
| `04_Acta_de_Entrega_y_Aceptacion.pdf` | Representantes autorizados | Lista de verificacion, reservas y firmas de aceptacion. |
| `Fuentes/` | Equipo responsable | Versiones editables y generador reproducible de los documentos. |

## 3. Inicio rapido para el cliente

1. Confirmar con el equipo la **URL oficial del frontend** y abrirla desde un navegador actualizado.
2. Confirmar que el propietario puede iniciar sesion con una cuenta `admin` o `manager`.
3. Cambiar las contrasenas temporales y activar solamente las cuentas necesarias.
4. Revisar la configuracion de tienda, moneda, ubicacion, zonas de entrega y metodos de pago.
5. Registrar o importar productos, precios, costos, existencias y codigos de barras.
6. Crear cuentas separadas para cajeros y almacen; nunca compartir la cuenta administrativa.
7. Realizar una venta de prueba, un ajuste de inventario y un cierre de caja.
8. Confirmar que existe un respaldo reciente y que el responsable sabe restaurarlo.
9. Revisar el reporte de pruebas y documentar cualquier reserva en el acta de aceptacion.

## 4. Roles principales

| Rol | Uso principal | Acceso sensible |
|---|---|---|
| `admin` | Propietario o administrador del sistema | Control administrativo, usuarios, finanzas y configuracion. |
| `manager` | Gerencia de tienda | Comparte la operacion administrativa; debe asignarse solo a personal de confianza. |
| `cashier` | Punto de venta y operaciones propias | Caja abierta, ventas y corte de su turno. |
| `stock` | Existencias y movimientos | Ajustes de entrada/salida con trazabilidad. |
| `customer` | Compra en linea | Catalogo, carrito, direcciones, pedidos y perfil personal. |

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
| Telefono y horario de soporte | ______________________________________________ |
| Periodo de garantia | ______________________________________________ |
| Fecha prevista de entrada en produccion | ______________________________________________ |

## 6. Cuentas y servicios que deben transferirse

- [ ] Repositorio GitHub y permisos del propietario.
- [ ] Proyecto Railway y sus servicios de frontend, backend y PostgreSQL.
- [ ] Dominio y configuracion DNS, si aplica.
- [ ] Aplicacion PayPal y confirmacion de modo sandbox o produccion.
- [ ] Google OAuth y origenes/redirecciones autorizados.
- [ ] Cloudinary para imagenes de inventario.
- [ ] Servicio EmailJS o servicio de correo equivalente.
- [ ] Correo y telefono publicados como soporte.
- [ ] Ubicacion del respaldo y responsable de probar la restauracion.

Las contrasenas y secretos se entregan mediante un gestor de contrasenas o canal cifrado. **No deben escribirse en este paquete ni almacenarse en Git.**

## 7. Estado documental y reservas conocidas

Este paquete describe el comportamiento observado en el codigo con fecha de corte 14 de julio de 2026. El reporte de pruebas registra que el backend aprobo sus pruebas no dependientes de base aislada y que el frontend compilo; tambien registra pruebas integrales pendientes y la ausencia de una suite frontend ejecutable.

La documentacion tecnica historica contiene referencias a Angular 17 y roles antiguos. El codigo actual utiliza Angular 21.2 y los roles `admin`, `manager`, `cashier`, `stock` y `customer`. Para operar la version actual prevalecen esta entrega, el codigo etiquetado y el archivo de migraciones.

## 8. Orden recomendado de lectura

1. El propietario y gerente leen el Manual de Usuario.
2. La persona tecnica revisa la Guia de Operacion, Respaldo y Recuperacion.
3. Ambas partes revisan el Reporte de Pruebas y Limitaciones.
4. Se completan los datos pendientes y se ejecuta una prueba de aceptacion.
5. Solo entonces se firma el Acta de Entrega y Aceptacion.

## 9. Control de la entrega

| Elemento | Identificador |
|---|---|
| Repositorio | `Christba03/Tiendita-Maday` |
| Rama de documentacion | `docs/entregables-cliente` |
| Version de documentos | 1.0 |
| Fecha de corte | 14 de julio de 2026 |
| Idioma | Espanol |
| Formato final | PDF, con fuentes Markdown reproducibles |

> La firma del acta no debe realizarse con campos vacios. Si existe un pendiente aceptado, debe escribirse como reserva, asignar responsable y establecer fecha compromiso.
