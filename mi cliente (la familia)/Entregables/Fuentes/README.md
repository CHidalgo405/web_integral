# Fuentes editables y reproducción de entregables

Esta carpeta contiene las fuentes, generadores y evidencias visuales del paquete documental de Tiendita Maday. Los archivos finales se publican en la carpeta superior `Entregables`.

## Contenido

- `00_*.md` a `12_*.md`: fuentes Markdown de los 13 PDFs numerados.
- `generar_entregables.py`: generador común de PDFs con portada, tablas, encabezados, pies, diagramas y capturas.
- `requirements.txt`: dependencia Python fijada para la generación de PDFs.
- `generar_presentacion.mjs`: fuente reproducible de la presentación ejecutiva 13.
- `capturas/`: evidencia visual utilizada en manuales, pruebas y diapositivas.

El resultado esperado en `Entregables` es:

- 13 PDFs: identificadores 00 a 12.
- 1 presentación PowerPoint: identificador 13, con 15 diapositivas.

## Regenerar los PDFs

Requisitos:

- Python 3.11 o posterior.
- Las fuentes Arial del sistema o, como alternativa, DejaVu Sans.
- Dependencias de `requirements.txt`.

Desde esta carpeta:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python generar_entregables.py
```

En Windows, la activación equivalente es:

```powershell
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python generar_entregables.py
```

El generador busca automáticamente todos los Markdown numerados y sobrescribe el PDF correspondiente en `Entregables`. Para regenerar sólo un documento durante edición, se puede importar `build_one` desde el generador y pasarle la ruta de su Markdown.

## Regenerar la presentación

`generar_presentacion.mjs` utiliza `@oai/artifact-tool`. Debe ejecutarse en un entorno que tenga ese paquete disponible, como el runtime de presentaciones de Codex.

Variables requeridas o recomendadas:

- `PROJECT_ROOT`: ruta absoluta a la raíz del repositorio; es obligatoria.
- `OUTPUT_PPTX`: destino del PowerPoint; si se omite, usa el nombre final dentro de `Entregables`.
- `PREVIEW_DIR`: carpeta temporal para PNG y montaje de revisión.
- `LAYOUT_DIR`: carpeta temporal para inspecciones de diseño.

Ejemplo conceptual:

```bash
PROJECT_ROOT="/ruta/al/repositorio" \
PREVIEW_DIR="/ruta/temporal/preview" \
LAYOUT_DIR="/ruta/temporal/layout" \
node generar_presentacion.mjs
```

El PowerPoint final ya se conserva en el repositorio. Si no se dispone de `@oai/artifact-tool`, puede abrirse y ajustarse directamente en PowerPoint o LibreOffice, pero cualquier cambio debe volver a validarse diapositiva por diapositiva.

## Control de calidad obligatorio

Después de cualquier cambio de contenido o dependencias:

1. Regenerar únicamente el entregable afectado cuando sea posible.
2. Confirmar que el PDF o PPTX abre sin errores y tiene el número esperado de páginas o diapositivas.
3. Renderizar cada página o diapositiva a imagen.
4. Revisar todas las imágenes a tamaño completo.
5. Corregir recortes, solapamientos, tablas partidas sin contexto o texto ilegible.
6. Extraer el texto para comprobar nombres, revisiones, cifras y secciones clave.
7. Evitar publicar carpetas temporales de preview, layout, caché o archivos de inspección.
8. Hacer commit y push del archivo final junto con su fuente, y ejecutar pull antes de continuar con el siguiente entregable.

Comandos útiles para PDF cuando Poppler está disponible:

```bash
pdfinfo ../00_LEEME_PRIMERO.pdf
pdftotext ../00_LEEME_PRIMERO.pdf -
pdftoppm -png -r 144 ../00_LEEME_PRIMERO.pdf /ruta/temporal/indice
```

## Reglas de edición

- Mantener los identificadores y nombres finales 00-13.
- No escribir contraseñas, tokens, claves privadas ni secretos en las fuentes, capturas o salidas.
- Diferenciar hechos verificados, resultados por revisión y campos que debe completar el cliente.
- No atribuir participación sin evidencia Git o un anexo externo verificable.
- Actualizar el índice 00 cuando cambie el inventario, la cobertura o una brecha crítica.
- Actualizar el acta 04 cuando cambie la revisión aceptada, el alcance o las reservas.
- Repetir pruebas y actualizar el reporte 03 si cambia el código de la aplicación.

## Brechas que deben permanecer visibles

Al corte documental siguen abiertas:

- La suite frontend no se ejecuta porque Vitest no encuentra pruebas.
- Dos integraciones backend de POS e inventario fueron omitidas.
- La restauración de respaldo aún no cuenta con evidencia ejecutada.
- El ambiente definitivo, proveedores, accesos y marca requieren confirmación.
- La identidad Git de Adán no fue localizada en el historial disponible.

Estas brechas no impiden regenerar los documentos, pero sí deben considerarse antes de autorizar producción o firmar una aceptación sin reservas.
