// Se ejecuta antes del build de producción (ver Dockerfile.railway).
// Toma la variable de entorno API_BASE_URL (definida en Railway) y la
// escribe en environment.prod.ts para que quede compilada en el bundle.
// Si no existe la variable, deja el valor por defecto ya presente en el archivo.

const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.API_BASE_URL;
const targetFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!apiBaseUrl) {
  console.log('[generate-env] API_BASE_URL no definida, se usa el valor por defecto del archivo.');
  process.exit(0);
}

const content = `// Generado automáticamente por scripts/generate-env.js durante el build.
export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
};
`;

fs.writeFileSync(targetFile, content);
console.log(`[generate-env] environment.prod.ts actualizado con API_BASE_URL=${apiBaseUrl}`);
