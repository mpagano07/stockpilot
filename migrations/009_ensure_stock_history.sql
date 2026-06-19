-- Ensure stock_history table exists with the full schema.
-- This handles the case where the initial schema migration was not run.
-- Uses DO block to check table existence first.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stock_history') THEN
    CREATE TABLE public.stock_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
      reason TEXT,
      created_by UUID NOT NULL REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their tenant stock history"
      ON public.stock_history FOR SELECT
      USING (
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
      );

    CREATE INDEX IF NOT EXISTS idx_stock_history_tenant_id ON stock_history(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
  ELSE
    -- Table exists; ensure the CHECK constraint includes 'adjustment'
    BEGIN
      ALTER TABLE public.stock_history DROP CONSTRAINT IF EXISTS stock_history_type_check;
      ALTER TABLE public.stock_history ADD CONSTRAINT stock_history_type_check
        CHECK (type IN ('in', 'out', 'adjustment'));
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not update stock_history type constraint: %', SQLERRM;
    END;
  END IF;
END $$;
