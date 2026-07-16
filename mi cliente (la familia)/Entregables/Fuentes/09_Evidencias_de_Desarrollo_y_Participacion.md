# Evidencias de desarrollo y participación
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Versión:** 2.0
**Fecha de corte:** 16 de julio de 2026
**Revisión de evidencia:** `0f2352f` en `main`

> Evidencia reproducible del historial Git, ramas, hitos y participación identificable. Los alias se normalizan por nombre y correo; no se atribuye trabajo cuando la identidad no puede comprobarse.

<!-- PAGEBREAK -->

## 1. Identificación del repositorio

| Campo | Valor |
|---|---|
| Remoto | `https://github.com/CHidalgo405/web_integral.git` |
| Rama principal | `main` |
| Revisión analizada | `0f2352f` |
| Fecha del último commit de la revisión | 16 de julio de 2026 |
| Commits alcanzables en todas las referencias | 205 |
| Método base | Historial completo de autor y correo mediante `git log --all`. |

La evidencia se obtuvo del clon local después de sincronizar `origin/main`. Incluye commits alcanzables desde las referencias locales/remotas disponibles en el momento del corte.

## 2. Criterio de normalización

Una misma persona puede aparecer con varios nombres o correos. Para evitar duplicados se agruparon identidades claramente coincidentes:

| Persona normalizada | Identidades observadas |
|---|---|
| Carlos | `CHidalgo405` y correo de Carlos. |
| Christian | `Christba03` / `Christba` y correos asociados. |
| Kevin | `Kevin11ts` / `Kevin Sandoval` y correo institucional coincidente. |
| Zahid | `Zahid-Monraga-Contreras` y variación de mayúsculas del correo. |
| Diego | `DIEGO` / `diego` y correos asociados. |
| Daniel | `MrSoniStar` / `DanielTIDSMC` y correos asociados. |
| Adán | No se localizó nombre, correo o alias que contenga Adán/Adan. |

<!-- DIAGRAM:GIT_CHART -->

## 3. Resultado por integrante

| Persona | Commits | Porcentaje aproximado | Estado de atribución |
|---|---:|---:|---|
| Christian | 63 | 30.7 % | Identidad Git localizada. |
| Carlos | 62 | 30.2 % | Identidad Git localizada. |
| Kevin | 38 | 18.5 % | Dos alias unidos por correo coincidente. |
| Zahid | 25 | 12.2 % | Identidad Git localizada. |
| Diego | 10 | 4.9 % | Dos formas del nombre normalizadas. |
| Daniel | 7 | 3.4 % | Dos alias normalizados. |
| Adán | 0 identificables | 0 % verificable | Requiere usuario/correo o evidencia alternativa. |

Los porcentajes describen cantidad de commits, no tamaño, complejidad ni calidad. Un merge, un commit documental y una función completa cuentan una unidad.

## 4. Evidencia solicitada: Carlos, Kevin y Adán

### 4.1 Carlos

La identidad `CHidalgo405` registra 62 commits alcanzables al corte. Los mensajes y cambios asociados muestran trabajo en:

- Roles y permisos unificados para administración/gerencia.
- Punto de venta seguro, caja y pruebas del ciclo POS.
- Ajustes auditables de inventario.
- Integridad de checkout, totales autoritativos y envío.
- Experiencia de reseñas y validación de compra.
- Adaptación de cliente/checkout a escritorio y tokens visuales.
- Catálogo inicial, normalización de imágenes y despliegue.
- Actualización del expediente documental actual.

| Ejemplo | Evidencia |
|---|---|
| `c898c47` | Pruebas del ciclo de cajero. |
| `2f68b6d` | Ajustes auditables de inventario. |
| `9c74895` / `93a6742` | Validación y totales de checkout en servidor. |
| `b7b1af9` / `be5a84b` | API y experiencia de reseñas. |
| `788b6f2` | Centralización de tokens visuales. |
| `0f2352f` | Evidencia Git reproducible. |

### 4.2 Kevin

Kevin aparece como `Kevin11ts` y `Kevin Sandoval`; ambos alias comparten el correo institucional `20233l001135@utcv.edu.mx`. Juntos suman 38 commits.

Sus cambios identificables incluyen:

- Rutas, controlador, modelo de sesiones y middleware de autenticación.
- Interceptor y servicio de autenticación en frontend.
- Conexión de registro e inicio de sesión.
- Validaciones y tratamiento de datos de perfil.
- Configuración CORS para varios orígenes.
- Documentación Swagger y RBAC.
- Integración de Cloudinary, Multer, columnas de imagen y UI de previsualización.

| Ejemplo | Evidencia |
|---|---|
| `5b0f820` | Rutas de autenticación backend. |
| `31cb512` | Middleware de protección. |
| `66dc245` / `c6bbbd4` | Login y registro conectados. |
| `76c99a8` | Orígenes CORS configurables. |
| `607f7ca` | RBAC y errores en Swagger. |
| `3768452` / `c6af875` / `61482be` | Integración de imágenes Cloudinary de extremo a extremo. |

### 4.3 Adán

No se encontró una identidad Git que pueda asociarse responsablemente a Adán. El resultado **no demuestra ausencia de trabajo**; demuestra ausencia de trazabilidad con los datos disponibles.

Para cerrar la evidencia debe proporcionarse al menos uno:

- Usuario de GitHub o nombre/correo utilizado al hacer commits.
- Rama o pull request donde aparezca como autor/revisor.
- Tablero de tareas con asignaciones y enlaces a commits.
- Registro de pair programming firmado por participantes.
- Evidencia de pruebas, diseño o documentación con fecha y aprobación.
- Explicación documentada si sus commits quedaron bajo una cuenta compartida.

> No se debe reasignar un commit ajeno a Adán solo para completar una métrica. La corrección válida es relacionar una identidad verificable o anexar evidencia alternativa.

## 5. Participación adicional localizada

| Persona | Ejemplos de contribución observada |
|---|---|
| Christian | API/OpenAPI, operaciones administrativas, entrega/mapas, caducidades, documentación y merges. |
| Zahid | Recuperación/verificación de correo, validación de registro, promociones y flujo de abasto. |
| Diego | Validaciones de correo, contraseña, teléfono y categorías; ajustes de interfaz. |
| Daniel | Notas y ejemplos para ejecución local y README. |

Esta tabla resume temas visibles en mensajes; para evaluación individual deben abrirse los diffs de los commits relevantes.

## 6. Historial de hitos

| Fecha | Commit | Hito observable |
|---|---|---|
| 07-jul-2026 | `40cf223` | Documentación inicial Swagger. |
| 09-jul-2026 | `66dc245` / `c6bbbd4` | Login y registro conectados al backend. |
| 10-jul-2026 | `3fd33d7` / `c5cb345` | Flujo seguro de caja y espacio del cajero. |
| 10-jul-2026 | `6dccdb7` | Flujo de ventas, envío, PayPal, métricas y recibos. |
| 13-jul-2026 | `2f68b6d` / `f837f4b` | Inventario auditable e interfaz de almacén. |
| 14-jul-2026 | `f8215db` / `3291584` | Operaciones administrativas y cobertura de entrega. |
| 14-jul-2026 | `c6af875` / `61482be` | Imágenes dinámicas con Cloudinary. |
| 14-jul-2026 | `c71594e` | Corrección de OTP generado en backend. |
| 15-jul-2026 | `948ffd0` | Integración del paquete documental previo a `main`. |
| 16-jul-2026 | `0f2352f` | Documentación técnica ampliada y evidencia reproducible. |

## 7. Ramas observadas

| Referencia | Punta al corte | Última fecha | Propósito inferido por nombre |
|---|---|---|---|
| `main` / `origin/main` | `0f2352f` | 16-jul-2026 | Integración principal. |
| `origin/feature/cambios-zahid` | `948ffd0` | 15-jul-2026 | Cambios de Zahid, ya alineada con revisión previa. |
| `origin/documentacion` | `3e22b21` | 15-jul-2026 | Fuentes y PDFs anteriores. |
| `origin/docs/entregables-cliente` | `e2cc787` | 14-jul-2026 | Primer paquete cliente. |
| `origin/feature/cloudinary` | `61482be` | 14-jul-2026 | Imágenes de productos. |
| `origin/feature/swagger-actualizado` | `607f7ca` | 14-jul-2026 | Actualización Swagger. |
| `origin/frontend-local-commits` | `d6e7c55` | 14-jul-2026 | Notas/cambios locales de frontend. |
| `origin/feature/register-login` | `76c99a8` | 09-jul-2026 | Registro/login. |
| `origin/fix-compose-build` | `7221a93` | 29-jun-2026 | Construcción Compose. |

Las ramas remotas conservadas sirven como evidencia histórica, pero no todas deben permanecer activas. Tras confirmar que sus commits están integrados, conviene proteger `main`, etiquetar la entrega y archivar ramas cerradas.

## 8. Evidencia del sistema funcionando

El recorrido local del 15 de julio produjo 25 capturas en `Entregables/Fuentes/capturas/`. Cubren autenticación, cliente, cajero, inventario y administración.

![Cobro en efectivo durante el recorrido del punto de venta.](capturas/23_cajero_cobro.png)

![Movimiento de inventario con responsable, cantidades, motivo, nota y fecha.](capturas/32_almacen_movimientos.png)

![Panel administrativo de la versión documentada.](capturas/40_admin_dashboard.png)

## 9. Evidencia de correcciones

| Hallazgo o necesidad | Commit de corrección/mejora | Resultado observable |
|---|---|---|
| OTP dependía de código del cliente | `c71594e` | Código generado/controlado por backend. |
| Registro requería validaciones adicionales | `73f0610` | Validación de campos de alta. |
| Fechas de promoción poco legibles | `e1b7558` | Presentación de fecha mejorada. |
| Acciones de edición de perfil desalineadas | `3b4ce80` | Botones centrados. |
| Ajustes de inventario debían conservar auditoría | `b22d115` | Flujo auditable preservado tras merge. |
| Checkout podía confiar en totales de cliente | `9c74895` / `93a6742` | Validación y cálculo autoritativo en servidor. |

## 10. Método recomendado de evaluación individual

1. Confirmar alias y correos de cada integrante.
2. Elegir de tres a cinco commits funcionales por persona.
3. Abrir el diff y verificar autor, fecha, archivos y alcance.
4. Relacionar el cambio con un requerimiento o incidencia.
5. Registrar prueba o captura del resultado.
6. Considerar revisiones, pruebas, diseño y documentación además de código.
7. Pedir explicación técnica del aporte durante la presentación.

### 10.1 Plantilla de trazabilidad

| Integrante | Tarea | Commit/PR | Archivos | Prueba | Aprobó |
|---|---|---|---|---|---|
| __________ | __________ | __________ | __________ | __________ | __________ |
| __________ | __________ | __________ | __________ | __________ | __________ |
| __________ | __________ | __________ | __________ | __________ | __________ |

## 11. Limitaciones de la evidencia

- Git registra autoría técnica, no horas trabajadas.
- Commits grandes y pequeños cuentan igual en la gráfica.
- Merges y documentos también son commits.
- Trabajo compartido puede quedar atribuido a una sola cuenta.
- Squash o cherry-pick puede alterar la granularidad histórica.
- Las ramas disponibles dependen de lo que el remoto conserve.
- Un mensaje describe intención, pero el diff prueba el contenido.

## 12. Cierre y acciones

- [x] Repositorio remoto y rama principal identificados.
- [x] Commits y alias normalizados con criterio explícito.
- [x] Hitos, ramas y capturas localizados.
- [x] Participación de Carlos y Kevin respaldada por commits concretos.
- [ ] Asociar identidad o evidencia alternativa de Adán.
- [ ] Completar tablero/tareas si forma parte de la rúbrica.
- [ ] Etiquetar el commit final de entrega.
- [ ] Exportar o capturar la gráfica de contribuciones de GitHub si el evaluador la exige.

> La ausencia de una identidad verificable se reporta como pendiente, no se corrige inventando autoría. Este documento debe regenerarse en el commit final para actualizar el conteo.

## 13. Validación de evidencia

| Campo | Registro |
|---|---|
| Revisión final evaluada | ______________________________________________ |
| Fecha de regeneración | ____ / ____ / ______ |
| Responsable de normalización | ______________________________________________ |
| Identidad de Adán confirmada | Sí / No / No aplica |
| Anexo de tablero o métricas | ______________________________________________ |
| Observaciones del evaluador | ______________________________________________ |

### 13.1 Firmas de revisión

| Equipo de desarrollo | Docente / evaluador |
|---|---|
| Nombre: ______________________________ | Nombre: ______________________________ |
| Firma: _______________________________ | Firma: _______________________________ |
| Fecha: ____ / ____ / ______ | Fecha: ____ / ____ / ______ |
