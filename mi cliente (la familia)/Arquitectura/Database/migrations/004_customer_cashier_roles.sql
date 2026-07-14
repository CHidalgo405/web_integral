-- =============================================================
-- MIGRATION 004 — Separa compradores (customer) de cajeros
-- =============================================================
-- Es idempotente. Los cajeros internos existentes conservan su rol:
-- normalmente tienen PIN y/o deben cambiar su contraseña. Las cuentas
-- públicas creadas por registro usan correo, no tienen PIN y no tienen
-- cambio de contraseña forzado.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
