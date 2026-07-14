BEGIN;

CREATE TABLE IF NOT EXISTS product_reviews (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID        NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_id  UUID        NOT NULL REFERENCES purchases(id) ON DELETE RESTRICT,
    rating       SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT        NOT NULL CHECK (char_length(btrim(comment)) BETWEEN 10 AND 1000),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_reviews_user_inventory UNIQUE (user_id, inventory_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_inventory_created
    ON product_reviews(inventory_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER trg_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
