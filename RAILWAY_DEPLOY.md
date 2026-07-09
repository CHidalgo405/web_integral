# Desplegar en Railway

Este repo es un mono-repo (Frontend + Backend + Database en
`mi cliente (la familia)/Arquitectura/`). Vas a crear 3 piezas dentro de un
mismo proyecto de Railway:

1. **PostgreSQL** (plugin administrado por Railway)
2. **Backend** (Express)
3. **Frontend** (Angular, servido como archivos estáticos)

No hace falta tocar `docker-compose.yml` — eso sigue sirviendo solo para tu
entorno local.

## Cómo está resuelto el problema del mono-repo

El campo **Root Directory** de Railway fallaba repetidamente con el path
`mi cliente (la familia)/Arquitectura/Backend` (espacios y paréntesis) y
Railway terminaba construyendo desde la raíz del repo, donde no hay nada
que detectar.

Para eliminar ese punto de falla, **ya no se usa Root Directory en
absoluto**. En su lugar:

- Los Dockerfiles de producción viven en la **raíz del repo**:
  `Dockerfile.backend.railway` y `Dockerfile.frontend.railway`. Cada uno
  copia únicamente su subcarpeta correspondiente (con `COPY` en formato
  array, que sí soporta paths con espacios).
- Cada servicio de Railway apunta a su Dockerfile de forma manual, sin
  depender de que Railway adivine nada.
- Esto ya se probó de punta a punta con `docker build` local (backend y
  frontend), no es teoría.

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

1. **New → GitHub Repo** (mismo repo) para crear un segundo servicio.
2. **Settings → Source → Root Directory**: déjalo **vacío** (raíz del repo).
3. **Settings → Build**:
   - Builder: **Dockerfile**
   - Custom Dockerfile Path: `Dockerfile.backend.railway`

   (Si tu versión de Railway soporta "Config File Path" en vez de estos
   campos, puedes apuntarlo a `railway.backend.json` y hace lo mismo
   automáticamente.)
4. En **Variables** agrega:
   - `DATABASE_URL` → **Reference Variable** apuntando al servicio de
     Postgres (Railway te la sugiere al escribir `DATABASE_URL`).
   - No definas `PORT` manualmente, Railway lo inyecta solo.
5. **Settings → Networking → Generate Domain** para obtener la URL pública,
   por ejemplo `https://backend-production-xxxx.up.railway.app`.
6. Verifica que responde entrando a esa URL — debe devolver
   `{"message":"Tiendita Maday API running"}`. La documentación interactiva
   queda en `/api-docs`.

Guarda esa URL, la necesitas en el siguiente paso.

---

## 3. Servicio Frontend

1. **New → GitHub Repo** (mismo repo) para el tercer servicio.
2. **Settings → Source → Root Directory**: déjalo **vacío** también.
3. **Settings → Build**:
   - Builder: **Dockerfile**
   - Custom Dockerfile Path: `Dockerfile.frontend.railway`

   (o Config File Path → `railway.frontend.json`)
4. En **Variables** agrega:
   - `API_BASE_URL` = `https://backend-production-xxxx.up.railway.app/api`
     (la URL del backend del paso anterior, **con `/api` al final**).
     Railway la pasa como build arg al Dockerfile automáticamente porque
     el Dockerfile declara `ARG API_BASE_URL` con el mismo nombre.
5. **Settings → Networking → Generate Domain** para la URL pública del frontend.
6. Railway hace el build (Angular compila con esa URL ya "horneada" en el
   bundle — es una SPA estática, no hay servidor Node corriendo Angular,
   solo `serve` sirviendo archivos).

---

## 4. (Opcional pero recomendado) Cerrar CORS

Por defecto el backend acepta peticiones de cualquier origen. Para
restringirlo solo al frontend:

1. En el servicio **Backend → Variables**, agrega `FRONTEND_URL` = la URL
   pública del frontend (paso 3.5).
2. Railway redespliega el backend automáticamente al guardar la variable.

---

## Cuando cambie la URL del backend

Actualiza la variable `API_BASE_URL` en el servicio Frontend y vuelve a
desplegar — no hace falta tocar código ni el Dockerfile.

## Nota sobre los Dockerfiles nested (`Backend/Dockerfile`, `FrontEnd/Dockerfile`)

Esos siguen existiendo y siguen siendo los que usa `docker-compose.yml`
para tu entorno local (`ng serve` con hot reload, etc). Railway usa
exclusivamente los de la raíz (`Dockerfile.backend.railway` /
`Dockerfile.frontend.railway`), pensados para producción.
