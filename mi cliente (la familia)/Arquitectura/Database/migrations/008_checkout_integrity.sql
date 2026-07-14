BEGIN;

-- Una captura de PayPal solo puede respaldar una compra local.
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_paypal_order_unique
  ON purchases(paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

COMMIT;
