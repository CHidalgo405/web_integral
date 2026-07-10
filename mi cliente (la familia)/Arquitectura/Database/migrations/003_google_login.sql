-- =============================================================
--  MIGRATION 003 — Login con Google
--
--  Cómo aplicarla en Railway: servicio Postgres → pestaña Data →
--  pegar este archivo completo y ejecutar. Es idempotente.
-- =============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
