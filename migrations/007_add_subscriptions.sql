-- Add subscription fields to tenants table

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'incomplete'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'business', 'enterprise'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
