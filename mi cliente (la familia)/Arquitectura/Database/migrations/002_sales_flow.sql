-- =============================================================
--  MIGRATION 002 — Sales flow (granular shipping states, PayPal,
--  tracking number, stock triggers para e-commerce)
--
--  Cómo aplicarla en Railway: servicio Postgres → pestaña Data →
--  pegar este archivo completo y ejecutar. Correr DESPUÉS de 001.
--  Es idempotente.
-- =============================================================

-- ─── Estados de envío granulares ──────────────────────────────
-- El flujo de pedido pasa a ser: pending → preparing → shipped →
-- delivered (o cancelled). 'completed' se conserva por compatibilidad
-- con ventas antiguas del punto de venta.
ALTER TYPE purchase_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE purchase_status ADD VALUE IF NOT EXISTS 'shipped';
ALTER TYPE purchase_status ADD VALUE IF NOT EXISTS 'delivered';

-- ─── PayPal como método de pago ───────────────────────────────
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'paypal';

-- ─── Columnas nuevas en purchases ─────────────────────────────
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(60);

-- ─── Triggers de stock adaptados al e-commerce ────────────────
-- Antes: el stock solo se descontaba cuando la compra nacía o pasaba
-- a 'completed'. Con estados de envío, una compra 'pending' es una
-- venta comprometida: el stock se descuenta al crearla (evita
-- sobreventa) y se restaura si se cancela.

CREATE OR REPLACE FUNCTION sale_reduce_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_status         purchase_status;
    v_stock          INTEGER;
    v_has_expiration BOOLEAN;
BEGIN
    SELECT status INTO v_status FROM purchases WHERE id = NEW.purchase_id;

    -- Solo las compras canceladas no descuentan stock
    IF v_status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    SELECT stock, has_expiration
    INTO   v_stock, v_has_expiration
    FROM   inventory WHERE id = NEW.inventory_id
    FOR UPDATE;

    IF v_stock < NEW.quantity THEN
        RAISE EXCEPTION 'insufficient_stock: % available, % requested for product %',
            v_stock, NEW.quantity, NEW.inventory_id
            USING ERRCODE = 'P0001';
    END IF;

    UPDATE inventory SET stock = stock - NEW.quantity WHERE id = NEW.inventory_id;

    IF v_has_expiration THEN
        PERFORM reduce_expiration_batches(NEW.inventory_id, NEW.quantity);
    END IF;

    RETURN NEW;
END;
$$;

-- Al cancelar una compra se restaura el stock de sus productos.
-- (Antes este trigger descontaba stock en pending→completed; ese
--  descuento ahora ocurre al insertar los items, así que la
--  transición a completed/delivered ya no toca el inventario.)
CREATE OR REPLACE FUNCTION purchase_complete_stock_adjust()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    item RECORD;
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
        FOR item IN
            SELECT inventory_id, quantity FROM purchase_items WHERE purchase_id = NEW.id
        LOOP
            UPDATE inventory SET stock = stock + item.quantity WHERE id = item.inventory_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;
