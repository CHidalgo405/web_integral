# Auditoría UI/UX — Tiendita Maday

Fecha: 14 de julio de 2026

## Corregido en esta revisión

- Producto: se eliminó el lienzo móvil de 600 px en PC y se creó una composición de dos columnas con imagen fija, contenido legible y compra visible.
- Carrito: se eliminó el lienzo móvil de 600 px; el estado vacío usa una composición horizontal y el carrito con productos separa lista y resumen.
- Navegación de cliente: el dock de escritorio ahora muestra las cinco etiquetas y aprovecha un ancho adecuado.
- Inicio, categorías, favoritos, búsqueda e historial: se añadieron contenedores, retículas y espacios específicos para escritorio.
- Perfil: dejó de estar limitado a 500 px y usa dos columnas en PC.
- Encabezados: se alinearon a un contenedor común en pantallas grandes.
- Accesibilidad: se añadió foco de teclado visible y se respeta `prefers-reduced-motion`.
- Carrito: eliminar un artículo ya no depende de simular un gesto de deslizamiento con el mouse.

## Pendientes recomendados

### Prioridad alta

1. Checkout: en PC sigue siendo una sola columna de 600 px. Conviene mostrar formulario y resumen del pedido en dos columnas, manteniendo una sola columna en móvil.
2. Estados de pedido: confirmación y error conservan una presentación de 600 px; necesitan una tarjeta de escritorio con mejor jerarquía y acciones laterales.
3. Formularios de perfil: edición, direcciones y métodos de pago tienen estilos móviles aislados; deben compartir un contenedor y patrones de formulario consistentes.

### Prioridad media

1. Reseñas: el ancho de lectura de 760 px es correcto, pero en escritorio el resumen, filtros y formulario podrían usar una columna lateral.
2. Detalle de pedido: tiene una sola columna larga; en PC conviene separar seguimiento, artículos y resumen financiero.
3. Tablas administrativas: varias dependen del desplazamiento horizontal en tamaños intermedios. Deben priorizar columnas y ofrecer tarjetas antes de llegar a móvil.
4. Consistencia visual: administración, caja, inventario y cliente usan radios, sombras y densidades distintas. Conviene centralizar tokens de espaciado, radios y elevación.

### Mantenimiento y accesibilidad

1. El scrollbar global está oculto; en listas largas no existe una pista visual de posición.
2. Aún hay botones sólo con icono sin nombre accesible en componentes antiguos.
3. Varias pantallas contienen estilos extensos dentro del archivo TypeScript, lo que dificulta reutilizar patrones responsive.
4. Las imágenes de algunas tarjetas usan `object-fit: cover`, que puede recortar empaques verticales; se debe decidir por tipo de catálogo entre `cover` y `contain`.

## Matriz mínima de validación

- Móvil: 390 × 844 px.
- Tableta: 768 × 1024 px.
- Laptop: 1366 × 768 px.
- Escritorio: 1440 × 900 px.
- Escritorio amplio: 1920 × 1080 px.
- Teclado: recorrido completo con foco visible.
- Movimiento reducido: animaciones no repetitivas cuando el sistema lo solicita.
