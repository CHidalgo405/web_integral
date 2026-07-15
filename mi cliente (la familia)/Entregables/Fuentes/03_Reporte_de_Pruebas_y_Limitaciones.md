# Reporte de pruebas y limitaciones
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Version del reporte:** 1.0
**Fecha de ejecucion:** 14 de julio de 2026
**Revision base:** `138d4e5` (`main` antes de agregar esta documentacion)

> Resultado general: compilacion frontend aprobada con advertencias; pruebas backend aprobadas en el alcance ejecutado; aceptacion integral pendiente por pruebas frontend, base aislada y recorrido manual en navegador.

<!-- PAGEBREAK -->

## 1. Alcance y metodo

La validacion se ejecuto sobre el codigo local del repositorio. Se utilizaron los comandos declarados por cada proyecto. No se utilizaron credenciales de produccion ni se realizaron cobros reales.

| Componente | Comando | Resultado |
|---|---|---|
| Backend | `npm test` | 21 registradas: 19 aprobadas, 0 fallidas, 2 omitidas. |
| Frontend | `npm run build` | Compilacion aprobada; salida generada. |
| Frontend | `npm test -- --watch=false` | No aprobado: Vitest informa que no encontro archivos de prueba ejecutables. |
| Prueba visual | Navegador integrado | No ejecutada: navegador no disponible en la sesion de validacion. |
| Restauracion de respaldo | Base aislada | No ejecutada. |

## 2. Resultados backend

El proceso termino con codigo 0 en 62.8 segundos. Las 19 pruebas aprobadas cubren principalmente autorizacion, validacion de checkout, reglas de envio y validacion de opiniones.

### 2.1 Controles aprobados

- Endpoints de negocio rechazan solicitudes sin autenticar.
- El cliente no puede modificar catalogo ni consultar recursos internos.
- El cajero alcanza el flujo POS pero permanece fuera de recursos administrativos.
- Almacen alcanza ajustes y permanece fuera de administracion.
- Gerencia hereda los permisos administrativos previstos.
- Checkout normaliza productos duplicados y rechaza cantidades invalidas.
- Tarifas de envio se calculan desde reglas del servidor.
- Descuentos se limitan y distribuyen entre lineas elegibles.
- Limites y continuidad de zonas de entrega se validan.
- Opiniones validan calificacion, longitud e identificadores UUID.

### 2.2 Pruebas omitidas

| Prueba | Motivo | Variable requerida |
|---|---|---|
| Ajuste de inventario registra movimiento auditable | Requiere PostgreSQL de prueba aislado. | `INVENTORY_TEST_DATABASE_URL` |
| POS abre caja, vende, descuenta stock y cierra | Requiere PostgreSQL de prueba aislado. | `POS_TEST_DATABASE_URL` |

El final del proceso tambien registro un intento de conexion PostgreSQL sin una contrasena valida. No cambio el codigo de salida, pero confirma que el entorno general no sustituyo las dos pruebas integrales omitidas.

## 3. Resultados frontend

### 3.1 Compilacion

La compilacion Angular termino con codigo 0 en 12.8 segundos. El paquete inicial fue de aproximadamente 365 kB sin comprimir y 100 kB de transferencia estimada, ademas de modulos de carga diferida.

Se registraron advertencias:

- La hoja de fuente Source Code Pro supera el presupuesto configurado por 6.76 kB.
- Dependencias de `canvg`, `core-js`, `raf`, `rgbcolor` y `html2canvas` usan CommonJS/AMD y pueden reducir optimizaciones.
- El equipo de validacion utilizo Node.js 23.11, una version impar no LTS; produccion debe usar Node 20 LTS segun la arquitectura del servicio.

### 3.2 Pruebas automatizadas

El comando de pruebas construyo los paquetes de especificacion, pero Vitest termino con codigo 1 y el mensaje **No test files found**. Aunque existen archivos con extension `.spec.ts`, actualmente no constituyen una suite ejecutable reconocida por la configuracion.

## 4. Matriz de cobertura

| Area | Automatizada | Integracion real | Recorrido manual | Estado |
|---|---|---|---|---|
| Autenticacion y permisos backend | Si | Parcial | Pendiente | Satisfactorio en alcance unitario/rutas. |
| Checkout y envio | Si | Parcial | Pendiente | Reglas principales aprobadas. |
| Punto de venta | Permisos | Omitida | Pendiente | No cerrar aceptacion sin prueba aislada. |
| Inventario | Permisos | Omitida | Pendiente | No cerrar aceptacion sin prueba aislada. |
| Frontend | No ejecutable | No | Pendiente | Brecha de cobertura. |
| Correo | No | No | Pendiente | Requiere credenciales/configuracion. |
| PayPal | No | No | Pendiente | Probar sandbox y conciliacion. |
| Google OAuth | No | No | Pendiente | Probar origen y cliente final. |
| Cloudinary | No | No | Pendiente | Probar carga y lectura. |
| Respaldo/restauracion | No | No | Pendiente | Debe probarse antes de operacion critica. |

## 5. Limitaciones y riesgos conocidos

| Prioridad | Hallazgo | Riesgo | Accion recomendada |
|---|---|---|---|
| Alta | Pruebas POS e inventario omitidas. | Errores transaccionales podrian aparecer con PostgreSQL real. | Ejecutar contra base desechable inicializada con `init.sql`. |
| Alta | Frontend sin suite ejecutable. | Regresiones de interfaz y guards no se detectan automaticamente. | Corregir configuracion Vitest y agregar pruebas de flujos criticos. |
| Alta | Restauracion no probada. | Un respaldo existente podria no ser recuperable. | Realizar simulacro y registrar evidencia. |
| Alta | Canales de soporte y propietario de servicios no confirmados. | Incidentes sin responsable y perdida de control de cuentas. | Completar acta y rotar credenciales. |
| Media | Documentos historicos mencionan Angular 17 y roles antiguos. | Operacion o mantenimiento con instrucciones incorrectas. | Actualizar arquitectura y diseño de datos. |
| Media | Nombres Tiendita Maday, Verduleria Retama y La Familia mezclados. | Confusion comercial y legal. | Aprobar una marca oficial y normalizarla. |
| Media | Advertencias de optimizacion frontend. | Paquete mayor o rendimiento inferior al posible. | Presupuestar fuente y revisar dependencias CommonJS. |
| Media | Terminos y contactos incluidos en la UI requieren revision del cliente. | Informacion legal o de soporte inexacta. | Revision legal/comercial antes de produccion. |
| Baja | Documentos duplicados sin etiqueta de version final. | El cliente puede usar una version antigua. | Archivar fuentes y marcar finales. |

## 6. Pruebas pendientes para aceptacion

### 6.1 Tecnicas

- [ ] Crear PostgreSQL de prueba desechable desde `Database/init.sql`.
- [ ] Ejecutar las dos pruebas integrales con sus variables de entorno.
- [ ] Corregir y ejecutar la suite frontend.
- [ ] Ejecutar compilacion con Node 20 LTS y configuracion de produccion.
- [ ] Probar migraciones desde una copia de la base actual.
- [ ] Crear un respaldo y restaurarlo en una base nueva.

### 6.2 Negocio

- [ ] Administrador inicia sesion y administra un usuario.
- [ ] Cajero abre caja, vende en efectivo y cierra sin diferencia.
- [ ] Se registra una tarjeta aprobada por terminal externa sin cobro duplicado.
- [ ] Almacen registra entrada y salida con movimiento auditable.
- [ ] Cliente completa pedido de recoleccion.
- [ ] Cliente completa pedido de entrega y la tarifa es correcta.
- [ ] PayPal sandbox confirma y concilia un pedido.
- [ ] Recuperacion de contrasena llega al correo real.
- [ ] Imagen de producto se almacena y vuelve a cargar.
- [ ] Pedido y existencia permanecen correctos despues de actualizar la pagina.

## 7. Criterio de salida recomendado

La version puede presentarse para una **aceptacion condicionada**, ya que compila y los controles backend ejecutados no muestran fallas. No se recomienda una aceptacion final sin reservas hasta aprobar al menos:

1. Integraciones POS e inventario en una base aislada.
2. Recorrido manual de los cinco roles.
3. Prueba de pagos en sandbox y correo real.
4. Simulacro de respaldo y restauracion.
5. Correccion o acuerdo explicito sobre la ausencia de pruebas frontend.

## 8. Evidencia resumida

| Fecha | Evidencia | Resultado |
|---|---|---|
| 14-jul-2026 | Backend `npm test` | 19 pass, 0 fail, 2 skip, codigo 0. |
| 14-jul-2026 | Frontend `npm run build` | Aprobado con advertencias, codigo 0. |
| 14-jul-2026 | Frontend `npm test -- --watch=false` | No test files found, codigo 1. |
| 14-jul-2026 | Navegador y flujos visuales | No ejecutados en esta sesion. |

> Este reporte no certifica seguridad, cumplimiento legal, rendimiento a escala ni disponibilidad de terceros. Describe exactamente la evidencia ejecutada y los huecos observados.
