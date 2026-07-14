BEGIN;

CREATE TABLE IF NOT EXISTS inventory_movements (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id   UUID        NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    user_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
    movement_type  VARCHAR(20) NOT NULL CHECK (movement_type IN ('entry', 'exit')),
    quantity_delta INTEGER     NOT NULL CHECK (quantity_delta <> 0),
    previous_stock INTEGER     NOT NULL CHECK (previous_stock >= 0),
    new_stock      INTEGER     NOT NULL CHECK (new_stock >= 0),
    reason         VARCHAR(80) NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory
    ON inventory_movements(inventory_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at
    ON inventory_movements(created_at DESC);

COMMIT;
