-- Ensure stock_history.type CHECK constraint includes 'adjustment'
-- Some installations may have an older table schema that predates the full migration.

ALTER TABLE stock_history DROP CONSTRAINT IF EXISTS stock_history_type_check;

ALTER TABLE stock_history ADD CONSTRAINT stock_history_type_check
  CHECK (type IN ('in', 'out', 'adjustment'));
