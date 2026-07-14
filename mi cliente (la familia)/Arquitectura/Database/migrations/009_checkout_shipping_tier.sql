BEGIN;

-- Conserva si el cliente eligió envío estándar, express o recolección.
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS shipping_tier VARCHAR(20);

ALTER TABLE purchases
  DROP CONSTRAINT IF EXISTS purchases_shipping_tier_check;

ALTER TABLE purchases
  ADD CONSTRAINT purchases_shipping_tier_check
  CHECK (shipping_tier IS NULL OR shipping_tier IN ('standard', 'express', 'pickup'));

COMMIT;
