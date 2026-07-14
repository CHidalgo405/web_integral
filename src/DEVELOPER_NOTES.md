# Developer Notes (local frontend)

Pequeñas notas para desarrolladores que trabajen localmente en el frontend.

- Archivo para ajustes locales: `src/styles.local.css` (no versionar cambios de producción).
- Variables de entorno de ejemplo: `env.local.example` en la raíz del FrontEnd.
- No modificar archivos de configuración compartidos sin coordinar con el equipo.

Comandos útiles:

```bash
# Servidor de desarrollo (Angular)
ng serve

# Generar un build de producción
ng build --configuration production
```

Si necesitas reproducir bugs en la API, apunta `API_BASE_URL` a tu backend local o a la instancia de Railway.
