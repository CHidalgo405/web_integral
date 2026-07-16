# Índice maestro y mapa de la entrega
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Versión documental:** 2.0
**Fecha de preparación:** 16 de julio de 2026
**Repositorio remoto:** https://github.com/CHidalgo405/web_integral
**Rama oficial:** main
**Revisión base anterior a este índice:** 53b2123
**Estado:** Paquete documental completo para revisión; salida productiva condicionada

> Este es el único PDF índice del paquete. Permite localizar el código, los documentos, las fuentes editables, las evidencias y los formatos de presentación. La existencia de un archivo no equivale a aceptación final ni sustituye las pruebas pendientes.

<!-- PAGEBREAK -->

## 1. Cómo usar este mapa

Tiendita Maday reúne compra en línea, punto de venta, inventario, administración y control operativo para La Familia. Este índice organiza la entrega por finalidad y señala qué documento responde a cada requisito solicitado.

Para una revisión rápida:

1. Compruebe el repositorio y los 14 entregables numerados de la sección 4.
2. Use la matriz de cobertura de la sección 5 para localizar cada requisito.
3. Siga la ruta de lectura adecuada de la sección 6.
4. Revise las brechas abiertas de la sección 8 antes de autorizar producción.
5. Complete el checklist de evaluación y el acta durante la demostración.

### 1.1 Convenciones

- **Presente:** el archivo fue localizado en el repositorio en la fecha de preparación.
- **Verificado:** el contenido o la evidencia fue revisado y se indica su revisión de origen.
- **Por completar:** requiere datos, decisión, firma, acceso externo o ejecución en el ambiente definitivo.
- **Referencia histórica:** ayuda a entender el proceso, pero no gobierna la versión actual.

> Si un nombre, una cifra o un rol difiere de material histórico, prevalecen el código de la rama `main`, las migraciones actuales y los entregables 00-13.

## 2. Resumen ejecutivo del estado

| Dimensión | Estado al corte | Evidencia principal |
|---|---|---|
| Código fuente | Presente en frontend, backend y base de datos | Repositorio `web_integral`, rama `main` |
| Aplicación | Funcional y demostrable con cinco roles | Manual 01, evidencias 09 y guion 11 |
| Backend | 19 pruebas aprobadas, 0 fallidas | Reporte 03 |
| Integraciones backend | 2 pruebas omitidas por falta de base aislada | Reporte 03 y acta 04 |
| Frontend | Compilación aprobada en 3.858 segundos | Reporte 03 |
| Pruebas frontend | Vitest no encontró pruebas ejecutables | Reporte 03 |
| Evidencia manual | Cinco roles y 25 capturas | Reporte 03 y evidencias 09 |
| Respaldo y restauración | Procedimiento documentado; restauración sin evidencia | Guía 02, reporte 03 y acta 04 |
| Documentación | Entregables 00-13 presentes | Carpeta `Entregables` |
| Aceptación | Requiere decisión, reservas y firmas | Checklist 12 y acta 04 |

### 2.1 Conclusión del paquete

El sistema cuenta con código funcional, arquitectura, manuales, evidencia Git, pruebas y material de presentación suficientes para una demostración y una decisión informada. La autorización productiva debe condicionarse al cierre o aceptación expresa de las brechas registradas en la sección 8.

## 3. Mapa del repositorio

Todos los caminos siguientes son relativos a la raíz del repositorio remoto.

| Ubicación | Contenido y uso |
|---|---|
| `mi cliente (la familia)/Arquitectura/FrontEnd` | Aplicación Angular, PWA, vistas por rol, configuración y construcción frontend |
| `mi cliente (la familia)/Arquitectura/Backend` | API Express, rutas, servicios, seguridad, migrador y pruebas backend |
| `mi cliente (la familia)/Arquitectura/Database` | Esquema, inicialización, migraciones y documentación de PostgreSQL |
| `mi cliente (la familia)/Entregables` | PDFs finales, presentación ejecutiva y este índice |
| `mi cliente (la familia)/Entregables/Fuentes` | Markdown editable, generador de PDFs y generador de presentación |
| `mi cliente (la familia)/Entregables/Fuentes/capturas` | Evidencia visual usada en manuales, pruebas y diapositivas |
| `mi cliente (la familia)/Metodologia` | Material histórico del proceso de trabajo |

### 3.1 Archivos técnicos canónicos

- `mi cliente (la familia)/Arquitectura/Database/schema.mmd`: modelo relacional documentado.
- `mi cliente (la familia)/Arquitectura/Database/init.sql`: inicialización de base de datos.
- `mi cliente (la familia)/Arquitectura/Database/migrations`: cambios reproducibles de esquema.
- `/api-docs`: contrato OpenAPI cuando el backend está configurado y en ejecución.
- Archivos `package.json`: versiones, dependencias y comandos de cada aplicación.

### 3.2 Qué no usar como única fuente

La carpeta `Metodologia` conserva evidencia histórica, pero puede mencionar Angular 17, nombres de marca anteriores o roles que ya cambiaron. No debe sustituir el manual técnico, la arquitectura actual, el código ni las migraciones.

## 4. Inventario definitivo de entregables

Los 14 elementos numerados deben permanecer juntos. Los nombres son estables para facilitar su revisión.

| ID | Archivo | Finalidad | Formato |
|---|---|---|---|
| 00 | `00_LEEME_PRIMERO.pdf` | Índice maestro, cobertura y orden de revisión | PDF |
| 01 | `01_Manual_de_Usuario.pdf` | Procesos, reportes, seguridad, usuarios y funciones por rol | PDF |
| 02 | `02_Guia_de_Operacion_Respaldo_y_Recuperacion.pdf` | Operación, continuidad, respaldo, restauración e incidentes | PDF |
| 03 | `03_Reporte_de_Pruebas_y_Limitaciones.pdf` | Casos, resultados, incidencias, correcciones y brechas | PDF |
| 04 | `04_Acta_de_Entrega_y_Aceptacion.pdf` | Recepción, transferencia, reservas, decisión y firmas | PDF |
| 05 | `05_Documento_General_del_Proyecto.pdf` | Problema, objetivos, alcance y requerimientos | PDF |
| 06 | `06_Arquitectura_del_Sistema.pdf` | Diagrama, componentes, servicios, API y flujo | PDF |
| 07 | `07_Diseno_de_Interfaces_e_Identidad_Visual.pdf` | Wireframes, mockups, prototipos, marca y responsive | PDF |
| 08 | `08_Documento_de_Implementacion.pdf` | Frameworks, lenguajes, librerías, BD y servicios | PDF |
| 09 | `09_Evidencias_de_Desarrollo_y_Participacion.pdf` | Capturas, Git, ramas y participación normalizada | PDF |
| 10 | `10_Manual_Tecnico_de_Instalacion_y_Configuracion.pdf` | Instalación y configuración del entorno y servidor | PDF |
| 11 | `11_Guion_de_Demostracion_Funcional.pdf` | Flujo en vivo, CRUD, reportes, validaciones y errores | PDF |
| 12 | `12_Checklist_de_Evaluacion_SHD.pdf` | Formato de evaluación del cliente | PDF |
| 13 | `13_Presentacion_Ejecutiva_Tiendita_Maday.pptx` | Evidencias técnicas, resultados y trabajo futuro | PPTX |

### 4.1 Fuentes reproducibles

Cada PDF numerado tiene una fuente Markdown con el mismo identificador en `Entregables/Fuentes`. Los PDFs se generan con `generar_entregables.py`. La presentación se genera con `generar_presentacion.mjs`. Las capturas referenciadas permanecen en `Fuentes/capturas`.

## 5. Matriz de cobertura de requisitos

### 5.1 Entregables generales

| Requisito | Evidencia o ubicación | Cobertura |
|---|---|---|
| Repositorio remoto con código funcional | GitHub, rama `main`, carpetas de Arquitectura | Presente |
| Un solo PDF de índice | Entregable 00, este documento | Presente |

### 5.2 Documentación técnica SHP

| Requisito | Documento principal | Complemento |
|---|---|---|
| Problema, objetivos, alcance y requisitos | 05 Documento General | 01 y 08 |
| Arquitectura, componentes, servicios, API y flujo | 06 Arquitectura | 08 y `/api-docs` |
| Wireframes, mockups, prototipos, identidad y responsive | 07 Diseño de Interfaces | Capturas en Fuentes |
| Framework, lenguajes, librerías, BD y APIs | 08 Implementación | 10 Manual Técnico |
| Capturas, commits, ramas y participación | 09 Evidencias | Historial Git y capturas |
| Casos, evidencia, resultados, correcciones e incidencias | 03 Pruebas | 04 Acta |
| Instalación y configuración | 10 Manual Técnico | 02 Operación |
| Procesos, reportes, seguridad, usuarios y funciones | 01 Manual de Usuario | 11 Guion |

### 5.3 Presentación ejecutiva SHD

| Requisito | Documento o material | Cobertura |
|---|---|---|
| Flujo, CRUD, reportes, validaciones y errores | 11 Guion de Demostración | Preparado para ensayo |
| Repositorio, commits, organización, BD, arquitectura, APIs | 13 Presentación Ejecutiva | Incluido en diapositivas |
| Objetivos, beneficios, mejoras, problemas, soluciones y futuro | 13 Presentación Ejecutiva | Incluido en diapositivas |
| Evaluación del cliente en 13 criterios | 12 Checklist SHD | Listo para imprimir o enviar |

### 5.4 Entrega y decisión

| Requisito de cierre | Documento | Estado esperado |
|---|---|---|
| Inventario, transferencia de cuentas y secretos | 04 Acta | Completar durante la entrega |
| Resultados de aceptación y reservas | 04 Acta y 03 Pruebas | Registrar antes de firmar |
| Calificación del cliente | 12 Checklist | Completar al finalizar la presentación |
| Firmas y copia idéntica para ambas partes | 04 Acta | Pendiente de representantes autorizados |

## 6. Rutas de lectura por audiencia

### 6.1 Cliente, propietario o gerente

1. `00` para conocer el paquete y las brechas.
2. `01` para operar la aplicación y entender los roles.
3. `03` para conocer qué fue probado y qué no.
4. `11` para seguir la demostración.
5. `12` para evaluar la presentación.
6. `04` para registrar reservas y decidir la aceptación.

### 6.2 Responsable técnico

1. `05` para requisitos y alcance.
2. `06` para arquitectura y flujo de información.
3. `08` para tecnologías e integraciones.
4. `10` para instalar y configurar.
5. `02` para operar, respaldar y recuperar.
6. `03` y `09` para validar pruebas y trazabilidad.

### 6.3 Equipo expositor

1. Ensayar el recorrido de `11` con datos de demostración.
2. Presentar `13` sin sustituir la demostración en vivo.
3. Tener abierto el repositorio, el esquema y la gráfica Git.
4. Entregar `12` al cliente y registrar sus observaciones.
5. Completar `04` sólo después de revisar casos y reservas.

## 7. Evidencia y revisiones de origen

### 7.1 Pruebas

Los resultados técnicos fueron ejecutados sobre la revisión `123372c`. Los commits posteriores de esta preparación modifican documentación y presentación, no la aplicación. Si se cambia código antes de la firma, se deben repetir las pruebas afectadas y actualizar el reporte.

### 7.2 Participación Git

La evidencia de participación usa el historial alcanzable y normaliza alias conocidos. En la revisión base de la presentación se contabilizaron 212 commits: Christian 63, Carlos 69, Kevin 38, Zahid 25, Diego 10, Daniel 7 y Adán 0 identificados.

El valor cero de Adán no demuestra ausencia de trabajo. Significa que no se localizó un nombre o correo asociable en el historial disponible. Cualquier atribución adicional debe anexar usuario, correo, tablero, pull request o evidencia externa verificable.

### 7.3 Capturas

Las capturas documentan cinco perfiles: cliente, caja, almacén, gerente y administrador. Sirven como evidencia visual de la revisión observada; no sustituyen una prueba automatizada ni prueban por sí solas el ambiente productivo.

## 8. Brechas abiertas antes de producción

| ID | Brecha conocida | Riesgo | Criterio de cierre |
|---|---|---|---|
| R-01 | Vitest no encuentra pruebas frontend ejecutables | Regresiones de interfaz sin detección automática | Suite ejecutada y reporte sin fallas críticas |
| R-02 | Dos integraciones backend de POS e inventario fueron omitidas | Diferencias transaccionales no verificadas | Pruebas sobre base aislada aprobadas |
| R-03 | Restauración de respaldo no ejecutada | Respaldo posiblemente inutilizable | Restauración validada y tiempos registrados |
| R-04 | Ambiente, proveedores, accesos y marca final por confirmar | Configuración incompleta o custodia ambigua | URLs, propietarios, secretos y marca aprobados |
| R-05 | Identidad Git de Adán no confirmada | Participación incompleta o mal atribuida | Usuario, correo o evidencia externa anexada |

Estas brechas aparecen también en el reporte 03, la presentación 13 o el acta 04. No deben ocultarse en la exposición. La decisión correcta es cerrarlas, aceptarlas como reservas con responsable y fecha, o reprogramar la firma final.

## 9. Checklist para el día de la presentación

### 9.1 Antes de iniciar

- [ ] Hacer pull de `main` y registrar la revisión usada.
- [ ] Confirmar frontend, backend, PostgreSQL y datos de demostración.
- [ ] Preparar cuentas de los cinco roles sin compartir contraseñas reales.
- [ ] Evitar pagos live, secretos productivos y datos personales.
- [ ] Abrir el repositorio, el esquema, el reporte de pruebas y las diapositivas.
- [ ] Imprimir o enviar digitalmente el checklist 12.

### 9.2 Durante la demostración

- [ ] Mostrar alta, consulta, modificación y desactivación controlada.
- [ ] Recorrer cliente, POS, inventario, administración y reportes.
- [ ] Provocar al menos una validación de campo, un rechazo de permiso y un error controlado.
- [ ] Explicar arquitectura, API, base de datos y servicios externos.
- [ ] Mostrar la evidencia Git sin atribuir trabajo no verificable.
- [ ] Registrar preguntas, incidentes y resultados de aceptación.

<!-- PAGEBREAK -->

### 9.3 Antes de firmar

- [ ] Completar revisión, URLs, ambiente y representantes en el acta 04.
- [ ] Marcar resultados de los casos mínimos.
- [ ] Copiar las brechas que sigan abiertas como reservas.
- [ ] Asignar responsable, fecha y criterio de cierre a cada reserva.
- [ ] Marcar una sola decisión de aceptación.
- [ ] Conservar una copia idéntica firmada para cada parte.

## 10. Control y mantenimiento del paquete

### 10.1 Regla de actualización

Cada cambio futuro debe indicar qué revisión de código describe. Si se modifica funcionalidad, migraciones, roles, servicios, resultados o capturas, se debe actualizar el documento afectado y regenerar su PDF. Si cambia el alcance aceptado, se emite una nueva acta o un anexo firmado.

### 10.2 Validación mínima de integridad

- [ ] Existen exactamente los entregables numerados 00-13.
- [ ] Los PDFs abren, muestran todas sus páginas y conservan encabezados y pies.
- [ ] La presentación abre y contiene 15 diapositivas.
- [ ] Las fuentes editables corresponden a los archivos finales.
- [ ] El repositorio remoto coincide con la rama y revisión registradas.
- [ ] No hay contraseñas, tokens ni secretos dentro de los documentos o Git.

### 10.3 Fuente de verdad

Para operación y aceptación prevalecen, en orden: la revisión Git registrada, las migraciones y el esquema de esa revisión, el reporte reproducible de pruebas, las reservas firmadas y los manuales finales. Las diapositivas resumen la entrega, pero no reemplazan el código, los reportes ni el acta.

> Punto de cierre: el paquete documental está completo; los campos de cliente, accesos, ambiente, resultados de aceptación y firmas se completan con las personas autorizadas. Una brecha abierta debe permanecer visible hasta que exista evidencia verificable de cierre.
