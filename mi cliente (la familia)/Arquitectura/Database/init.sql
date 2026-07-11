-- =============================================================
--  SHOP MANAGEMENT SYSTEM — Complete PostgreSQL Schema
--  Covers: inventory, suppliers, purchase orders, stock receipts,
--  expiration, employees, shifts, customers, sales, returns,
--  till, expenses, price history, barcodes, promotions,
--  delivery zones, users, sessions, notifications.
-- =============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
--  SHARED ENUMS
-- =============================================================
CREATE TYPE shift_code       AS ENUM ('morning', 'afternoon');
CREATE TYPE payment_method   AS ENUM ('cash', 'card', 'paypal');
CREATE TYPE delivery_method  AS ENUM ('on_spot', 'home_delivery', 'pickup');
CREATE TYPE purchase_status  AS ENUM ('pending', 'completed', 'cancelled', 'preparing', 'shipped', 'delivered');
CREATE TYPE refund_method    AS ENUM ('cash', 'card');
CREATE TYPE return_reason    AS ENUM ('defective', 'wrong_item', 'expired', 'customer_changed_mind', 'other');
CREATE TYPE po_status        AS ENUM ('draft', 'sent', 'partial', 'received', 'cancelled');
CREATE TYPE audit_type       AS ENUM ('open', 'close', 'count', 'adjustment');
CREATE TYPE till_movement_type AS ENUM ('float_in', 'float_out', 'sale', 'refund', 'expense', 'correction');
CREATE TYPE user_role        AS ENUM ('admin', 'manager', 'cashier', 'stock', 'customer');
CREATE TYPE login_event      AS ENUM ('success', 'failed', 'logout', 'password_changed');
CREATE TYPE notification_type AS ENUM (
    'expiry_warning', 'expired_removed', 'low_stock',
    'promo_created',  'cash_discrepancy'
);

-- =============================================================
--  SHARED TRIGGER FUNCTION  — keeps updated_at current
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- =============================================================
--  SHOP CONFIG  (single row — store location & settings)
-- =============================================================
CREATE TABLE shop_config (
    id          INT         PRIMARY KEY DEFAULT 1,
    shop_name   VARCHAR(120) NOT NULL,
    address     TEXT,
    latitude    NUMERIC(9,6),
    longitude   NUMERIC(9,6),
    currency    CHAR(3)     NOT NULL DEFAULT 'MXN',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

CREATE TRIGGER trg_shop_config_updated_at
BEFORE UPDATE ON shop_config
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  CATEGORIES  (hierarchical)
-- =============================================================
CREATE TABLE categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   UUID        REFERENCES categories(id),
    name        VARCHAR(80) NOT NULL,
    slug        VARCHAR(80) NOT NULL UNIQUE
);

-- =============================================================
--  UNITS OF MEASURE
-- =============================================================
CREATE TABLE units_of_measure (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(40) NOT NULL UNIQUE,
    abbreviation VARCHAR(10) NOT NULL UNIQUE
);

-- =============================================================
--  SUPPLIERS
-- =============================================================
CREATE TABLE suppliers (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(120) NOT NULL,
    contact_name VARCHAR(120),
    phone        VARCHAR(30),
    email        VARCHAR(120),
    address      TEXT,
    notes        TEXT,
    active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
--  INVENTORY
-- =============================================================
CREATE TABLE inventory (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(120)  NOT NULL,
    sku            VARCHAR(60)   UNIQUE,
    description    TEXT,
    category_id    UUID          REFERENCES categories(id),
    uom_id         UUID          REFERENCES units_of_measure(id),
    price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    cost           NUMERIC(10,2)           CHECK (cost >= 0),
    stock          INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock      INTEGER       NOT NULL DEFAULT 0,
    has_expiration BOOLEAN       NOT NULL DEFAULT FALSE,
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Price History (auto-logged on every price change) ───────
CREATE TABLE price_history (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID          NOT NULL REFERENCES inventory(id),
    old_price    NUMERIC(10,2),
    new_price    NUMERIC(10,2) NOT NULL,
    changed_by   UUID,                        -- FK to users added after users table
    changed_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.price IS DISTINCT FROM NEW.price THEN
        INSERT INTO price_history (inventory_id, old_price, new_price)
        VALUES (NEW.id, OLD.price, NEW.price);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_price_change
AFTER UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION log_price_change();

-- ─── Product Barcodes (one product → many barcodes) ──────────
CREATE TABLE product_barcodes (
    barcode      VARCHAR(60) PRIMARY KEY,
    inventory_id UUID        NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    description  VARCHAR(80)
);

CREATE INDEX idx_barcodes_item ON product_barcodes(inventory_id);

-- ─── Supplier ↔ Inventory (many-to-many) ─────────────────────
CREATE TABLE supplier_items (
    supplier_id    UUID          NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    inventory_id   UUID          NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    supplier_sku   VARCHAR(60),
    supplier_price NUMERIC(10,2),
    is_preferred   BOOLEAN       NOT NULL DEFAULT FALSE,
    PRIMARY KEY (supplier_id, inventory_id)
);

-- =============================================================
--  PURCHASE ORDERS TO SUPPLIERS
-- =============================================================
CREATE TABLE purchase_orders (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id   UUID      NOT NULL REFERENCES suppliers(id),
    employee_id   UUID,                              -- FK to employees, added below
    status        po_status NOT NULL DEFAULT 'draft',
    expected_date DATE,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE purchase_order_items (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID          NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_id      UUID          NOT NULL REFERENCES inventory(id),
    quantity_ordered  INTEGER       NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER       NOT NULL DEFAULT 0,
    unit_cost         NUMERIC(10,2)
);

-- =============================================================
--  STOCK RECEIPTS
-- =============================================================
CREATE TABLE stock_receipts (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id      UUID          NOT NULL REFERENCES inventory(id),
    supplier_id       UUID          REFERENCES suppliers(id),
    purchase_order_id UUID          REFERENCES purchase_orders(id),
    quantity          INTEGER       NOT NULL CHECK (quantity > 0),
    cost_per_unit     NUMERIC(10,2),
    expiration_date   DATE,
    received_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    notes             TEXT
);

CREATE OR REPLACE FUNCTION receipt_add_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE inventory SET stock = stock + NEW.quantity
    WHERE  id = NEW.inventory_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_receipt_add_stock
AFTER INSERT ON stock_receipts
FOR EACH ROW EXECUTE FUNCTION receipt_add_stock();

-- =============================================================
--  EXPIRATION BATCHES
-- =============================================================
CREATE TABLE expiration_batches (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id    UUID        NOT NULL REFERENCES inventory(id),
    receipt_id      UUID        REFERENCES stock_receipts(id),
    quantity        INTEGER     NOT NULL CHECK (quantity >= 0),
    expiration_date DATE        NOT NULL,
    notified        BOOLEAN     NOT NULL DEFAULT FALSE,
    removed         BOOLEAN     NOT NULL DEFAULT FALSE,
    removed_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exp_batches_date ON expiration_batches(expiration_date) WHERE removed = FALSE;
CREATE INDEX idx_exp_batches_item ON expiration_batches(inventory_id);

-- =============================================================
--  EXPIRED ITEM LOG
-- =============================================================
CREATE TABLE expired_log (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id     UUID        NOT NULL REFERENCES inventory(id),
    batch_id         UUID        REFERENCES expiration_batches(id),
    quantity_removed INTEGER     NOT NULL,
    expiration_date  DATE        NOT NULL,
    removed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason           VARCHAR(80) NOT NULL DEFAULT 'expired'
);

-- =============================================================
--  EMPLOYEES
-- =============================================================
CREATE TABLE employees (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(80) NOT NULL,
    last_name  VARCHAR(80) NOT NULL,
    phone      VARCHAR(30),
    email      VARCHAR(120),
    role       VARCHAR(60) NOT NULL DEFAULT 'cashier',
    pin        CHAR(4),
    active     BOOLEAN     NOT NULL DEFAULT TRUE,
    hired_at   DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE purchase_orders
    ADD CONSTRAINT fk_po_employee FOREIGN KEY (employee_id) REFERENCES employees(id);

-- =============================================================
--  SCHEDULES & SHIFT COVERS
-- =============================================================
CREATE TABLE schedules (
    id          UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID       NOT NULL REFERENCES employees(id),
    work_date   DATE       NOT NULL,
    shift       shift_code NOT NULL,
    UNIQUE (employee_id, work_date, shift)
);

CREATE INDEX idx_schedules_date     ON schedules(work_date);
CREATE INDEX idx_schedules_employee ON schedules(employee_id);

CREATE TABLE shift_covers (
    id                   UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id          UUID       NOT NULL REFERENCES schedules(id),
    original_employee_id UUID       NOT NULL REFERENCES employees(id),
    covering_employee_id UUID       NOT NULL REFERENCES employees(id),
    work_date            DATE       NOT NULL,
    shift                shift_code NOT NULL,
    discount_applied     BOOLEAN    NOT NULL DEFAULT FALSE,
    notes                TEXT,
    registered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shift_covers_date ON shift_covers(work_date);

-- =============================================================
--  USERS & AUTHENTICATION
-- =============================================================
CREATE TABLE users (
    id                   UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id          UUID      UNIQUE REFERENCES employees(id) ON DELETE SET NULL,
    username             VARCHAR(60) NOT NULL UNIQUE,
    password_hash        TEXT        NOT NULL,
    google_id            TEXT        UNIQUE,
    role                 user_role   NOT NULL DEFAULT 'customer',
    active               BOOLEAN     NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE price_history
    ADD CONSTRAINT fk_price_history_user FOREIGN KEY (changed_by) REFERENCES users(id);

CREATE TABLE user_sessions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT        NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '8 hours',
    revoked    BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessions_token ON user_sessions(token_hash) WHERE revoked = FALSE;
CREATE INDEX idx_sessions_user  ON user_sessions(user_id);

CREATE TABLE password_reset_tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT        NOT NULL UNIQUE,
    used       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE TABLE login_audit (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    username   VARCHAR(60),
    event      login_event NOT NULL,
    ip_address INET,
    user_agent TEXT,
    detail     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_audit_user ON login_audit(user_id);
CREATE INDEX idx_login_audit_date ON login_audit(created_at);

-- =============================================================
--  CUSTOMERS
-- =============================================================
CREATE TABLE customers (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(120) NOT NULL,
    phone      VARCHAR(30),
    email      VARCHAR(120),
    address    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
--  DELIVERY ZONES
-- =============================================================
CREATE TABLE delivery_zones (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(80)   NOT NULL,
    min_km      NUMERIC(6,2)  NOT NULL DEFAULT 0,
    max_km      NUMERIC(6,2)  NOT NULL,
    base_fee    NUMERIC(8,2)  NOT NULL,
    fee_per_km  NUMERIC(8,2)  NOT NULL DEFAULT 0,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_by  UUID          REFERENCES users(id),
    CONSTRAINT no_negative_distance CHECK (min_km >= 0 AND max_km > min_km),
    CONSTRAINT no_negative_fee      CHECK (base_fee >= 0 AND fee_per_km >= 0)
);

CREATE TRIGGER trg_delivery_zones_updated_at
BEFORE UPDATE ON delivery_zones
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_delivery_zones_active ON delivery_zones(min_km, max_km) WHERE active = TRUE;

CREATE TABLE delivery_zone_audit (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id        UUID          NOT NULL REFERENCES delivery_zones(id),
    changed_by     UUID          REFERENCES users(id),
    old_base_fee   NUMERIC(8,2),
    new_base_fee   NUMERIC(8,2),
    old_fee_per_km NUMERIC(8,2),
    new_fee_per_km NUMERIC(8,2),
    old_max_km     NUMERIC(6,2),
    new_max_km     NUMERIC(6,2),
    changed_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_zone_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF  OLD.base_fee   IS DISTINCT FROM NEW.base_fee   OR
        OLD.fee_per_km IS DISTINCT FROM NEW.fee_per_km OR
        OLD.max_km     IS DISTINCT FROM NEW.max_km
    THEN
        INSERT INTO delivery_zone_audit (
            zone_id,
            old_base_fee,   new_base_fee,
            old_fee_per_km, new_fee_per_km,
            old_max_km,     new_max_km,
            changed_by
        ) VALUES (
            OLD.id,
            OLD.base_fee,   NEW.base_fee,
            OLD.fee_per_km, NEW.fee_per_km,
            OLD.max_km,     NEW.max_km,
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_zone_change
AFTER UPDATE ON delivery_zones
FOR EACH ROW EXECUTE FUNCTION log_zone_change();

CREATE OR REPLACE FUNCTION calculate_delivery_fee(distance_km NUMERIC)
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
    SELECT ROUND(base_fee + (fee_per_km * distance_km), 2)
    FROM   delivery_zones
    WHERE  active = TRUE
      AND  distance_km >= min_km
      AND  distance_km <  max_km
    LIMIT 1;
$$;

-- =============================================================
--  PROMOTIONS
-- =============================================================
CREATE TABLE promotions (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(120)  NOT NULL,
    description    TEXT,
    discount_pct   NUMERIC(5,2)  CHECK (discount_pct BETWEEN 0 AND 100),
    discount_fixed NUMERIC(10,2) CHECK (discount_fixed >= 0),
    inventory_id   UUID          REFERENCES inventory(id),
    auto_generated BOOLEAN       NOT NULL DEFAULT FALSE,
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    valid_from     DATE,
    valid_until    DATE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_active ON promotions(active) WHERE active = TRUE;

-- =============================================================
--  PURCHASES  (customer sales)
-- =============================================================
CREATE TABLE purchases (
    id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id          UUID            REFERENCES customers(id),
    employee_id          UUID            REFERENCES employees(id),
    delivery_method      delivery_method NOT NULL DEFAULT 'on_spot',
    delivery_address     TEXT,
    delivery_distance_km NUMERIC(8,2),
    delivery_zone_id     UUID            REFERENCES delivery_zones(id),
    delivery_fee         NUMERIC(8,2)    NOT NULL DEFAULT 0,
    payment_method       payment_method  NOT NULL,
    status               purchase_status NOT NULL DEFAULT 'completed',
    subtotal             NUMERIC(10,2)   NOT NULL DEFAULT 0,
    discount_total       NUMERIC(10,2)   NOT NULL DEFAULT 0,
    total                NUMERIC(10,2)   NOT NULL DEFAULT 0,
    cash_tendered        NUMERIC(10,2),
    change_given         NUMERIC(10,2)   GENERATED ALWAYS AS (
                             CASE WHEN cash_tendered IS NOT NULL
                             THEN cash_tendered - total ELSE NULL END
                         ) STORED,
    paypal_order_id      TEXT,
    paid_at              TIMESTAMPTZ,
    tracking_number      VARCHAR(60),
    notes                TEXT,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_date     ON purchases(created_at);
CREATE INDEX idx_purchases_employee ON purchases(employee_id);

-- ─── Purchase Line Items ──────────────────────────────────────
CREATE TABLE purchase_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id  UUID          NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    inventory_id UUID          NOT NULL REFERENCES inventory(id),
    promotion_id UUID          REFERENCES promotions(id),
    quantity     INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price   NUMERIC(10,2) NOT NULL,
    discount_pct NUMERIC(5,2)  NOT NULL DEFAULT 0,
    line_total   NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_purchase_items_inv ON purchase_items(inventory_id);

-- Shared helper: deduct from expiration batches FIFO (earliest-expiring first)
CREATE OR REPLACE FUNCTION reduce_expiration_batches(p_inventory_id UUID, p_quantity INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    batch     RECORD;
    remaining INTEGER := p_quantity;
    deduct    INTEGER;
BEGIN
    FOR batch IN
        SELECT id, quantity FROM expiration_batches
        WHERE  inventory_id = p_inventory_id
          AND  removed = FALSE
          AND  quantity > 0
        ORDER  BY expiration_date ASC
        FOR UPDATE
    LOOP
        EXIT WHEN remaining <= 0;
        deduct    := LEAST(batch.quantity, remaining);
        UPDATE expiration_batches SET quantity = quantity - deduct WHERE id = batch.id;
        remaining := remaining - deduct;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION sale_reduce_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_status         purchase_status;
    v_stock          INTEGER;
    v_has_expiration BOOLEAN;
BEGIN
    SELECT status INTO v_status FROM purchases WHERE id = NEW.purchase_id;

    -- Solo las compras canceladas no descuentan stock; una compra
    -- 'pending' del e-commerce es venta comprometida (evita sobreventa)
    IF v_status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- Lock the row and read current values atomically
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

CREATE TRIGGER trg_sale_reduce_stock
AFTER INSERT ON purchase_items
FOR EACH ROW EXECUTE FUNCTION sale_reduce_stock();

-- Al cancelar una compra se restaura el stock de sus productos
-- (el descuento ocurre al insertar los items, ver sale_reduce_stock)
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

CREATE TRIGGER trg_purchase_complete_stock_adjust
AFTER UPDATE OF status ON purchases
FOR EACH ROW EXECUTE FUNCTION purchase_complete_stock_adjust();

-- =============================================================
--  PURCHASE RETURNS / REFUNDS
-- =============================================================
CREATE TABLE purchase_returns (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id    UUID          NOT NULL REFERENCES purchases(id),
    employee_id    UUID          REFERENCES employees(id),
    refund_method  refund_method NOT NULL,
    reason         return_reason NOT NULL,
    notes          TEXT,
    total_refunded NUMERIC(10,2) NOT NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_return_items (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id        UUID          NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    purchase_item_id UUID          NOT NULL REFERENCES purchase_items(id),
    inventory_id     UUID          NOT NULL REFERENCES inventory(id),
    quantity         INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price       NUMERIC(10,2) NOT NULL,
    restock          BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE OR REPLACE FUNCTION return_restock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.restock THEN
        UPDATE inventory SET stock = stock + NEW.quantity
        WHERE  id = NEW.inventory_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_return_restock
AFTER INSERT ON purchase_return_items
FOR EACH ROW EXECUTE FUNCTION return_restock();

-- =============================================================
--  EXPENSE CATEGORIES & EXPENSES
-- =============================================================
CREATE TABLE expense_categories (
    id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE expenses (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id    UUID           REFERENCES expense_categories(id),
    employee_id    UUID           REFERENCES employees(id),
    description    TEXT           NOT NULL,
    amount         NUMERIC(10,2)  NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    receipt_ref    VARCHAR(80),
    expense_date   DATE           NOT NULL DEFAULT CURRENT_DATE,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- =============================================================
--  TILL MOVEMENTS
-- =============================================================
CREATE TABLE till_movements (
    id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id   UUID               REFERENCES employees(id),
    shift         shift_code,
    movement_type till_movement_type NOT NULL,
    amount        NUMERIC(10,2)      NOT NULL,
    reference_id  UUID,
    notes         TEXT,
    created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_till_movements_date ON till_movements(created_at);

-- =============================================================
--  CASH AUDIT
-- =============================================================
CREATE TABLE cash_audit (
    id              UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID       REFERENCES employees(id),
    shift           shift_code,
    audit_type      audit_type NOT NULL,
    expected_amount NUMERIC(10,2),
    counted_amount  NUMERIC(10,2) NOT NULL,
    difference      NUMERIC(10,2) GENERATED ALWAYS AS (
                        counted_amount - COALESCE(expected_amount, counted_amount)
                    ) STORED,
    notes           TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_audit_date ON cash_audit(created_at);

-- =============================================================
--  NOTIFICATIONS LOG
-- =============================================================
CREATE TABLE notifications (
    id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    type         notification_type NOT NULL,
    reference_id UUID,
    message      TEXT              NOT NULL,
    seen         BOOLEAN           NOT NULL DEFAULT FALSE,
    seen_by      UUID              REFERENCES users(id),
    seen_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_unseen ON notifications(created_at) WHERE seen = FALSE;

-- =============================================================
--  VIEWS
-- =============================================================

CREATE VIEW v_inventory_status AS
SELECT
    i.id,
    i.name,
    i.sku,
    c.name                                                  AS category,
    u.abbreviation                                          AS unit,
    i.price,
    i.cost,
    i.stock,
    i.min_stock,
    i.stock <= i.min_stock                                  AS low_stock,
    i.has_expiration,
    eb.expiration_date                                      AS nearest_expiration,
    (eb.expiration_date - CURRENT_DATE)::INT                  AS days_until_expiry
FROM inventory i
LEFT JOIN categories       c  ON c.id = i.category_id
LEFT JOIN units_of_measure u  ON u.id = i.uom_id
LEFT JOIN LATERAL (
    SELECT expiration_date FROM expiration_batches
    WHERE  inventory_id = i.id AND removed = FALSE
    ORDER  BY expiration_date ASC LIMIT 1
) eb ON TRUE
WHERE i.active = TRUE;

CREATE VIEW v_low_stock AS
SELECT
    i.id, i.name, i.sku,
    c.name                 AS category,
    i.stock                AS current_stock,
    i.min_stock,
    i.min_stock - i.stock  AS units_needed
FROM inventory i
LEFT JOIN categories c ON c.id = i.category_id
WHERE i.active = TRUE AND i.stock <= i.min_stock
ORDER BY (i.min_stock - i.stock) DESC;

CREATE VIEW v_daily_sales AS
SELECT
    DATE(created_at)                                              AS sale_date,
    COUNT(*)                                                      AS total_orders,
    SUM(total)                                                    AS gross_revenue,
    SUM(discount_total)                                           AS total_discounts,
    SUM(delivery_fee)                                             AS delivery_revenue,
    SUM(total) FILTER (WHERE payment_method = 'cash')             AS cash_total,
    SUM(total) FILTER (WHERE payment_method = 'card')             AS card_total
FROM purchases
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE VIEW v_financial_summary AS
SELECT
    d.sale_date,
    d.gross_revenue,
    d.delivery_revenue,
    d.total_discounts,
    COALESCE(r.total_refunded, 0)                                 AS total_refunded,
    COALESCE(e.total_expenses, 0)                                 AS total_expenses,
    d.gross_revenue + d.delivery_revenue
        - COALESCE(r.total_refunded, 0)
        - COALESCE(e.total_expenses, 0)                           AS net_revenue
FROM v_daily_sales d
LEFT JOIN (
    SELECT DATE(created_at) AS day, SUM(total_refunded) AS total_refunded
    FROM purchase_returns GROUP BY DATE(created_at)
) r ON r.day = d.sale_date
LEFT JOIN (
    SELECT expense_date AS day, SUM(amount) AS total_expenses
    FROM expenses GROUP BY expense_date
) e ON e.day = d.sale_date;

CREATE VIEW v_till_balance AS
SELECT
    shift,
    DATE(created_at)    AS drawer_date,
    SUM(amount)         AS balance
FROM till_movements
GROUP BY shift, DATE(created_at)
ORDER BY drawer_date DESC, shift;

CREATE VIEW v_shift_cover_report AS
SELECT
    sc.work_date,
    sc.shift,
    CONCAT(oe.first_name, ' ', oe.last_name) AS original_employee,
    CONCAT(ce.first_name, ' ', ce.last_name) AS covering_employee,
    sc.discount_applied,
    sc.notes
FROM shift_covers sc
JOIN employees oe ON oe.id = sc.original_employee_id
JOIN employees ce ON ce.id = sc.covering_employee_id
ORDER BY sc.work_date DESC;

CREATE VIEW v_cash_audit_summary AS
SELECT
    ca.created_at::DATE                      AS audit_date,
    ca.shift,
    CONCAT(e.first_name, ' ', e.last_name)   AS employee,
    ca.audit_type,
    ca.expected_amount,
    ca.counted_amount,
    ca.difference
FROM cash_audit ca
LEFT JOIN employees e ON e.id = ca.employee_id
ORDER BY ca.created_at DESC;

CREATE VIEW v_top_selling_items AS
SELECT
    i.id, i.name, i.sku,
    SUM(pi.quantity)   AS units_sold,
    SUM(pi.line_total) AS revenue
FROM purchase_items pi
JOIN inventory  i ON i.id = pi.inventory_id
JOIN purchases  p ON p.id = pi.purchase_id
WHERE p.status = 'completed'
GROUP BY i.id, i.name, i.sku
ORDER BY units_sold DESC;

CREATE VIEW v_price_history AS
SELECT
    ph.changed_at,
    i.name        AS item_name,
    i.sku,
    ph.old_price,
    ph.new_price,
    ph.new_price - ph.old_price  AS change_amount,
    CONCAT(u.username)           AS changed_by
FROM price_history ph
JOIN inventory i ON i.id = ph.inventory_id
LEFT JOIN users u ON u.id = ph.changed_by
ORDER BY ph.changed_at DESC;

CREATE VIEW v_return_summary AS
SELECT
    DATE(pr.created_at)                      AS return_date,
    COUNT(*)                                 AS total_returns,
    SUM(pr.total_refunded)                   AS total_refunded,
    pr.refund_method,
    pr.reason
FROM purchase_returns pr
GROUP BY DATE(pr.created_at), pr.refund_method, pr.reason
ORDER BY return_date DESC;

-- =============================================================
--  STORED PROCEDURES
-- =============================================================

CREATE OR REPLACE PROCEDURE expire_batches()
LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    FOR rec IN
        SELECT * FROM expiration_batches
        WHERE expiration_date < CURRENT_DATE AND removed = FALSE
    LOOP
        INSERT INTO expired_log (inventory_id, batch_id, quantity_removed, expiration_date)
        VALUES (rec.inventory_id, rec.id, rec.quantity, rec.expiration_date);

        UPDATE inventory
        SET stock = GREATEST(stock - rec.quantity, 0)
        WHERE id = rec.inventory_id;

        UPDATE expiration_batches
        SET removed = TRUE, removed_at = NOW()
        WHERE id = rec.id;

        INSERT INTO notifications (type, reference_id, message)
        VALUES ('expired_removed', rec.inventory_id,
                'Batch expired and removed from stock on ' || rec.expiration_date);
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE create_expiry_promotions(days_ahead INT DEFAULT 3)
LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    FOR rec IN
        SELECT DISTINCT eb.inventory_id, i.name
        FROM   expiration_batches eb
        JOIN   inventory i ON i.id = eb.inventory_id
        WHERE  eb.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
          AND  eb.removed = FALSE
          AND  NOT EXISTS (
                   SELECT 1 FROM promotions p
                   WHERE  p.inventory_id = eb.inventory_id
                     AND  p.auto_generated = TRUE
                     AND  p.active = TRUE
               )
    LOOP
        INSERT INTO promotions (
            name, description, discount_pct,
            inventory_id, auto_generated, active, valid_from, valid_until
        ) VALUES (
            'Expiry Deal — ' || rec.name,
            'Auto-promotion: expires within ' || days_ahead || ' days.',
            20, rec.inventory_id, TRUE, TRUE, CURRENT_DATE, CURRENT_DATE + days_ahead
        );

        INSERT INTO notifications (type, reference_id, message)
        VALUES ('promo_created', rec.inventory_id,
                'Auto-promotion created for ' || rec.name || ' (expires in ' || days_ahead || ' days)');
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE notify_low_stock()
LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    FOR rec IN
        SELECT id, name FROM inventory
        WHERE active = TRUE AND stock <= min_stock
          AND NOT EXISTS (
              SELECT 1 FROM notifications
              WHERE type = 'low_stock'
                AND reference_id = inventory.id
                AND seen = FALSE
          )
    LOOP
        INSERT INTO notifications (type, reference_id, message)
        VALUES ('low_stock', rec.id, rec.name || ' is at or below minimum stock level.');
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE purge_expired_sessions()
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW() OR revoked = TRUE;
END;
$$;

-- =============================================================
--  USER FLOWS (app e-commerce) — direcciones, métodos de pago
--  y compras ligadas al usuario. (Igual que migrations/001)
-- =============================================================
CREATE TABLE user_addresses (
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

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

-- Solo datos de presentación (marca, últimos 4). Nunca el PAN ni CVV.
CREATE TABLE user_payment_methods (
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

CREATE INDEX idx_user_payment_methods_user ON user_payment_methods(user_id);

ALTER TABLE purchases ADD COLUMN user_id UUID REFERENCES users(id);
CREATE INDEX idx_purchases_user ON purchases(user_id);

-- =============================================================
--  SEED DATA
-- =============================================================

INSERT INTO shop_config (shop_name, address, latitude, longitude)
VALUES ('Mi Tienda', 'Calle Principal 123, Córdoba, Ver.', 18.883, -96.9166);

INSERT INTO units_of_measure (name, abbreviation) VALUES
    ('Unit', 'u'), ('Kilogram', 'kg'), ('Gram', 'g'),
    ('Liter', 'L'), ('Milliliter', 'ml'),
    ('Box', 'box'), ('Pack', 'pack'), ('Dozen', 'doz');

INSERT INTO categories (name, slug) VALUES
    ('Dairy',         'dairy'),
    ('Beverages',     'beverages'),
    ('Bakery',        'bakery'),
    ('Cleaning',      'cleaning'),
    ('Snacks',        'snacks'),
    ('Frozen',        'frozen'),
    ('Personal Care', 'personal-care'),
    ('Canned Goods',  'canned-goods');

INSERT INTO expense_categories (name) VALUES
    ('Rent'), ('Electricity'), ('Water'), ('Internet'),
    ('Cleaning Supplies'), ('Packaging'), ('Maintenance'), ('Miscellaneous');

INSERT INTO delivery_zones (name, min_km, max_km, base_fee, fee_per_km) VALUES
    ('Local',    0.0,  2.0,  15.00, 0.00),
    ('Nearby',   2.0,  5.0,  25.00, 3.00),
    ('Standard', 5.0, 10.0,  40.00, 5.00),
    ('Far',     10.0, 20.0,  70.00, 7.50);

INSERT INTO employees (first_name, last_name, role, pin) VALUES
    ('Ana',    'García', 'manager', '1234'),
    ('Luis',   'Pérez',  'cashier', '5678'),
    ('Marta',  'López',  'cashier', '9012'),
    ('Carlos', 'Ruiz',   'stock',   '3456');

INSERT INTO suppliers (name, contact_name, phone, email) VALUES
    ('Distribuidora Central', 'Jorge Méndez', '555-1001', 'jorge@distcentral.com'),
    ('Lácteos del Norte',     'Sofía Ramos',  '555-2002', 'sofia@lacteosn.com'),
    ('Bebidas Express',       'Tomás Cruz',   '555-3003', 'tomas@bebexp.com');

INSERT INTO inventory (name, sku, price, cost, stock, min_stock, has_expiration,
                       category_id, uom_id) VALUES
    ('Leche entera 1L',     'LAC-001', 22.00, 15.00,  40, 10, TRUE,
        (SELECT id FROM categories WHERE slug='dairy'),
        (SELECT id FROM units_of_measure WHERE abbreviation='L')),
    ('Yogur natural 200g',  'LAC-002', 14.50,  9.00,  30,  5, TRUE,
        (SELECT id FROM categories WHERE slug='dairy'),
        (SELECT id FROM units_of_measure WHERE abbreviation='u')),
    ('Agua 500ml',          'BEB-001',  8.00,  4.50, 100, 20, FALSE,
        (SELECT id FROM categories WHERE slug='beverages'),
        (SELECT id FROM units_of_measure WHERE abbreviation='ml')),
    ('Refresco cola 355ml', 'BEB-002', 16.00, 10.00,  80, 15, FALSE,
        (SELECT id FROM categories WHERE slug='beverages'),
        (SELECT id FROM units_of_measure WHERE abbreviation='ml')),
    ('Pan de caja',         'PAN-001', 38.00, 25.00,  20,  5, TRUE,
        (SELECT id FROM categories WHERE slug='bakery'),
        (SELECT id FROM units_of_measure WHERE abbreviation='u')),
    ('Jabón de manos',      'LIM-001', 28.00, 18.00,  50, 10, FALSE,
        (SELECT id FROM categories WHERE slug='cleaning'),
        (SELECT id FROM units_of_measure WHERE abbreviation='u'));

INSERT INTO product_barcodes (barcode, inventory_id, description) VALUES
    ('7501055300058', (SELECT id FROM inventory WHERE sku='LAC-001'), '1L carton'),
    ('7501234500012', (SELECT id FROM inventory WHERE sku='BEB-001'), '500ml bottle'),
    ('7501234500013', (SELECT id FROM inventory WHERE sku='BEB-002'), '355ml can');

INSERT INTO supplier_items (supplier_id, inventory_id, is_preferred) VALUES
    ((SELECT id FROM suppliers WHERE name='Lácteos del Norte'),
     (SELECT id FROM inventory  WHERE sku='LAC-001'), TRUE),
    ((SELECT id FROM suppliers WHERE name='Lácteos del Norte'),
     (SELECT id FROM inventory  WHERE sku='LAC-002'), TRUE),
    ((SELECT id FROM suppliers WHERE name='Bebidas Express'),
     (SELECT id FROM inventory  WHERE sku='BEB-001'), TRUE),
    ((SELECT id FROM suppliers WHERE name='Bebidas Express'),
     (SELECT id FROM inventory  WHERE sku='BEB-002'), TRUE),
    ((SELECT id FROM suppliers WHERE name='Distribuidora Central'),
     (SELECT id FROM inventory  WHERE sku='PAN-001'), TRUE),
    ((SELECT id FROM suppliers WHERE name='Distribuidora Central'),
     (SELECT id FROM inventory  WHERE sku='LIM-001'), TRUE);

INSERT INTO expiration_batches (inventory_id, quantity, expiration_date) VALUES
    ((SELECT id FROM inventory WHERE sku='LAC-001'), 40, CURRENT_DATE + 2),
    ((SELECT id FROM inventory WHERE sku='LAC-002'), 30, CURRENT_DATE + 5),
    ((SELECT id FROM inventory WHERE sku='PAN-001'), 20, CURRENT_DATE + 1);

INSERT INTO schedules (employee_id, work_date, shift) VALUES
    ((SELECT id FROM employees WHERE first_name='Ana'),   CURRENT_DATE,     'morning'),
    ((SELECT id FROM employees WHERE first_name='Luis'),  CURRENT_DATE,     'afternoon'),
    ((SELECT id FROM employees WHERE first_name='Marta'), CURRENT_DATE + 1, 'morning'),
    ((SELECT id FROM employees WHERE first_name='Carlos'),CURRENT_DATE + 1, 'afternoon');

-- NOTE: passwords MUST be bcrypt-hashed by the app before inserting in production
INSERT INTO users (employee_id, username, role, must_change_password, password_hash) VALUES
    ((SELECT id FROM employees WHERE first_name='Ana'),
     'ana.garcia',  'admin',   TRUE, '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH'),
    ((SELECT id FROM employees WHERE first_name='Luis'),
     'luis.perez',  'cashier', TRUE, '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH'),
    ((SELECT id FROM employees WHERE first_name='Marta'),
     'marta.lopez', 'cashier', TRUE, '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH'),
    ((SELECT id FROM employees WHERE first_name='Carlos'),
     'carlos.ruiz', 'stock',   TRUE, '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH');

INSERT INTO cash_audit (employee_id, shift, audit_type, counted_amount, notes)
VALUES (
    (SELECT id FROM employees WHERE first_name='Ana'),
    'morning', 'open', 500.00, 'Opening float'
);

INSERT INTO till_movements (employee_id, shift, movement_type, amount, notes)
VALUES (
    (SELECT id FROM employees WHERE first_name='Ana'),
    'morning', 'float_in', 500.00, 'Opening float added to drawer'
);

-- Administradores Iniciales (Formato estándar)

INSERT INTO employees (first_name, last_name, email, role) VALUES
    ('Carlos',    'Admin', 'carlos@gmail.com',    'admin'),
    ('Christian', 'Admin', 'christian@gmail.com', 'admin'),
    ('Zahid',     'Admin', 'zahid@gmail.com',     'admin'),
    ('Kevin',     'Admin', 'kevin@gmail.com',     'admin');

INSERT INTO users (employee_id, username, role, must_change_password, password_hash) VALUES
    ((SELECT id FROM employees WHERE email='carlos@gmail.com'),
     'carlos@gmail.com', 'admin', FALSE, '$2b$10$VMmzRJuXnCxjo3AzlcKkfeqAO0oUEXC9GGAWD30oG8mN.sMR13Vja'),
    ((SELECT id FROM employees WHERE email='christian@gmail.com'),
     'christian@gmail.com', 'admin', FALSE, '$2b$10$opEyHQUBnlS50ma9RZQ03u4ynNeN2FVVU7YIlquxtGSzDIC0uGERO'),
    ((SELECT id FROM employees WHERE email='zahid@gmail.com'),
     'zahid@gmail.com', 'admin', FALSE, '$2b$10$rtwF4HzCwwywB.wtFJNnpunehPW5ACpkG5BFXDemzBnGqEQfgBQnW'),
    ((SELECT id FROM employees WHERE email='kevin@gmail.com'),
     'kevin@gmail.com', 'admin', FALSE, '$2b$10$uwR6ujIhxhghyxeuvdydYeo28mMfMLUH08pCTY9QOvOaFaNbvOyBy');
