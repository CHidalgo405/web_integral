# Checklist de evaluación SHD
**Proyecto:** Tiendita Maday
**Cliente:** La Familia
**Versión del formato:** 2.0
**Fecha de preparación:** 16 de julio de 2026
**Aplicación:** Presentación ejecutiva y demostración funcional

> Formato para que el cliente evalúe 13 criterios en una escala de 3 (Deficiente) a 10 (Excelente). Imprimir una copia o enviar el PDF sin respuestas si la sesión es remota.

<!-- PAGEBREAK -->

## 1. Datos de la evaluación

| Campo | Información |
|---|---|
| Nombre del cliente/evaluador | ______________________________________________ |
| Organización / cargo | ______________________________________________ |
| Fecha y hora | ____ / ____ / ______  ______ : ______ |
| Modalidad | Presencial / Remota |
| Versión o commit presentado | ______________________________________________ |
| URL / entorno | ______________________________________________ |
| Integrantes presentes | ______________________________________________ |

## 2. Instrucciones

1. Observe la presentación y la demostración completa.
2. Asigne un número entero de **3 a 10** en cada criterio.
3. Escriba evidencia u observación concreta, especialmente en notas menores a 7.
4. No deje criterios vacíos; use **N/A** únicamente si ambas partes acuerdan que no aplica.
5. Sume las 13 calificaciones y calcule el promedio.
6. Registre pendientes, decisión y firma al final.

### 2.1 Escala general

| Calificación | Nivel | Descripción |
|---:|---|---|
| 3 | Deficiente | No se demostró o presentó fallas graves que impiden valorar el criterio. |
| 4 | Muy insuficiente | Evidencia mínima, incompleta o poco confiable. |
| 5 | Insuficiente | Cumple una parte, pero requiere correcciones importantes. |
| 6 | Suficiente | Cumple lo básico con pendientes visibles. |
| 7 | Bueno | Cumple de forma funcional; existen mejoras menores. |
| 8 | Muy bueno | Cumple con calidad y evidencia clara. |
| 9 | Sobresaliente | Resultado sólido, consistente y bien explicado. |
| 10 | Excelente | Cumplimiento completo, verificable y superior a lo esperado. |

## 3. Tabla de calificación

Escriba una calificación entre 3 y 10.

| Nº | Criterio | Calificación | Evidencia / observación |
|---:|---|---:|---|
| 1 | Comprensión del problema y contexto del cliente | ____ | __________________________________ |
| 2 | Correspondencia entre objetivos, alcance y solución | ____ | __________________________________ |
| 3 | Flujo funcional completo del sistema | ____ | __________________________________ |
| 4 | Operaciones CRUD: altas, consultas, cambios y eliminación/desactivación | ____ | __________________________________ |
| 5 | Reportes, métricas y utilidad de la información | ____ | __________________________________ |
| 6 | Validaciones, mensajes y manejo de errores | ____ | __________________________________ |
| 7 | Diseño visual, consistencia e identidad | ____ | __________________________________ |
| 8 | Facilidad de uso y adaptación móvil/escritorio | ____ | __________________________________ |
| 9 | Seguridad, roles, usuarios y protección de operaciones | ____ | __________________________________ |
| 10 | Arquitectura, base de datos, APIs y servicios | ____ | __________________________________ |
| 11 | Calidad técnica: pruebas, repositorio y evidencia de desarrollo | ____ | __________________________________ |
| 12 | Dominio del equipo, organización y claridad de exposición | ____ | __________________________________ |
| 13 | Respuestas a preguntas y confianza para adoptar el sistema | ____ | __________________________________ |

## 4. Guía por criterio

### 4.1 Problema y contexto

Valore si el equipo explica las necesidades reales de la tienda, los usuarios afectados y por qué una solución centralizada aporta valor. Una nota alta requiere conectar la demostración con operación, no solo enumerar tecnologías.

### 4.2 Objetivos, alcance y solución

Valore si lo mostrado corresponde a objetivos documentados, si se distinguen funciones incluidas y exclusiones, y si los pendientes no se presentan como terminados.

### 4.3 Flujo funcional completo

Valore si las transiciones entre cliente, pedido, caja, inventario y administración son coherentes; si los datos persisten y si el sistema recupera un estado entendible.

### 4.4 CRUD

Valore una entidad controlada desde alta hasta eliminación/desactivación. Deben observarse confirmaciones, validaciones y el efecto en consultas posteriores.

### 4.5 Reportes y métricas

Valore si dashboard, ventas, caja, inventario, pedidos y finanzas presentan datos útiles, con periodo/unidad comprensible y relación con operaciones reales.

### 4.6 Validaciones y errores

Valore campos requeridos, formatos, stock insuficiente, caja cerrada, permisos y fallas controladas. Una nota alta requiere que el sistema no deje escrituras parciales y explique cómo continuar.

### 4.7 Diseño visual e identidad

Valore jerarquía, consistencia de colores/tipografía/componentes y legibilidad. Considere que el logotipo/nombre comercial final puede estar registrado como pendiente del cliente.

### 4.8 Facilidad de uso y responsividad

Valore si las tareas principales se encuentran rápido, los controles son claros y la interfaz se adapta a pantalla móvil/escritorio sin perder acciones críticas.

### 4.9 Seguridad y roles

Valore cuentas individuales, menor privilegio, separación entre cliente/cajero/almacén/gerencia/admin y validación del backend. No se deben exponer contraseñas ni secretos.

### 4.10 Arquitectura, datos y APIs

Valore si el equipo explica Angular, Express, PostgreSQL, servicios externos y flujo de información, y puede mostrar OpenAPI y esquema sin confundir diagramas históricos.

### 4.11 Calidad técnica y evidencia

Valore compilación, pruebas, incidencias, correcciones, Git, ramas, commits y participación. Los tests omitidos deben informarse como pendientes, no como aprobados.

### 4.12 Dominio y exposición

Valore distribución de participación, control del tiempo, lenguaje comprensible, continuidad de la demo y capacidad de cada integrante para explicar un aporte verificable.

### 4.13 Preguntas y confianza

Valore respuestas concretas, honestidad sobre límites, manejo de escenarios no previstos y claridad sobre soporte, seguridad, respaldo y siguiente paso.

## 5. Cálculo de resultado

| Concepto | Valor |
|---|---|
| Suma de los 13 criterios | __________ / 130 |
| Número de criterios calificados | __________ |
| Promedio = suma ÷ criterios | __________ / 10 |

### 5.1 Interpretación sugerida

| Promedio | Interpretación |
|---:|---|
| 3.0 a 4.9 | Deficiente: requiere replanteamiento o correcciones críticas. |
| 5.0 a 5.9 | Insuficiente: no recomendable para aceptación sin correcciones importantes. |
| 6.0 a 6.9 | Suficiente: aceptación condicionada con pendientes de alta prioridad. |
| 7.0 a 7.9 | Bueno: funcional, con mejoras y reservas controlables. |
| 8.0 a 8.9 | Muy bueno: resultado sólido con pendientes menores. |
| 9.0 a 10.0 | Excelente: cumplimiento sobresaliente y evidencia convincente. |

El promedio orienta la conversación, pero no reemplaza los pendientes críticos. Una falla de seguridad, pérdida de datos o cobro inconsistente debe registrarse aunque la media sea alta.

## 6. Observaciones del cliente

### 6.1 Aspectos mejor logrados

________________________________________________________________________________

________________________________________________________________________________

________________________________________________________________________________

### 6.2 Aspectos que deben mejorar

________________________________________________________________________________

________________________________________________________________________________

________________________________________________________________________________

### 6.3 Preguntas o respuestas que requieren seguimiento

________________________________________________________________________________

________________________________________________________________________________

## 7. Pendientes acordados

| Nº | Pendiente | Prioridad | Responsable | Fecha compromiso | Criterio de cierre |
|---:|---|---|---|---|---|
| 1 | __________________ | Alta / Media / Baja | __________ | __________ | __________________ |
| 2 | __________________ | Alta / Media / Baja | __________ | __________ | __________________ |
| 3 | __________________ | Alta / Media / Baja | __________ | __________ | __________________ |
| 4 | __________________ | Alta / Media / Baja | __________ | __________ | __________________ |
| 5 | __________________ | Alta / Media / Baja | __________ | __________ | __________________ |

## 8. Decisión del cliente

Marque una:

- [ ] **Presentación aprobada.** La demostración y explicación cumplen lo esperado.
- [ ] **Aprobada con observaciones.** Se aceptan los resultados con los pendientes anteriores.
- [ ] **Requiere nueva demostración.** Deben corregirse puntos antes de volver a evaluar.

Esta decisión evalúa la presentación SHD. La aceptación formal del sistema debe registrarse también en el Acta de Entrega y Aceptación.

## 9. Firmas

| Cliente / evaluador | Equipo de desarrollo |
|---|---|
| Nombre: ______________________________ | Nombre: ______________________________ |
| Cargo: _______________________________ | Rol: __________________________________ |
| Firma: _______________________________ | Firma: ________________________________ |
| Fecha: ____ / ____ / ______ | Fecha: ____ / ____ / ______ |

## 10. Control de entrega del formato

- [ ] Se entregó antes de iniciar la presentación.
- [ ] El evaluador conoció la escala 3–10.
- [ ] Los 13 criterios tienen calificación o N/A acordado.
- [ ] Se calculó suma y promedio.
- [ ] Las notas menores a 7 tienen observación.
- [ ] Los pendientes tienen responsable y fecha.
- [ ] Ambas partes conservan una copia.
- [ ] Se anexará al acta o expediente final.

> No complete este formato en nombre del cliente. El equipo puede aclarar criterios y aportar evidencia, pero la calificación, observaciones y decisión pertenecen al evaluador.
