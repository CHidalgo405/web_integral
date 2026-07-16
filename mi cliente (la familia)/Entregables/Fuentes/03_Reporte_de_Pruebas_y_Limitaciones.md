# Reporte de pruebas, incidencias y correcciones
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Versión del reporte:** 2.0
**Fecha de ejecución actual:** 16 de julio de 2026
**Revisión probada:** `123372c` en `main`

> Resultado general: build frontend aprobado con advertencias; 19 pruebas backend aprobadas y 2 omitidas; suite frontend no aprobada porque Vitest no encuentra archivos ejecutables; recorrido manual previo de cinco roles respaldado por 25 capturas. La aceptación final continúa condicionada.

<!-- PAGEBREAK -->

## 1. Alcance y entorno

La verificación actual se ejecutó después de sincronizar `origin/main`. No se usaron credenciales de producción ni pagos live.

| Elemento | Valor |
|---|---|
| Sistema operativo | macOS del equipo de verificación |
| Node.js | 24.14.0 LTS |
| Rama / commit | `main` / `123372c` |
| Backend | Node test runner |
| Frontend | Angular build + Vitest mediante `ng test` |
| Recorrido visual | Evidencia local del 15-jul-2026 |
| Restauración | No ejecutada |

### 1.1 Resumen

| Componente | Comando / método | Resultado |
|---|---|---|
| Backend | `npm test` | 21 registradas: 19 aprobadas, 0 fallidas, 2 omitidas; código 0. |
| Frontend | `npm run build` | Aprobado en 3.858 s; código 0 con advertencias. |
| Frontend | `npm test -- --watch=false` | No aprobado: “No test files found”; código 1. |
| Prueba visual | Recorrido local de cinco roles | Ejecutado; 25 capturas. |
| POS e inventario reales | Recorrido contra PostgreSQL local | Flujos felices ejecutados. |
| Respaldo/restauración | Base aislada | Pendiente. |

## 2. Casos de prueba documentados

| ID | Caso | Resultado esperado | Resultado actual | Estado |
|---|---|---|---|---|
| CP-01 | Compilar frontend | Generar bundle sin error | Bundle generado; 361.49 kB iniciales, 98.99 kB transferencia estimada | Aprobado con advertencias |
| CP-02 | Rechazo sin autenticación | Endpoints de negocio rechazan petición | Prueba aprobada | Aprobado |
| CP-03 | Permisos por rol | Cliente/cajero/stock no acceden a admin; manager hereda gestión | Pruebas aprobadas | Aprobado |
| CP-04 | Validación de checkout | Rechazar cantidades inválidas y normalizar duplicados | Prueba aprobada | Aprobado |
| CP-05 | Cálculo de entrega | Servidor define zona, límites y tarifa | Pruebas aprobadas | Aprobado |
| CP-06 | Validación de reseñas | Rating, comentario y UUID válidos | Pruebas aprobadas | Aprobado |
| CP-07 | Venta POS manual | Abrir, vender, descontar stock y preparar corte | Ejecutado el 15-jul con captura | Aprobado manual |
| CP-08 | Ajuste de inventario manual | Cambiar stock y guardar auditoría | Ejecutado el 15-jul con captura | Aprobado manual |
| CP-09 | Suite frontend | Ejecutar especificaciones y producir resultados | Vitest no encuentra tests | No aprobado |
| CP-10 | Integración POS automática | Ciclo completo sobre base desechable | Omitida sin `POS_TEST_DATABASE_URL` | Pendiente |
| CP-11 | Integración inventario automática | Ajuste y auditoría sobre base desechable | Omitida sin URL de prueba | Pendiente |
| CP-12 | Restauración | Recuperar respaldo en base aislada | No ejecutada | Pendiente |

## 3. Resultado backend

El proceso terminó con código 0 en **10.411 segundos**:

- 21 tests registrados.
- 19 aprobados.
- 0 fallidos.
- 2 omitidos.
- 0 cancelados.

### 3.1 Cobertura aprobada

- Rutas de negocio rechazan solicitudes no autenticadas.
- Cliente no modifica catálogo ni consulta recursos internos.
- Cajero alcanza validaciones POS y no administración.
- Almacén alcanza ajuste y no administración.
- Gerencia hereda permisos administrativos previstos.
- Checkout normaliza artículos duplicados y rechaza cantidades inválidas.
- El servidor calcula envío y limita descuentos.
- Zonas respetan continuidad, primer límite y adyacencias.
- Reseñas validan rating, longitud e identificadores UUID.

Durante pruebas negativas aparecen trazas de errores esperados como “Agrega al menos un producto” o “Producto inválido”. Esas trazas corresponden a casos que verifican rechazo; no incrementaron el conteo de fallas. Conviene reducir el ruido de consola en el entorno test sin ocultar errores reales.

### 3.2 Integraciones omitidas

| Prueba | Condición | Variable |
|---|---|---|
| Movimiento de inventario auditable | PostgreSQL desechable inicializado | `INVENTORY_TEST_DATABASE_URL` o URL POS |
| Apertura, venta, stock y cierre POS | PostgreSQL desechable inicializado | `POS_TEST_DATABASE_URL` |

El log informó conexión PostgreSQL al finalizar, pero las pruebas integrales permanecieron marcadas `SKIP`; una conexión general no sustituye una base aislada ni convierte esos casos en aprobados.

## 4. Resultado frontend

### 4.1 Build

La compilación terminó con código 0 en **3.858 segundos**.

| Métrica | Resultado |
|---|---:|
| Bundle inicial sin comprimir | 361.49 kB |
| Transferencia inicial estimada | 98.99 kB |
| Módulos lazy mostrados | 84 o más (salida resumida) |
| Salida | `dist/la-familia/browser` |

Advertencias:

- Fuente Source Code Pro: 27.61 kB frente a presupuesto 20 kB.
- Dependencias CommonJS/AMD provenientes de canvg/core-js/raf/rgbcolor/html2canvas.
- El build es funcional, pero esas advertencias pueden afectar optimización.

### 4.2 Suite automatizada

`npm test -- --watch=false` construyó tres bundles de especificación:

- `app.component.spec.ts`
- `app.spec.ts`
- `features/admin/expirations/expirations.spec.ts`

Vitest 4.1.6 terminó con código 1 y **No test files found**, aun cuando los include muestran esas rutas. La suite no produce tests aprobados; debe corregirse integración Angular/Vitest o formato/registro de especificaciones.

## 5. Recorrido funcional previo

El 15 de julio de 2026 se levantó frontend, backend y PostgreSQL con datos de demostración y se recorrieron los cinco roles.

### 5.1 Autenticación y cliente

- Login de cliente, cajero, almacén y admin.
- Recuperación de contraseña visible.
- Catálogo, detalle, carrito y primer paso de checkout.
- Pedidos y perfil.

### 5.2 Punto de venta

- Apertura con fondo.
- Ticket de dos productos.
- Cobro en efectivo por $82.00.
- Cálculo de cambio.
- Confirmación y descuento de stock.
- Consulta de corte y efectivo esperado.

![Cobro en efectivo ejecutado durante el recorrido.](capturas/23_cajero_cobro.png)

### 5.3 Inventario

- Consulta de existencias.
- Entrada manual de 10 piezas.
- Motivo y nota.
- Movimiento con responsable, cantidad anterior/nueva y fecha.

![Movimiento de inventario auditable.](capturas/32_almacen_movimientos.png)

### 5.4 Administración

- Dashboard.
- Productos, pedidos y usuarios.
- Abastecimiento, caducidades y promociones.
- Finanzas y configuración con mapa.

> El recorrido cubre flujos felices locales. No sustituye automatización integral, pruebas de carga, seguridad, accesibilidad ni integraciones externas finales.

## 6. Incidencias detectadas

| ID | Prioridad | Incidencia | Impacto | Estado |
|---|---|---|---|---|
| INC-01 | Alta | Frontend no ejecuta tests | Regresiones de UI/guards no detectadas automáticamente | Abierta |
| INC-02 | Alta | POS e inventario automáticos omitidos | Riesgo transaccional no cubierto en CI | Abierta |
| INC-03 | Alta | Restauración no probada | Respaldo podría no ser recuperable | Abierta |
| INC-04 | Media | Ventas nocturnas pueden aparecer en día UTC siguiente | Consulta/corte diario confuso en zona centro de México | Abierta |
| INC-05 | Media | Fuente excede presupuesto | Incremento de CSS/tiempo de carga | Abierta |
| INC-06 | Media | Dependencias CommonJS | Menor optimización | Abierta |
| INC-07 | Media | Varias bibliotecas/proveedores de correo | Configuración y mantenimiento ambiguos | Abierta |
| INC-08 | Media | Nombres Maday/La Familia/Retama mezclados | Confusión comercial y documental | Abierta |
| INC-09 | Media | Icono PWA aún es marcador Angular | Marca no lista para publicación | Abierta |
| INC-10 | Baja | Tests negativos imprimen stack traces | Ruido en logs de CI | Abierta |

## 7. Correcciones realizadas

| Hallazgo | Commit | Corrección observable | Verificación |
|---|---|---|---|
| OTP generado del lado cliente | `c71594e` | Backend controla el código | Revisión de cambio y flujo |
| Registro con validación insuficiente | `73f0610` | Validaciones en formulario | Recorrido/UI |
| Fechas de promociones | `e1b7558` | Formato legible | Captura/módulo |
| Acciones de perfil desalineadas | `3b4ce80` | Botones centrados | UI |
| Riesgo de totales manipulados | `9c74895`, `93a6742` | Checkout valida/recalcula servidor | Test unitario/servicio |
| Ajustes de inventario tras merge | `b22d115` | Trazabilidad preservada | Recorrido |
| Interfaz en escritorio | `d4aafe2`, `5a43090`, `0b843b8` | Vistas y tarjetas responsivas | Capturas 1280 × 800 |

No se marca una incidencia como cerrada solo porque existe un commit: el criterio de cierre exige una prueba reproducible en la revisión final.

## 8. Matriz de cobertura

| Área | Automatizada | Manual | Integración externa final | Evaluación |
|---|---|---|---|---|
| Autenticación/RBAC backend | Sí | Sí | Google pendiente final | Satisfactoria parcial |
| Checkout/envío | Sí en reglas | Parcial | PayPal sandbox pendiente | Satisfactoria parcial |
| POS | Permisos/reglas | Flujo feliz | Terminal externa no aplica al sistema | Pendiente automática |
| Inventario | Permisos/reglas | Flujo feliz | No | Pendiente automática |
| Frontend | No ejecutable | Cinco roles | No | Brecha alta |
| Correo | No | Pantalla | Proveedor final pendiente | Pendiente |
| Cloudinary | No | UI visible | Credenciales finales pendientes | Pendiente |
| Respaldo/restauración | No | No | Proveedor/base final | Pendiente alta |
| Seguridad | RBAC parcial | Flujo | Sin auditoría formal | No certificada |
| Accesibilidad | No | Revisión básica | No | Pendiente |

## 9. Pruebas pendientes

### 9.1 Antes de aceptación final

- [ ] Crear dos bases PostgreSQL desechables desde `init.sql`.
- [ ] Ejecutar POS e inventario sin `SKIP`.
- [ ] Corregir Vitest y obtener tests frontend reales.
- [ ] Probar Google, correo, Cloudinary y PayPal sandbox.
- [ ] Crear y restaurar un respaldo en base aislada.
- [ ] Repetir recorrido en entorno definitivo.
- [ ] Verificar zona horaria de ventas nocturnas.
- [ ] Ejecutar revisión de seguridad y accesibilidad proporcional al riesgo.

### 9.2 Datos mínimos a conservar por prueba

| Dato | Ejemplo |
|---|---|
| Fecha/hora y responsable | 16-jul-2026 14:00 / equipo |
| Commit | Hash corto y rama |
| Entorno | Local / staging / producción |
| Entrada | Rol, datos y precondición |
| Resultado esperado/real | Texto concreto |
| Evidencia | Log, captura, folio o reporte |
| Incidencia | ID y prioridad |

## 10. Criterio de salida

La revisión puede usarse para **presentación y aceptación condicionada**:

1. El frontend compila.
2. Las 19 pruebas backend ejecutadas no fallan.
3. Los cinco roles cuentan con evidencia visual.
4. POS e inventario completaron flujos felices locales.
5. Las brechas se documentan y tienen acciones concretas.

No se recomienda aceptación final sin reservas mientras:

- La suite frontend no ejecute.
- POS/inventario integrales estén omitidos.
- Respaldo/restauración no tenga evidencia.
- Integraciones definitivas no hayan pasado sandbox.
- La incidencia de fecha UTC no se corrija o acepte expresamente.

## 11. Registro de ejecución

| Fecha | Revisión | Evidencia | Resultado |
|---|---|---|---|
| 16-jul-2026 | `123372c` | Backend `npm test` | 19 pass, 0 fail, 2 skip, 10.411 s |
| 16-jul-2026 | `123372c` | Frontend `npm run build` | Aprobado con advertencias, 3.858 s |
| 16-jul-2026 | `123372c` | Frontend `npm test -- --watch=false` | No test files found, código 1 |
| 15-jul-2026 | Revisión previa | 25 capturas, cinco roles | Recorrido completado |

> Este reporte describe evidencia, no una certificación. No acredita rendimiento a escala, cumplimiento legal, seguridad integral ni disponibilidad de terceros.
