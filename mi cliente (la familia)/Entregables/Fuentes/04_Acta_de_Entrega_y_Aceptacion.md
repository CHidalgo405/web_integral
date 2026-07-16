# Acta de entrega, recepción y decisión de aceptación
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Versión del formato:** 2.0
**Fecha de preparación:** 16 de julio de 2026
**Repositorio:** https://github.com/CHidalgo405/web_integral
**Rama y revisión base verificada:** main - 123e7bd
**Estado:** Lista para completar durante la demostración y firmar

> Esta acta separa la entrega documental y funcional de la autorización para producción. No acredita aceptación mientras falten la decisión, las reservas aplicables o las firmas autorizadas. Ninguna contraseña, token o secreto debe escribirse aquí.

<!-- PAGEBREAK -->

## 1. Propósito y reglas de interpretación

El propósito de esta acta es dejar evidencia verificable de qué versión de Tiendita Maday se entrega, qué alcance se demuestra, qué documentación la acompaña, qué controles se transfieren y bajo qué condiciones el cliente decide aceptarla.

La aceptación se limita a la revisión Git, los archivos, los resultados y las reservas identificados en este documento. No incorpora compromisos verbales, funciones futuras, servicios de terceros no contratados ni configuraciones distintas al ambiente revisado.

### 1.1 Decisiones posibles

- **Aceptación final:** el alcance acordado se recibe sin reservas abiertas que impidan su uso previsto.
- **Aceptación condicionada:** el alcance se recibe con reservas escritas, responsables, fechas y criterios de cierre.
- **No aceptación:** se documentan los incumplimientos que requieren corrección y se programa una nueva revisión.

### 1.2 Evidencia que gobierna la decisión

En caso de diferencia entre una explicación verbal y la evidencia, prevalecen en este orden: la revisión Git indicada, el código y las migraciones de esa revisión, los resultados reproducibles del reporte de pruebas, las reservas firmadas y los manuales entregados.

> Recomendación de preparación: completar primero las secciones 2, 7, 9 y 13; después marcar una sola decisión en la sección 12.

## 2. Identificación de las partes

| Campo | Información por completar |
|---|---|
| Cliente / razón social | La Familia / __________________________________________ |
| Representante del cliente | __________________________________________ |
| Cargo y facultad de aceptación | __________________________________________ |
| Equipo o proveedor | Equipo Tiendita Maday / ______________________________ |
| Representante de entrega | __________________________________________ |
| Fecha y hora efectiva | ____ / ____ / ______ - ______ h |
| Lugar o medio de entrega | Presencial / Remoto / ____________________________ |
| Correo de contacto del cliente | __________________________________________ |
| Canal de soporte acordado | __________________________________________ |

## 3. Identificación exacta de la entrega

| Elemento | Valor de referencia |
|---|---|
| Repositorio remoto | https://github.com/CHidalgo405/web_integral |
| Rama preparada | main |
| Commit de documentación y presentación | 123e7bd |
| Código frontend | Arquitectura/FrontEnd |
| Código backend | Arquitectura/Backend |
| Base de datos | Arquitectura/Database |
| Documentación final | mi cliente (la familia)/Entregables |
| Esquema canónico | Arquitectura/Database/schema.mmd |
| Inicialización y migraciones | Arquitectura/Database/init.sql y migraciones |
| Contrato de API | /api-docs en el backend configurado |
| Etiqueta de liberación, si aplica | __________________________________________ |
| URL del sistema revisado | __________________________________________ |
| URL de API revisada | __________________________________________ |

La revisión técnica de pruebas se ejecutó sobre el commit `123372c`. Los commits posteriores hasta `123e7bd` corresponden a documentación y presentación y no modificaron la aplicación. Si se firma sobre otra revisión, debe anotarse aquí y repetirse la evidencia afectada.

## 4. Alcance funcional objeto de demostración

### 4.1 Incluido

- Acceso, recuperación de contraseña, sesiones y permisos por rol.
- Catálogo, categorías, productos, precios, imágenes y códigos de barras.
- Carrito, direcciones, checkout, entrega o recolección y consulta de pedidos.
- Punto de venta, apertura de caja, cobro, cambio, ventas y cierre.
- Inventario, existencias, entradas, salidas y movimientos auditables.
- Administración de usuarios, productos, pedidos y configuración operativa.
- Proveedores, órdenes de abasto, recepción, lotes y caducidades.
- Promociones, reportes, paneles, caja, finanzas y trazabilidad.
- API REST, PostgreSQL, migraciones y servicios externos configurables.

<!-- PAGEBREAK -->

### 4.2 Condicionado a configuración externa

- PayPal requiere credenciales y validación separada para sandbox o ambiente live.
- Google OAuth requiere cliente, dominios y URI de redirección autorizados.
- Cloudinary y correo requieren cuentas, cuotas, plantillas y secretos vigentes.
- Railway, PostgreSQL administrado, dominio y DNS dependen de cuentas bajo control del propietario final.

### 4.3 Fuera de alcance salvo acuerdo escrito

- Soporte permanente, monitoreo 24 por 7 y niveles de servicio no definidos en esta acta.
- Licencias, comisiones, dominios, infraestructura o consumo de terceros.
- Nuevas funciones, migración masiva de datos reales y personalizaciones posteriores.
- Aprobaciones fiscales, contables, bancarias o regulatorias del negocio.
- Garantía sobre disponibilidad o cambios realizados por proveedores externos.

## 5. Inventario documental

Marque **Recibido** sólo después de abrir el archivo y comprobar que corresponde al nombre indicado.

| ID | Documento o material | Uso principal | Recibido |
|---|---|---|---|
| 00 | LEEME PRIMERO | Índice y mapa de la entrega | [ ] |
| 01 | Manual de Usuario | Procesos, roles, seguridad y operación | [ ] |
| 02 | Guía de Operación, Respaldo y Recuperación | Continuidad y restauración | [ ] |
| 03 | Reporte de Pruebas y Limitaciones | Resultados, incidencias y brechas | [ ] |
| 04 | Acta de Entrega, Recepción y Aceptación | Este documento | [ ] |
| 05 | Documento General del Proyecto | Problema, objetivos, alcance y requisitos | [ ] |
| 06 | Arquitectura del Sistema | Componentes, servicios, API y flujos | [ ] |
| 07 | Diseño de Interfaces e Identidad Visual | Wireframes, mockups, marca y responsive | [ ] |
| 08 | Documento de Implementación | Tecnologías, librerías, BD e integraciones | [ ] |
| 09 | Evidencias de Desarrollo y Participación | Capturas, Git, ramas y autoría | [ ] |
| 10 | Manual Técnico | Instalación y configuración paso a paso | [ ] |
| 11 | Guion de Demostración Funcional | CRUD, reportes, validaciones y errores | [ ] |
| 12 | Checklist de Evaluación SHD | Formato para evaluación del cliente | [ ] |
| 13 | Presentación Ejecutiva Tiendita Maday | Evidencias, arquitectura y resultados | [ ] |

<!-- PAGEBREAK -->

### 5.1 Material técnico adicional

- [ ] Código fuente frontend, backend y scripts de base de datos.
- [ ] Migraciones, esquema `schema.mmd` e inicialización `init.sql`.
- [ ] Contrato OpenAPI accesible en `/api-docs` con el backend configurado.
- [ ] Fuentes editables y generadores de los entregables.
- [ ] Historial Git, ramas alcanzables y revisión identificada.
- [ ] Evidencia visual usada en manuales, pruebas y presentación.

## 6. Transferencia de control y custodia

Completar esta sección sin escribir claves. La verificación puede consistir en inicio de sesión, cambio de propietario, invitación aceptada o evidencia equivalente.

| Servicio o activo | Propietario final | Verificado | Evidencia u observación |
|---|---|---|---|
| Repositorio GitHub | __________________ | [ ] | __________________________ |
| Railway o alojamiento | __________________ | [ ] | __________________________ |
| PostgreSQL administrado | __________________ | [ ] | __________________________ |
| Dominio y DNS | __________________ | [ ] | __________________________ |
| PayPal | __________________ | [ ] | Sandbox / Live: ___________ |
| Google OAuth | __________________ | [ ] | __________________________ |
| Cloudinary | __________________ | [ ] | __________________________ |
| Servicio de correo | __________________ | [ ] | __________________________ |
| Respaldo cifrado | __________________ | [ ] | Fecha: ___________________ |
| Canal de soporte | __________________ | [ ] | __________________________ |

### 6.1 Control de secretos

- [ ] Las credenciales se transfirieron por un canal distinto de Git y de esta acta.
- [ ] El cliente puede revocar o rotar cada secreto bajo su responsabilidad.
- [ ] Los secretos temporales, compartidos o de demostración fueron rotados.
- [ ] Los archivos de ambiente productivo no quedaron incluidos en el repositorio.
- [ ] Se registró quién conserva acceso administrativo después de la entrega.

Método de transferencia utilizado: ________________________________________________

Personas con acceso que deben conservarse: ________________________________________

Accesos que deben revocarse: ______________________________________________________

<!-- PAGEBREAK -->

## 7. Protocolo de aceptación funcional

### 7.1 Condiciones previas

- Usar datos y credenciales de demostración, no información sensible ni pagos reales.
- Registrar la URL, la revisión y el ambiente realmente utilizados.
- Preparar usuarios para cliente, caja, almacén, gerente y administrador.
- Conservar evidencia de cada resultado fallido o condicionado.
- No alterar datos productivos ni ejecutar restauraciones sin autorización del propietario.

### 7.2 Casos mínimos

| Caso | Resultado | Evidencia u observación |
|---|---|---|
| Inicio de sesión y rechazo de credenciales inválidas | Aprobado / Pendiente / No aplica | __________________ |
| Alta, consulta, edición y desactivación de usuario o producto | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con recolección | Aprobado / Pendiente / No aplica | __________________ |
| Compra cliente con entrega y validación de zona | Aprobado / Pendiente / No aplica | __________________ |
| Apertura de caja y venta en efectivo con cambio | Aprobado / Pendiente / No aplica | __________________ |
| Venta con tarjeta o PayPal en sandbox | Aprobado / Pendiente / No aplica | __________________ |
| Entrada o salida de inventario con auditoría | Aprobado / Pendiente / No aplica | __________________ |
| Consulta de pedido, reporte y corte | Aprobado / Pendiente / No aplica | __________________ |
| Validación de campos, permisos y manejo de error | Aprobado / Pendiente / No aplica | __________________ |
| Recuperación de contraseña y correo | Aprobado / Pendiente / No aplica | __________________ |
| Carga y consulta de imagen de producto | Aprobado / Pendiente / No aplica | __________________ |
| Respaldo y restauración sobre ambiente aislado | Aprobado / Pendiente / No aplica | __________________ |

Incidentes detectados durante la aceptación:

________________________________________________________________________________

________________________________________________________________________________

<!-- PAGEBREAK -->

## 8. Resultados técnicos disponibles

### 8.1 Evidencia automatizada y manual

- Backend: 19 pruebas aprobadas, 0 fallidas y 2 integraciones omitidas.
- Frontend: compilación aprobada en 3.858 segundos, con advertencias documentadas.
- Frontend: Vitest no encontró pruebas ejecutables; por tanto, no existe una suite frontend aprobada.
- Evidencia manual: cinco roles revisados y 25 capturas conservadas en el reporte de pruebas.
- Restauración: procedimiento documentado, pero ejecución aislada aún sin evidencia.

Los resultados completos, comandos, limitaciones e incidencias se encuentran en `03_Reporte_de_Pruebas_y_Limitaciones.pdf`. Una compilación exitosa no sustituye las pruebas funcionales ni autoriza por sí sola el uso productivo.

### 8.2 Resultado recomendado al preparar esta acta

> El sistema es demostrable y cuenta con código, documentación y evidencia suficiente para una decisión informada. Mientras sigan abiertas la suite frontend, las dos integraciones omitidas, la restauración aislada y la transferencia del ambiente definitivo, la opción prudente es aceptación condicionada o reprogramación de la firma final.

## 9. Reservas y plan de cierre

Las primeras cuatro reservas reflejan brechas conocidas. No deben eliminarse sin anexar evidencia de cierre. Complete responsable y fecha antes de elegir aceptación condicionada.

| ID | Reserva | Prioridad | Responsable y fecha | Criterio verificable de cierre |
|---|---|---|---|---|
| R-01 | Vitest no encuentra pruebas frontend ejecutables | Alta | __________ / __________ | Suite frontend ejecutada, sin fallas críticas y con reporte conservado |
| R-02 | Dos integraciones backend de POS e inventario fueron omitidas | Alta | __________ / __________ | Pruebas ejecutadas sobre base aislada y aprobadas |
| R-03 | Restauración de respaldo no ejecutada en ambiente aislado | Alta | __________ / __________ | Respaldo restaurado, aplicación validada y tiempos registrados |
| R-04 | Ambiente, proveedores, accesos y marca final pendientes de confirmación | Media | __________ / __________ | URLs, propietarios, secretos rotados y configuración final verificados |
| R-05 | __________________________________________ | Alta/Media/Baja | __________ / __________ | __________________________________________ |
| R-06 | __________________________________________ | Alta/Media/Baja | __________ / __________ | __________________________________________ |

### 9.1 Seguimiento

Frecuencia de revisión: ___________________________________________________________

Responsable de consolidar evidencias: _____________________________________________

Lugar donde se anexarán las evidencias: ___________________________________________

Regla de escalamiento si vence una fecha: _________________________________________

## 10. Seguridad, datos y continuidad

- El cliente confirma que conoce los roles y privilegios administrativos.
- Los datos reales sólo deben cargarse después de validar respaldo, restauración y acceso.
- Los pagos live requieren revisión separada de credenciales, webhooks y conciliación.
- Los registros, cortes y movimientos deben conservarse conforme a la política del negocio.
- Los incidentes de acceso, pérdida de datos o indisponibilidad deben registrarse con fecha, impacto y acción tomada.

### 10.1 Respaldo inicial

| Control | Registro |
|---|---|
| Fecha y hora del respaldo | __________________________________________ |
| Ambiente y base de origen | __________________________________________ |
| Responsable | __________________________________________ |
| Ubicación cifrada | __________________________________________ |
| Suma de verificación, si aplica | __________________________________________ |
| Fecha de prueba de restauración | __________________________________________ |
| Resultado de restauración | Aprobado / Pendiente / No aplica |

> No marque como completada la continuidad operativa si sólo existe un archivo de respaldo que nunca se ha restaurado y validado.

## 11. Soporte, garantía y costos

| Condición | Acuerdo escrito |
|---|---|
| Inicio de garantía | ____ / ____ / ______ |
| Duración o fecha de fin | __________________________________________ |
| Horario y días de atención | __________________________________________ |
| Correo o teléfono | __________________________________________ |
| Tiempo objetivo para incidente crítico | __________________________________________ |
| Correcciones incluidas | __________________________________________ |
| Exclusiones de garantía | __________________________________________ |
| Tarifa o proceso para mejoras | __________________________________________ |
| Responsable de renovaciones de terceros | __________________________________________ |
| Propietario de datos y respaldos | __________________________________________ |

Salvo acuerdo escrito distinto, la garantía cubre defectos reproducibles del alcance entregado. No cubre nuevas funciones, captura incorrecta de datos, pérdida de credenciales, modificaciones ajenas, indisponibilidad de terceros ni costos de infraestructura o transacción.

## 12. Declaración de decisión

Marque una sola opción. Si se marca aceptación condicionada, las reservas abiertas deben tener responsable y fecha. Si se marca no aceptación, indique los casos que deben repetirse.

- [ ] **Aceptación final.** El cliente recibe la revisión indicada sin reservas abiertas que impidan el uso acordado.
- [ ] **Aceptación condicionada.** El cliente recibe la revisión con las reservas y el plan de cierre de la sección 9.
- [ ] **No aceptación.** La entrega requiere correcciones y una nueva sesión de aceptación.

Motivo y alcance de la decisión:

________________________________________________________________________________

________________________________________________________________________________

________________________________________________________________________________

Fecha prevista de siguiente revisión, si aplica: ____ / ____ / ______

## 13. Firmas

Las firmas confirman que la decisión y las reservas fueron leídas. No implican que una condición pendiente se considere aprobada.

| Por el cliente | Por el equipo o proveedor |
|---|---|
| Nombre: ______________________________ | Nombre: ______________________________ |
| Cargo: _______________________________ | Cargo: _______________________________ |
| Firma: _______________________________ | Firma: _______________________________ |
| Fecha y hora: _________________________ | Fecha y hora: _________________________ |

Testigo o responsable adicional, si aplica:

Nombre: __________________________________ Cargo: ________________________________

Firma: ___________________________________ Fecha: _________________________________

<!-- PAGEBREAK -->

## 14. Cierre de transferencia y anexos

### 14.1 Checklist de cierre

- [ ] Las partes, revisión, URLs y ambiente están identificados.
- [ ] El cliente abrió el repositorio y los 14 entregables numerados.
- [ ] Los casos de aceptación registran resultado y evidencia.
- [ ] Las reservas abiertas tienen responsable, fecha y criterio de cierre.
- [ ] Las cuentas y servicios están bajo el propietario acordado.
- [ ] Los secretos temporales fueron rotados o revocados.
- [ ] Existe un respaldo reciente bajo control del cliente.
- [ ] La restauración se ejecutó o quedó expresamente como reserva.
- [ ] Se explicó el canal de soporte y el proceso de incidente.
- [ ] La decisión marcada coincide con las reservas registradas.
- [ ] Ambas partes conservan una copia idéntica del acta firmada.

### 14.2 Anexos que forman parte de la decisión

- [ ] Reporte final de pruebas y limitaciones.
- [ ] Lista de reservas con responsables y fechas.
- [ ] Evidencia de restauración, si fue ejecutada.
- [ ] Evidencia de pagos sandbox o live, según corresponda.
- [ ] Evidencia de transferencia de cuentas sin exponer secretos.
- [ ] Checklist de evaluación SHD completado por el cliente.
- [ ] Minuta de preguntas, respuestas y acuerdos de la demostración.

Observaciones finales:

________________________________________________________________________________

________________________________________________________________________________

> Cada parte debe conservar una copia firmada. Si cambia la revisión Git, el ambiente o una reserva crítica, anexe una hoja de control de cambios o emita una nueva versión del acta.
