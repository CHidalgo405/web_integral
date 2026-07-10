-- =============================================================
--  MIGRATION 001 — User flows (addresses, payment methods,
--  purchases linked to app users)
--
--  Cómo aplicarla en Railway: servicio Postgres → pestaña Data →
--  pegar este archivo completo y ejecutar. Es idempotente: se
--  puede correr más de una vez sin romper nada.
-- =============================================================

-- ─── Direcciones guardadas por usuario ───────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(40)  NOT NULL DEFAULT 'Casa',
    full_name       VARCHAR(120) NOT NULL,
    phone           VARCHAR(30),
    street          VARCHAR(160) NOT NULL,
    exterior_number VARCHAR(20),
    interior_number VARCHAR(20),
    neighborhood    VARCHAR(120),
    city            VARCHAR(120),
    state           VARCHAR(120),
    zip_code        VARCHAR(10),
    notes           TEXT,
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- ─── Métodos de pago guardados por usuario ────────────────────
--  Solo datos de presentación (marca, últimos 4 dígitos). Nunca
--  se guarda el número completo de la tarjeta ni el CVV.
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('card', 'cash')),
    label       VARCHAR(80)  NOT NULL,
    brand       VARCHAR(20),
    last4       CHAR(4),
    holder_name VARCHAR(120),
    expiry      VARCHAR(7),
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user ON user_payment_methods(user_id);

-- ─── Compras ligadas al usuario de la app ─────────────────────
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
