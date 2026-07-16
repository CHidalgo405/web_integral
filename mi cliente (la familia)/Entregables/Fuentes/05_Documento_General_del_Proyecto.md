# Documento general del proyecto
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Versión:** 2.0
**Fecha:** 16 de julio de 2026
**Revisión de código:** `998b874` sobre la rama `main`

> Documento rector del proyecto. Define el problema, los objetivos, el alcance y los requerimientos verificables de la aplicación web entregada.

<!-- PAGEBREAK -->

## 1. Resumen ejecutivo

Tiendita Maday es una aplicación web para concentrar en un solo sistema la venta en línea, el punto de venta, el control de inventario y la administración cotidiana de una tienda minorista. Atiende a cinco perfiles: cliente, cajero, almacén, gerente y administrador.

La solución sustituye registros dispersos y cálculos manuales por operaciones trazables: cada venta vuelve a validar precio y existencia en el servidor; cada ajuste de inventario conserva responsable, motivo y cantidades; y cada caja registra apertura, cobros, efectivo esperado y corte.

El producto se entrega como una aplicación Angular conectada a una API Express y una base PostgreSQL. Incluye despliegue reproducible, migraciones, documentación OpenAPI y un paquete documental para operación, pruebas y aceptación.

## 2. Problema que resuelve

La operación de una tienda pequeña suele dividirse entre notas, hojas de cálculo, mensajes y decisiones verbales. Esa fragmentación provoca:

- Existencias diferentes entre el anaquel, la caja y el catálogo.
- Ventas sin trazabilidad suficiente para conciliación.
- Precios, promociones y entregas calculados de forma inconsistente.
- Dificultad para saber quién realizó un ajuste o una operación.
- Información duplicada de clientes, proveedores y productos.
- Dependencia de una sola persona para conocer el estado del negocio.
- Poca evidencia para revisar errores, caducidades, gastos o diferencias de caja.

Tiendita Maday resuelve este problema mediante una fuente operativa central, permisos por rol y flujos que validan las reglas relevantes antes de confirmar cambios.

## 3. Usuarios y necesidades

| Perfil | Necesidad principal | Respuesta del sistema |
|---|---|---|
| Cliente | Comprar y dar seguimiento sin acudir a la tienda | Catálogo, carrito, direcciones, checkout, pedidos y perfil. |
| Cajero | Cobrar rápido y cerrar su turno con control | Punto de venta, apertura de caja, cobro, cambio, historial y corte. |
| Almacén | Mantener existencias confiables | Consulta, entradas, salidas y movimientos auditables. |
| Gerente | Coordinar la operación diaria | Panel administrativo, catálogo, pedidos, abasto y promociones. |
| Administrador | Controlar configuración y funciones sensibles | Usuarios, finanzas, zonas, seguridad y servicios. |

## 4. Objetivo general

Desarrollar e implementar una aplicación web responsiva que integre ventas, inventario, pedidos, clientes y administración de Tiendita Maday, con reglas de negocio centralizadas, permisos por rol y evidencia suficiente para operar y mantener el sistema.

## 5. Objetivos específicos

1. Permitir el registro, autenticación y recuperación de cuentas con acceso acorde al rol.
2. Publicar un catálogo consultable con categorías, precios, imágenes, disponibilidad y reseñas.
3. Completar compras con carrito, dirección, entrega o recolección, promociones y pago configurado.
4. Proporcionar un punto de venta que controle caja, stock, cobros y cierre de turno.
5. Registrar entradas y salidas de inventario con trazabilidad y protección contra stock negativo.
6. Administrar productos, usuarios, pedidos, proveedores, abastecimiento, promociones y caducidades.
7. Generar información útil para seguimiento de ventas, existencias, caja y finanzas.
8. Proteger operaciones mediante autenticación, autorización y validaciones del lado del servidor.
9. Facilitar despliegue, respaldo, restauración y evolución por medio de documentación y migraciones.

## 6. Alcance funcional incluido

### 6.1 Identidad y seguridad

- Registro e inicio de sesión con correo y contraseña.
- Inicio de sesión con Google cuando se configura el cliente OAuth.
- Verificación de correo, recuperación y cambio de contraseña.
- Sesiones con tokens de acceso y renovación.
- Roles `admin`, `manager`, `cashier`, `stock` y `customer`.
- Guards en la interfaz y autorización en la API.

### 6.2 Venta digital

- Catálogo, categorías, búsqueda, favoritos y detalle de producto.
- Carrito y validación de cantidades.
- Direcciones, mapa, zonas de entrega y cálculo de tarifa en servidor.
- Recolección o entrega, promociones y totales autoritativos.
- Pedidos, estados, historial y comprobantes.
- Integración configurable con PayPal.

### 6.3 Operación interna

- Punto de venta con búsqueda, SKU o código de barras.
- Apertura de caja, venta en efectivo o tarjeta externa y corte.
- Existencias, entradas, salidas y bitácora de movimientos.
- Productos, categorías, precios, imágenes y alertas.
- Proveedores, órdenes de compra, recepción y caducidades.
- Usuarios, clientes, promociones, gastos, auditorías y configuración.

### 6.4 Plataforma

- Aplicación Angular 21.2 responsiva y preparada como PWA.
- API REST Express 4 documentada mediante OpenAPI.
- PostgreSQL con esquema inicial y migraciones versionadas.
- Configuración para ejecución local, contenedores y Railway.

## 7. Límites y exclusiones

La versión actual no incluye ni promete:

- Facturación fiscal CFDI, timbrado o integración con el SAT.
- Contabilidad completa, nómina o conciliación bancaria automática.
- Procesamiento físico de tarjetas; la terminal se opera externamente.
- Rastreo GPS en tiempo real de repartidores.
- Aplicaciones nativas publicadas en App Store o Google Play.
- Operación sin conexión para confirmar ventas o modificar inventario.
- Garantía de disponibilidad de PayPal, Google, Cloudinary, correo o Railway.
- Migración automática desde sistemas anteriores sin un proyecto de datos acordado.
- Certificación formal de seguridad, accesibilidad o cumplimiento legal.

Los elementos anteriores pueden incorporarse en fases posteriores mediante alcance, costo y criterios de aceptación propios.

## 8. Requerimientos funcionales

| ID | Requerimiento | Criterio verificable | Prioridad |
|---|---|---|---|
| RF-01 | Autenticar usuarios | Una credencial válida inicia sesión y una inválida muestra error sin revelar datos sensibles. | Alta |
| RF-02 | Aplicar permisos por rol | Cada rol accede solo a rutas y operaciones autorizadas por la API. | Alta |
| RF-03 | Administrar catálogo | Personal autorizado crea, consulta, modifica y desactiva productos y categorías. | Alta |
| RF-04 | Consultar productos | El cliente busca, filtra y abre productos activos con precio y disponibilidad. | Alta |
| RF-05 | Gestionar carrito | El cliente agrega, modifica o elimina artículos y observa el total preliminar. | Alta |
| RF-06 | Confirmar pedido | El servidor vuelve a validar producto, stock, promoción, entrega y total antes de guardar. | Alta |
| RF-07 | Gestionar direcciones | El cliente registra direcciones y coordenadas para calcular cobertura. | Media |
| RF-08 | Cobrar en POS | El cajero con caja abierta registra una venta y el sistema descuenta existencia. | Alta |
| RF-09 | Controlar caja | El sistema registra fondo inicial, ventas, efectivo esperado, conteo y diferencia. | Alta |
| RF-10 | Ajustar inventario | Un usuario autorizado registra entrada o salida con motivo, nota y auditoría. | Alta |
| RF-11 | Evitar stock negativo | La API rechaza una venta o salida que exceda la existencia disponible. | Alta |
| RF-12 | Gestionar usuarios | El administrador crea, activa, desactiva y asigna roles. | Alta |
| RF-13 | Administrar abastecimiento | Gerencia controla proveedores, órdenes y recepción de existencias. | Media |
| RF-14 | Controlar caducidades | El sistema registra lotes y permite seguimiento o retiro. | Media |
| RF-15 | Gestionar promociones | Personal autorizado programa descuentos con vigencia y producto elegible. | Media |
| RF-16 | Consultar reportes | Los módulos muestran métricas de ventas, stock, pedidos, caja y finanzas disponibles. | Media |
| RF-17 | Emitir comprobantes | El sistema puede generar recibos o reportes PDF en los flujos implementados. | Media |
| RF-18 | Recuperar acceso | La cuenta solicita y utiliza un mecanismo temporal de recuperación configurado. | Alta |
| RF-19 | Administrar imágenes | Personal autorizado carga y elimina imágenes mediante Cloudinary configurado. | Media |
| RF-20 | Documentar API | El backend publica OpenAPI en `/swagger.json` y una interfaz en `/api-docs`. | Media |

## 9. Requerimientos no funcionales

| ID | Categoría | Requerimiento y forma de evaluación |
|---|---|---|
| RNF-01 | Seguridad | Contraseñas con hash, JWT firmados, autorización por rol y secretos fuera del repositorio. |
| RNF-02 | Integridad | Ventas y cambios críticos usan validación del servidor y transacciones cuando afecta varias tablas. |
| RNF-03 | Privacidad | La interfaz y los logs evitan divulgar contraseñas, tokens o información completa innecesaria. |
| RNF-04 | Rendimiento | Carga diferida de módulos; compilación de producción dentro de los presupuestos acordados o con advertencias registradas. |
| RNF-05 | Disponibilidad | El despliegue puede reiniciarse y recrearse con código, variables y migraciones documentadas. |
| RNF-06 | Recuperabilidad | Respaldo lógico exportable y restauración aislada siguiendo el manual técnico. |
| RNF-07 | Usabilidad | Flujos principales con mensajes de estado, validaciones visibles y lenguaje comprensible. |
| RNF-08 | Responsividad | Operación utilizable en móvil y escritorio sin perder acciones críticas. |
| RNF-09 | Compatibilidad | Navegadores vigentes basados en Chromium, Firefox y Safari; Node 22.12 o superior para desarrollo. |
| RNF-10 | Mantenibilidad | Separación en módulos, controladores, servicios, modelos, rutas y migraciones versionadas. |
| RNF-11 | Auditabilidad | Movimientos de inventario, sesiones, caja y cambios sensibles conservan responsable y fecha donde aplica. |
| RNF-12 | Accesibilidad | Formularios con etiquetas y navegación comprensible; una auditoría WCAG completa queda pendiente. |
| RNF-13 | Escalabilidad | Frontend, API y base se despliegan como componentes separables y configurables por entorno. |
| RNF-14 | Observabilidad | Errores centralizados y logs operativos suficientes sin exponer secretos. |

## 10. Reglas de negocio esenciales

- El servidor, no el navegador, determina el precio, descuento, envío y total final.
- Una venta de caja requiere empleado vinculado y caja abierta.
- Un ajuste o venta nunca puede dejar una existencia negativa.
- Las operaciones sensibles exigen token válido y rol autorizado.
- Las funciones de propietario, como finanzas y configuración, se reservan al administrador exacto.
- Las promociones se aplican únicamente durante su vigencia y a productos elegibles.
- La tarifa de entrega depende de zonas continuas y reglas configuradas.
- Las cuentas son personales; compartirlas reduce la trazabilidad.
- Las eliminaciones operativas se sustituyen por desactivación o bitácora cuando conservar evidencia es necesario.

## 11. Criterios globales de aceptación

1. El código fuente del commit identificado compila en un entorno compatible.
2. Los cinco roles pueden autenticarse y quedan limitados a su espacio.
3. Cliente, caja e inventario completan al menos un flujo feliz con datos de prueba.
4. Las validaciones impiden cantidades inválidas, accesos no autorizados y stock negativo.
5. La API y la base se despliegan con variables y migraciones documentadas.
6. El cliente recibe manuales, reporte de pruebas, acta, checklist y evidencia.
7. Las integraciones externas se prueban en sandbox o quedan registradas como reserva.
8. Los pendientes tienen prioridad, responsable y fecha compromiso.

## 12. Trazabilidad documental

| Tema | Documento principal |
|---|---|
| Uso por rol | `01_Manual_de_Usuario.pdf` |
| Operación, respaldo y recuperación | `02_Guia_de_Operacion_Respaldo_y_Recuperacion.pdf` |
| Pruebas, incidencias y limitaciones | `03_Reporte_de_Pruebas_y_Limitaciones.pdf` |
| Aceptación y firmas | `04_Acta_de_Entrega_y_Aceptacion.pdf` |
| Arquitectura y flujo | `06_Arquitectura_del_Sistema.pdf` |
| Interfaces e identidad | `07_Diseno_de_Interfaces_e_Identidad_Visual.pdf` |
| Tecnologías y servicios | `08_Documento_de_Implementacion.pdf` |
| Historial y participación | `09_Evidencias_de_Desarrollo_y_Participacion.pdf` |
| Instalación y configuración | `10_Manual_Tecnico_de_Instalacion_y_Configuracion.pdf` |

> Este documento describe el alcance observable del código. Cualquier cambio posterior debe actualizar la revisión, los casos de prueba y la matriz de aceptación.
