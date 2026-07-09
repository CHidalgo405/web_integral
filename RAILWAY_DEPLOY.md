# Desplegar en Railway

Este repo es un mono-repo (Frontend + Backend + Database en la misma carpeta
`mi cliente (la familia)/Arquitectura/`). Railway permite crear **varios
servicios apuntando al mismo repo**, cada uno con su propio "Root Directory".
Vas a crear 3 piezas dentro de un mismo proyecto de Railway:

1. **PostgreSQL** (plugin administrado por Railway)
2. **Backend** (Express)
3. **Frontend** (Angular, servido como archivos estáticos)

No hace falta tocar `docker-compose.yml` — eso sigue sirviendo solo para tu
entorno local. Railway usa Dockerfiles propios que ya dejé listos.

> ⚠️ **El paso que más falla:** por defecto Railway construye desde la raíz
> del repo, que no tiene ni `package.json` ni Dockerfile útil. **Siempre**
> que crees un servicio nuevo, entra a **Settings → Source → Root Directory**
> y ponlo ANTES de dejar que corra el primer build (o, si ya falló, ponlo y
> dale **Deploy** de nuevo manualmente — cambiar la variable sola no siempre
> dispara un redeploy).

---

## 1. Crear el proyecto y la base de datos

1. En Railway: **New Project → Deploy from GitHub repo** → selecciona `web_integral`.
2. Dentro del proyecto: **New → Database → Add PostgreSQL**.
3. Una vez creado, ve a la pestaña **Data** de ese servicio y pega el
   contenido de
   `mi cliente (la familia)/Arquitectura/Database/init.sql`
   para crear las tablas (Railway no ejecuta `init.sql` automáticamente
   como sí hace `docker-compose`, así que este paso es manual y se hace
   una sola vez).

   Alternativa por terminal si tienes `psql` instalado:
   ```bash
   psql "<CONNECTION_URL de la pestaña Connect>" -f "mi cliente (la familia)/Arquitectura/Database/init.sql"
   ```

---

## 2. Servicio Backend

1. **New → GitHub Repo** (mismo repo) para crear un segundo servicio.
2. En **Settings → Source**: define **Root Directory** como
   `mi cliente (la familia)/Arquitectura/Backend`.
3. Railway detectará el `railway.json` de esa carpeta y usará el
   `Dockerfile` (builder Docker, no Nixpacks).
4. En **Variables** agrega:
   - `DATABASE_URL` → usa una **Reference Variable** apuntando al servicio
     de Postgres (Railway te la sugiere automáticamente al escribir `DATABASE_URL`).
   - No definas `PORT` manualmente, Railway lo inyecta solo.
5. En **Settings → Networking → Generate Domain** para obtener una URL pública,
   algo como `https://backend-production-xxxx.up.railway.app`.
6. Verifica que responde entrando a esa URL en el navegador — debe devolver
   `{"message":"Tiendita Maday API running"}`. La documentación interactiva
   queda en `/api-docs`.

Guarda esa URL, la necesitas en el siguiente paso.

---

## 3. Servicio Frontend

1. **New → GitHub Repo** (mismo repo) para el tercer servicio.
2. En **Settings → Source**: **Root Directory** =
   `mi cliente (la familia)/Arquitectura/FrontEnd`.
3. El `railway.json` de esa carpeta ya apunta a `Dockerfile.railway`
   (el `Dockerfile` normal de esa carpeta es solo para `ng serve` en local,
   Railway lo ignora).
4. En **Variables** agrega:
   - `API_BASE_URL` = `https://backend-production-xxxx.up.railway.app/api`
     (la URL del backend del paso anterior, **con `/api` al final**).
5. **Settings → Networking → Generate Domain** para la URL pública del frontend.
6. Railway hace el build (Angular compila con esa URL ya "horneada" en el
   bundle — es una SPA estática, no hay servidor Node corriendo Angular).

---

## 4. (Opcional pero recomendado) Cerrar CORS

Por defecto el backend acepta peticiones de cualquier origen. Para
restringirlo solo al frontend:

1. En el servicio **Backend → Variables**, agrega
   `FRONTEND_URL` = la URL pública del frontend (paso 3.5).
2. Railway redepliega el backend solo automáticamente al guardar la variable.

---

## Cuando cambie la URL del backend

Si el dominio del backend cambia, solo actualiza la variable `API_BASE_URL`
en el servicio Frontend y vuelve a desplegar (Railway lo hace solo al
guardar la variable) — no hace falta tocar código.

## Si Railway se queja del path con espacios/paréntesis

`mi cliente (la familia)/Arquitectura/...` tiene espacios y paréntesis. El
campo *Root Directory* de Railway normalmente lo acepta sin problema (es
solo texto), pero si algún build fallara por eso, avísame y lo resolvemos
sin tener que renombrar carpetas del repo.
