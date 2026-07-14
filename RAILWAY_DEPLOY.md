# Desplegar en Railway

Este repo es un mono-repo (Frontend + Backend + Database en
`mi cliente (la familia)/Arquitectura/`). Vas a crear 3 piezas dentro de un
mismo proyecto de Railway:

1. **PostgreSQL** (plugin administrado por Railway)
2. **Backend** (Express) — carpeta `mi cliente (la familia)/Arquitectura/Backend`
3. **Frontend** (Angular, estático) — carpeta `mi cliente (la familia)/Arquitectura/FrontEnd`

No hace falta tocar `docker-compose.yml` — eso sigue sirviendo solo para tu
entorno local.

---

## ⚠️ Lo único que tienes que configurar: Root Directory

Cada subcarpeta (`Backend/`, `FrontEnd/`) ya tiene su propio `railway.json`
apuntando al Dockerfile correcto. Railway detecta ese archivo **solo**
(sin que toques nada en Settings → Build) siempre y cuando el **Root
Directory** del servicio esté puesto correctamente. Ese es el único campo
que debes llenar, y es el que ha fallado en los intentos anteriores (o
porque no se guardó, o porque no se redepliegue después de guardarlo).

### Dónde está ese campo, paso a paso

1. Entra al servicio (Backend o Frontend) dentro de tu proyecto de Railway.
2. Click en la pestaña **Settings** (arriba del panel del servicio).
3. La primera sección se llama **Source**. Ahí, justo debajo de dónde dice
   el repo de GitHub conectado, hay un campo de texto llamado
   **Root Directory** (a veces aparece como "Add Root Directory" si está
   vacío).
4. Escribe (copia y pega, sin comillas):
   - Backend: `mi cliente (la familia)/Arquitectura/Backend`
   - Frontend: `mi cliente (la familia)/Arquitectura/FrontEnd`
5. Presiona Enter o el botón de guardar que aparezca junto al campo.
6. **Importante:** cambiar este campo no siempre dispara un build nuevo
   solo. Ve a la pestaña **Deployments** y dale clic a **Deploy** (o a los
   tres puntos `⋮` del último deployment fallido → **Redeploy**).
7. Repite lo mismo en el otro servicio, con su propia carpeta.

No toques nada en **Settings → Build** — no hace falta, el `railway.json`
de cada carpeta ya le dice a Railway qué Dockerfile usar.

---

## 1. Crear el proyecto y la base de datos

1. En Railway: **New Project → Deploy from GitHub repo** → selecciona el repo.
2. Dentro del proyecto: **New → Database → Add PostgreSQL**.
3. Ve a la pestaña **Data** de ese servicio y pega el contenido de
   `mi cliente (la familia)/Arquitectura/Database/init.sql` para crear las
   tablas (Railway no ejecuta `init.sql` automáticamente como sí hace
   `docker-compose`, así que este paso es manual y se hace una sola vez).

   Alternativa por terminal si tienes `psql`:
   ```bash
   psql "<CONNECTION_URL de la pestaña Connect>" -f "mi cliente (la familia)/Arquitectura/Database/init.sql"
   ```

---

## 2. Servicio Backend

1. **New → GitHub Repo** (mismo repo) para crear el servicio.
2. Configura el **Root Directory** como se explicó arriba:
   `mi cliente (la familia)/Arquitectura/Backend`.
3. En **Variables** agrega:
   - `DATABASE_URL` → **Reference Variable** apuntando al servicio de
     Postgres (Railway te la sugiere al escribir `DATABASE_URL`).
   - `JWT_SECRET` y `JWT_REFRESH_SECRET` → valores largos y aleatorios
     (genera cada uno con `openssl rand -hex 32`).
   - `PAYPAL_CLIENT_ID` y `PAYPAL_SECRET` → las credenciales de tu app
     de PayPal (developer.paypal.com). **Nunca** las metas al código.
   - `PAYPAL_API_BASE` → déjala sin definir para sandbox (pruebas);
     cuando pases a producción real ponla en `https://api-m.paypal.com`
     con credenciales live.
   - `GOOGLE_CLIENT_ID` → `404377374895-n3b126dqau688rqvcpsl56k20p7r3t2n.apps.googleusercontent.com`
     (el mismo Client ID que usa el frontend; el backend lo necesita para
     verificar la firma de los tokens de Google).
   - No definas `PORT` manualmente, Railway lo inyecta solo.
4. **Settings → Networking → Generate Domain** para obtener la URL pública,
   por ejemplo `https://backend-production-xxxx.up.railway.app`.
5. Verifica que responde entrando a esa URL — debe devolver
   `{"message":"Tiendita Maday API running"}`. La documentación interactiva
   queda en `/api-docs`.

Guarda esa URL, la necesitas en el siguiente paso.

### Migraciones de una base existente

Después de desplegar una versión que agregue migraciones, ejecútalas en orden
contra PostgreSQL. Para los módulos actuales se requiere:

```bash
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/004_customer_cashier_roles.sql"
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/005_email_verification.sql"
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/006_inventory_movements.sql"
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/007_inventory_images.sql"
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/008_checkout_integrity.sql"
psql "<CONNECTION_URL>" -f "mi cliente (la familia)/Arquitectura/Database/migrations/009_checkout_shipping_tier.sql"
```

Las migraciones son idempotentes. Una instalación nueva creada directamente
desde `Database/init.sql` ya incluye los roles actuales.

---

## 3. Servicio Frontend

1. **New → GitHub Repo** (mismo repo) para el otro servicio.
2. Configura el **Root Directory**:
   `mi cliente (la familia)/Arquitectura/FrontEnd`.
3. En **Variables** agrega:
   - `API_BASE_URL` = `https://backend-production-xxxx.up.railway.app/api`
     (la URL del backend del paso anterior, **con `/api` al final**).
     Railway la pasa como build arg al Dockerfile automáticamente porque
     el Dockerfile declara `ARG API_BASE_URL` con el mismo nombre.
4. **Settings → Networking → Generate Domain** para la URL pública del frontend.
5. Railway hace el build (Angular compila con esa URL ya "horneada" en el
   bundle — es una SPA estática, no hay servidor Node corriendo Angular,
   solo `serve` sirviendo archivos).

---

## 4. (Opcional pero recomendado) Cerrar CORS

Por defecto el backend acepta peticiones de cualquier origen. Para
restringirlo solo al frontend:

1. En el servicio **Backend → Variables**, agrega `FRONTEND_URL` = la URL
   pública del frontend (paso 3.4).
2. Railway redespliega el backend automáticamente al guardar la variable.

---

## Cuando cambie la URL del backend

Actualiza la variable `API_BASE_URL` en el servicio Frontend y vuelve a
desplegar (Deployments → Redeploy) — no hace falta tocar código.

## Actualizaciones rápidas del frontend

El frontend comprueba si Railway publicó una versión nueva cada 30 segundos,
al volver a la pestaña y después de navegar. Las pantallas de consulta se
actualizan automáticamente; checkout, administración, caja e inventario
muestran primero el aviso de actualización para no interrumpir una operación.

`serve.json` desactiva el caché HTTP de `index.html`, `ngsw.json` y
`ngsw-worker.js`. Los archivos compilados con nombre versionado continúan
administrados por el service worker para conservar la velocidad de carga.

---

## Plan B — si Root Directory sigue sin funcionar

Si después de configurar el Root Directory correctamente **y** darle
Redeploy manual el build sigue sin usar el Dockerfile de esa carpeta (por
ejemplo si vuelve a construir desde la raíz o el error menciona
"railpack"), es señal de que Railway no está tomando ese campo. En ese
caso, en vez de depender de Root Directory:

1. Deja el **Root Directory vacío** (raíz del repo).
2. Ve a **Settings → Build** y fija manualmente:
   - Builder: `Dockerfile`
   - Custom Dockerfile Path: `Dockerfile.backend.railway` (Backend) o
     `Dockerfile.frontend.railway` (Frontend)

Estos dos Dockerfiles ya existen en la raíz del repo exactamente para este
caso — cada uno copia solo su subcarpeta correspondiente usando sintaxis
de `COPY` en array (soporta los espacios y paréntesis del path). Ya se
probaron de punta a punta con `docker build` + `docker run` local: el
backend responde en `/` y el frontend sirve el bundle con la URL del
backend correctamente compilada adentro.

## Nota sobre los Dockerfiles normales (`Backend/Dockerfile`, `FrontEnd/Dockerfile`)

Esos siguen existiendo y son los que usa `docker-compose.yml` para tu
entorno local (`ng serve` con hot reload, etc). No son los que usa Railway.
