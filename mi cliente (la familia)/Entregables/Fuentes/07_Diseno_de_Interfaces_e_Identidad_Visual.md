# Diseño de interfaces e identidad visual
**Sistema:** Tiendita Maday
**Cliente:** La Familia
**Versión:** 2.0
**Fecha:** 16 de julio de 2026
**Revisión de interfaz:** `cc7fa08`

> Expediente de diseño actualizado: arquitectura de información, wireframes, referencia de mockups, prototipo funcional, sistema visual y evidencia responsiva. Distingue los elementos vigentes de las propuestas históricas.

<!-- PAGEBREAK -->

## 1. Objetivos de experiencia

La interfaz se diseñó para que cada perfil vea primero su tarea principal:

- El **cliente** descubre productos y completa una compra guiada.
- El **cajero** construye un ticket, cobra y controla su turno.
- El **almacén** consulta y ajusta existencias con trazabilidad.
- La **gerencia** supervisa catálogo, pedidos y abasto.
- El **administrador** controla usuarios, finanzas y configuración.

Los flujos priorizan lenguaje directo, estado visible, acciones dominantes y confirmación antes de cambios sensibles. Los cálculos de negocio se confirman en la API, por lo que la interfaz informa resultados sin fingir éxito.

## 2. Arquitectura de información

| Espacio | Navegación primaria | Acción dominante |
|---|---|---|
| Cliente | Inicio, categorías, carrito, pedidos, perfil | Agregar y proceder al pago. |
| Cajero | Nueva venta, mis ventas, sesión de caja | Cobrar / cerrar caja. |
| Almacén | Existencias, movimientos | Ajustar entrada o salida. |
| Administración | Resumen y módulos laterales | Crear, editar, revisar o configurar. |

### 2.1 Jerarquía de una pantalla

1. **Contexto:** marca/área, usuario y estado de sesión.
2. **Título y resumen:** tarea, métricas o instrucción.
3. **Controles:** búsqueda, filtro, captura y acción principal.
4. **Contenido:** tarjetas, tabla, lista o formulario.
5. **Retroalimentación:** validación, confirmación, error o estado vacío.

## 3. Wireframes

Los wireframes muestran la estructura sin depender de colores, imágenes o texto final. La composición base conserva búsqueda, contenido y acción primaria; cambia el número de columnas y la posición de la navegación.

<!-- DIAGRAM:WIREFRAMES -->

### 3.1 Wireframe por área

| Área | Cabecera | Contenido | Acción persistente |
|---|---|---|---|
| Cliente | Buscador y contexto | Categorías + tarjetas de producto | Navegación inferior y carrito. |
| Cajero | Marca, turno y caja | Catálogo + ticket | Cobrar. |
| Almacén | Marca y operador | Métricas + existencias/movimientos | Ajustar. |
| Admin | Menú lateral | Panel o módulo seleccionado | Acción contextual. |

## 4. Mockups y evolución visual

El repositorio conserva `Metodologia/MOCKUPS V1.pdf` como propuesta histórica. También existen `IDENTIDAD DE MARCA.pdf` y un manual de “Verdulería Retama”. Esos archivos son antecedentes, no la referencia vigente, porque el código evolucionó en navegación, roles y marca visible.

La referencia de alta fidelidad vigente es la interfaz implementada y capturada en el recorrido local del 15 de julio de 2026.

![Vista de cliente: catálogo, búsqueda, categorías y navegación inferior.](capturas/10_cliente_inicio.png)

### 4.1 Criterios aplicados a cliente

- Prioridad visual a producto, precio y disponibilidad.
- Tarjetas de imagen cuadrada con `object-fit: contain`.
- Navegación inferior para áreas frecuentes.
- Checkout por pasos para reducir carga cognitiva.
- Totales y estados destacados antes de confirmar.

![Checkout: identificación y progreso visible del flujo de compra.](capturas/13_cliente_checkout.png)

## 5. Interfaces operativas

### 5.1 Punto de venta

El POS separa catálogo y ticket, mantiene el total visible y reserva un color dominante para **Cobrar**. La ventana de cobro muestra método, efectivo recibido, cambio y confirmación.

![Punto de venta: búsqueda/catálogo a la izquierda y ticket actual a la derecha.](capturas/22_cajero_venta.png)

### 5.2 Inventario

Existencias combina métricas, búsqueda, filtros, tabla/tarjetas y una acción **Ajustar** por producto. Los movimientos distinguen entrada y salida con color, signo y texto; no dependen solo del color.

![Control de existencias con métricas, alertas, filtros y acción Ajustar.](capturas/30_almacen_existencias.png)

### 5.3 Administración

El panel administrativo usa navegación lateral persistente en escritorio, resumen por tarjetas y módulos especializados. Finanzas y Configuración exigen permiso de propietario.

![Panel administrativo con métricas, tendencia, alertas y accesos a módulos.](capturas/40_admin_dashboard.png)

## 6. Prototipo navegable

El prototipo es la propia aplicación Angular: sus rutas, enlaces, formularios y estados permiten evaluar el flujo completo con backend y datos de demostración. No es un conjunto de imágenes estáticas.

### 6.1 Escenarios mínimos del prototipo

| Escenario | Inicio | Interacciones | Resultado esperado |
|---|---|---|---|
| Compra cliente | `/home` | Buscar → detalle → carrito → checkout | Pedido o mensaje de resultado. |
| Venta de caja | `/cashier/register` | Abrir → agregar → cobrar | Venta, stock actualizado y comprobante. |
| Ajuste de almacén | `/inventory/stock` | Buscar → ajustar → motivo/nota | Existencia y movimiento auditable. |
| Alta de producto | `/admin/products` | Nuevo → datos → imagen → guardar | Producto disponible según estado. |
| Gestión de usuario | `/admin/users` | Crear/seleccionar → rol → guardar | Acceso acorde al rol tras renovar sesión. |

### 6.2 Estados que deben poder demostrarse

- Carga inicial y actualización.
- Lista con datos y estado vacío.
- Campo válido e inválido.
- Botón habilitado, deshabilitado y en proceso.
- Confirmación de éxito.
- Error de negocio, permisos o red.
- Vista con menú abierto/cerrado en ancho reducido.

> La URL pública definitiva debe anotarse en el índice y acta. Mientras no esté confirmada, el prototipo reproducible se ejecuta desde el repositorio siguiendo el Manual Técnico.

## 7. Manual de identidad visual vigente

### 7.1 Nombre y arquitectura de marca

| Uso | Nombre recomendado |
|---|---|
| Nombre del producto/documentación | **Tiendita Maday** |
| Cliente/organización receptora | **La Familia** |
| Tienda visible en frontend | **Abarrotes La Familia**, sujeto a aprobación final |
| Áreas internas | **Maday Admin**, **Maday Caja**, **Maday Inventario** |

El repositorio contiene referencias históricas a **Verdulería Retama**. No deben publicarse junto con la marca vigente. El cliente debe aprobar por escrito nombre comercial y logotipo final.

### 7.2 Paleta

| Token | Color | Uso recomendado |
|---|---|---|
| Primario | `#1C5442` | Navegación, botones principales y énfasis. |
| Primario oscuro | `#0F2A20` | Cabeceras, texto fuerte y fondos de operación. |
| Secundario | `#E14B32` | Acción crítica, advertencia comercial y contraste. |
| Acento | `#7DAF32` | Éxito, selección y foco. |
| Soporte | `#327D32` | Variantes verdes auxiliares. |
| Fondo | `#F5F0E8` | Superficie general cálida. |
| Superficie | `#FFFFFF` | Tarjetas, formularios y paneles. |
| Texto secundario | `#4A6357` | Ayuda y metadatos. |
| Advertencia | `#F59E0B` | Situaciones que requieren atención. |

El color nunca debe ser la única señal: se acompaña con texto, icono, signo o posición.

### 7.3 Tipografía

| Familia | Uso | Alternativa |
|---|---|---|
| Playfair Display, serif | Títulos de marca y jerarquía | Georgia, serif. |
| Nunito, sans-serif | Cuerpo, controles, tablas y navegación | Arial/Segoe UI, sans-serif. |
| Source Code Pro, monospace | Folios, códigos y datos técnicos puntuales | Monospace del sistema. |

Las fuentes se cargan desde Google Fonts en la versión actual. Si se requiere operación sin dependencia externa o mejor privacidad/rendimiento, deben alojarse localmente.

### 7.4 Logotipo e iconografía

No existe un logotipo comercial final inequívoco dentro del frontend. Los iconos PWA actuales corresponden al marcador de Angular y deben sustituirse antes de publicación de marca. Hasta que el cliente apruebe un logotipo:

- Usar el nombre escrito con la tipografía de títulos.
- No presentar el icono de Angular como logo de La Familia.
- Conservar margen libre equivalente a la altura de una letra mayúscula.
- Preparar versiones horizontal, cuadrada, monocromática y favicon.
- Evitar deformaciones, sombras decorativas o cambios de color no aprobados.

## 8. Sistema de componentes

| Componente | Regla principal |
|---|---|
| Botón primario | Una acción dominante por bloque; texto en verbo y estado de proceso. |
| Botón destructivo | Color de peligro, confirmación y descripción de consecuencia. |
| Campo | Etiqueta visible, ejemplo cuando ayuda y error cercano al dato. |
| Tarjeta | Agrupa una entidad o métrica; radio y elevación del sistema. |
| Tabla | Encabezado claro, alineación consistente y alternativa en tarjetas para móvil. |
| Modal | Una decisión limitada; debe cerrar, cancelar y conservar contexto. |
| Estado vacío | Explica qué falta y ofrece la siguiente acción. |
| Alerta | Tipo, mensaje útil y recuperación; no solo “ocurrió un error”. |
| Métrica | Etiqueta, cifra, unidad/periodo y origen entendible. |

### 8.1 Escalas compartidas

- Espaciado base: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48 y 64 px.
- Radios: 6, 10, 14, 18, 24, 32 px y píldora.
- Controles: 40, 46 y 50 px de alto.
- Contenido: margen fluido de 16 a 32 px y ancho máximo de 1420 px.
- Foco: contorno de 3 px con contraste visible.
- Movimiento reducido: las animaciones respetan `prefers-reduced-motion`.

## 9. Diseño responsivo

<!-- DIAGRAM:RESPONSIVE -->

### 9.1 Evidencia en implementación

| Ancho / regla observada | Adaptación |
|---|---|
| Hasta 760 px | Caja e inventario mueven navegación al borde inferior y ocultan datos secundarios. |
| Hasta 700 px | Movimientos pasan de tabla a tarjetas, reducen columnas y amplían zonas táctiles. |
| Hasta 1000 px | Configuración cambia de dos columnas a una y libera el mapa fijo. |
| Escritorio 1280 px | Capturas muestran panel lateral, doble columna POS y tablas completas. |
| Anchos fluidos | `clamp`, `minmax`, grids y límites máximos evitan contenido excesivamente ancho. |

### 9.2 Criterios de aceptación responsiva

- [ ] No aparece desplazamiento horizontal en flujos principales.
- [ ] Los botones críticos son visibles y utilizables con tacto.
- [ ] La navegación permanece accesible sin cubrir contenido.
- [ ] Tablas complejas cambian a tarjeta o permiten lectura controlada.
- [ ] Formularios mantienen etiqueta, valor y error en el mismo contexto.
- [ ] Modales caben en la ventana y permiten desplazamiento interno.
- [ ] La orientación no elimina información ni acciones.

## 10. Accesibilidad y contenido

### 10.1 Controles existentes

- Idioma raíz `es-MX`.
- Foco visible para navegación por teclado.
- Preferencia de movimiento reducido.
- Mensajes textuales junto con colores semánticos.
- Tamaño base de 16 px y controles con altura compartida.
- Texto alternativo requerido para imágenes de producto.

### 10.2 Trabajo pendiente

- Auditoría WCAG 2.2 AA formal.
- Revisión de contraste por componente y estado.
- Pruebas completas solo con teclado.
- Lectura de formularios, tablas y modales con lector de pantalla.
- Capturas de validación en móvil real (las actuales son de 1280 × 800).
- Reemplazo del icono Angular por la identidad aprobada.

## 11. Matriz de evidencia

| Requerimiento | Evidencia actual | Estado |
|---|---|---|
| Wireframes | Diagrama estructural de este documento | Completo. |
| Mockups | `MOCKUPS V1.pdf` histórico + capturas de alta fidelidad | Completo con trazabilidad. |
| Prototipo | Aplicación Angular navegable y escenarios documentados | Completo; URL pública por confirmar. |
| Identidad visual | Tokens vigentes, tipografía, reglas y pendiente de logo | Parcial por aprobación de marca. |
| Responsividad | Media queries, patrones y capturas de escritorio | Parcial; falta captura en dispositivo real. |

> Este expediente evita presentar como “final” una identidad no aprobada. La interfaz funcional es vigente; el nombre comercial y logotipo requieren decisión explícita del cliente.
