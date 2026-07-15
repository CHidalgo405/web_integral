# Fuentes editables

Los cinco archivos Markdown son las fuentes de los entregables PDF.

Para regenerarlos:

```powershell
python -m pip install -r requirements.txt
python generar_entregables.py
```

El generador escribe los PDFs en la carpeta `Entregables`. Revise visualmente todas las paginas despues de cualquier cambio de contenido o dependencias.
