-- Migration 005: Email Verification Codes
-- Agrega tabla para los códigos OTP de verificación de correo electrónico.
-- Reglas: expira 1 hora, máx 3 intentos, bloqueo 1 hora tras agotar intentos.

CREATE TABLE IF NOT EXISTS email_verification_codes (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash    TEXT        NOT NULL,
    attempts     SMALLINT    NOT NULL DEFAULT 0,
    verified     BOOLEAN     NOT NULL DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
    CONSTRAINT unique_pending_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_evc_user_id ON email_verification_codes(user_id);
