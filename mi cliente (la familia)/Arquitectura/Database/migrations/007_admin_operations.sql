-- Admin operations, immutable finance records, and delivery coordinates.

ALTER TABLE shop_config
  ADD COLUMN IF NOT EXISTS express_surcharge NUMERIC(8,2) NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC(10,2);

ALTER TABLE user_addresses
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(12) NOT NULL DEFAULT 'expense',
  ADD COLUMN IF NOT EXISTS reverses_expense_id UUID REFERENCES expenses(id),
  ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_entry_type_check') THEN
    ALTER TABLE expenses ADD CONSTRAINT expenses_entry_type_check
      CHECK (entry_type IN ('expense', 'reversal'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_single_reversal
  ON expenses(reverses_expense_id) WHERE reverses_expense_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_addresses_coordinates
  ON user_addresses(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
