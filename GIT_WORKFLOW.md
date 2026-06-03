# Flujo de Trabajo Git — Tiendita Maday

Este documento define el flujo de trabajo Git adoptado por el equipo. Todos los integrantes deben seguirlo para mantener el repositorio organizado y el historial limpio.

---

## Filosofía: GitHub Flow

Trabajamos con **GitHub Flow**: una rama principal (`main`) siempre lista para producción, y ramas de corta duración para cada cambio. Todo ingresa a `main` únicamente a través de un Pull Request revisado y aprobado.

---

## Ramas Principales

| Rama | Descripción | Acceso directo |
|------|-------------|----------------|
| `main` | Rama de producción, siempre estable y desplegable | **Prohibido** — solo via PR |

> No existe rama `develop`. Todo parte de `main` y regresa a `main`.

---

## Convenciones de Nomenclatura

```
feature/descripcion-corta       ← nueva funcionalidad
fix/descripcion-del-bug         ← corrección de error
chore/descripcion               ← mantenimiento (dependencias, config, CI/CD)
docs/descripcion                ← documentación
```

**Reglas:**
- Minúsculas y guiones, sin acentos ni espacios
- Descripciones cortas y significativas

**Ejemplos:**
```
feature/carrito-de-compras
feature/autenticacion-usuario
fix/login-token-expirado
fix/precio-producto-nulo
chore/actualizar-dependencias
docs/guia-de-instalacion
```

---

## Equipo y Responsabilidades

| Integrante | Rol | Responsabilidades en Git |
|------------|-----|--------------------------|
| Carlos Ignacio Hidalgo Hernández | Scrum Master | Revisa y aprueba PRs, realiza merge a `main`, gestiona ramas `chore/` de infraestructura y CI |
| Kevin Alexander Texcahua Sandoval | Product Owner | Revisa PRs desde la perspectiva de producto, aprueba features antes del merge |
| Monraga Contreras Zahid | Developer | Crea ramas `feature/` y `fix/`, sube cambios y abre PRs |
| Joaquín Daniel García Cobos | Developer | Crea ramas `feature/` y `fix/`, sube cambios y abre PRs |
| Diego Sánchez Sánchez | Developer | Crea ramas `feature/` y `fix/`, sube cambios y abre PRs |
| Christian Barragán Páez | Developer | Crea ramas `feature/` y `fix/`, sube cambios y abre PRs |

---

## Flujo de Trabajo Paso a Paso

### 1. Siempre partir de `main` actualizado

```bash
git checkout main
git pull origin main
```

### 2. Crear tu rama de trabajo

```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

### 3. Hacer commits durante el desarrollo

Formato de commits: `tipo: descripción breve`

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

```bash
git add archivo-modificado.ts
git commit -m "feat: agregar endpoint de carrito de compras"
```

### 4. Subir la rama al repositorio remoto

```bash
git push origin feature/nombre-de-la-funcionalidad
```

### 5. Abrir un Pull Request

- Título claro: qué hace el cambio
- Descripción breve: por qué se hace y qué incluye
- Asignar a **Carlos** para revisión técnica
- Si es una feature nueva, notificar también a **Kevin** para revisión de producto

### 6. Revisión y aprobación

- El PR necesita **al menos 1 aprobación** antes del merge
- Carlos o Kevin pueden aprobar según el tipo de cambio
- Resolver cualquier comentario antes del merge

### 7. Merge a `main`

- Lo realiza **Carlos** (Scrum Master)
- Se hace merge del PR una vez aprobado
- La rama de trabajo se elimina tras el merge

---

## Reglas del Equipo

1. **Nadie hace commit directo a `main`** — sin excepciones
2. **Todo cambio entra por PR**, sin importar el tamaño
3. **Ramas de corta duración** — días, no semanas
4. **Un PR por funcionalidad o corrección** — no mezclar cambios no relacionados
5. **Actualizar tu rama** antes de abrir el PR si `main` avanzó:

```bash
git checkout main
git pull origin main
git checkout feature/mi-rama
git merge main
```

---

## Diagrama del Flujo

```
main ──────────────────────────────────────────────► producción
       │                              ▲
       └─► feature/mi-funcionalidad ──┘
               (PR + aprobación)
```

---

## Resumen de Comandos Frecuentes

```bash
# Actualizar main
git checkout main && git pull origin main

# Nueva rama
git checkout -b feature/descripcion

# Ver ramas locales
git branch

# Ver estado
git status

# Subir rama
git push origin feature/descripcion

# Eliminar rama local tras merge
git branch -d feature/descripcion
```
