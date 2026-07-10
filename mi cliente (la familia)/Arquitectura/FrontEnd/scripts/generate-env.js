// Se ejecuta antes del build de producción (ver Dockerfile.railway).
// Toma las variables de entorno de Railway y las escribe en
// environment.prod.ts para que queden compiladas en el bundle.
// Si no existe API_BASE_URL, deja el archivo tal cual (build local).

const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.API_BASE_URL;
const targetFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!apiBaseUrl) {
  console.log('[generate-env] API_BASE_URL no definida, se usa el valor por defecto del archivo.');
  process.exit(0);
}

// El client ID de Google no es secreto; se puede sobreescribir por env var,
// si no, se conserva el mismo que ya está en desarrollo.
const googleClientId = process.env.GOOGLE_CLIENT_ID
  || '404377374895-n3b126dqau688rqvcpsl56k20p7r3t2n.apps.googleusercontent.com';

const content = `// Generado automáticamente por scripts/generate-env.js durante el build.
export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
  googleClientId: '${googleClientId}',
};
`;

fs.writeFileSync(targetFile, content);
console.log(`[generate-env] environment.prod.ts actualizado con API_BASE_URL=${apiBaseUrl}`);
