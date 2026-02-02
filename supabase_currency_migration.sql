-- ===========================================================================
-- MULTI-CURRENCY SUPPORT MIGRATION FOR SUPABASE
-- ===========================================================================
-- This script adds multi-currency support (USD, EUR, COP) to the AsisT app
-- Run this in your Supabase SQL Editor
-- ===========================================================================

-- Step 1: Add currency columns to existing tables
-- ===========================================================================

-- Add currency column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));

-- Add currency column to debts table
ALTER TABLE debts
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));

-- Add currency column to recurring_transactions table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_transactions') THEN
        ALTER TABLE recurring_transactions
        ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));
    END IF;
END $$;

-- Step 2: Create exchange_rates table
-- ===========================================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL CHECK (from_currency IN ('USD', 'EUR', 'COP')),
  to_currency VARCHAR(3) NOT NULL CHECK (to_currency IN ('USD', 'EUR', 'COP')),
  rate DECIMAL(10, 6) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency)
);

-- Create index for faster currency conversion lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies 
ON exchange_rates(from_currency, to_currency);

-- Step 3: Insert default exchange rates
-- ===========================================================================
-- Note: These are approximate rates as of 2026. Update these with current rates.

INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  -- USD to others
  ('USD', 'USD', 1.000000),
  ('USD', 'EUR', 0.920000),
  ('USD', 'COP', 4000.000000),
  -- EUR to others
  ('EUR', 'USD', 1.086957),
  ('EUR', 'EUR', 1.000000),
  ('EUR', 'COP', 4347.826087),
  -- COP to others
  ('COP', 'USD', 0.000250),
  ('COP', 'EUR', 0.000230),
  ('COP', 'COP', 1.000000)
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET 
  rate = EXCLUDED.rate,
  updated_at = CURRENT_TIMESTAMP;

-- Step 4: Verify the migration
-- ===========================================================================

-- Check that currency columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'currency';

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'debts' AND column_name = 'currency';

-- Check exchange rates
SELECT * FROM exchange_rates ORDER BY from_currency, to_currency;

-- ===========================================================================
-- MIGRATION COMPLETE
-- ===========================================================================
-- All existing records will have 'USD' as the default currency
-- New transactions and debts can specify EUR or COP
-- ===========================================================================
