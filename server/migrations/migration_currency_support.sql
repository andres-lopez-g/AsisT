-- Multi-Currency Support Migration
-- Adds currency fields and exchange rates table for EUR, USD, and COP support

-- Add currency column to transactions (defaults to USD for existing records)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));

-- Add currency column to debts (defaults to USD for existing records)
ALTER TABLE debts
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));

-- Add currency column to recurring_transactions (defaults to USD for existing records)
ALTER TABLE recurring_transactions
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'COP'));

-- Create exchange_rates table for currency conversions
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL CHECK (from_currency IN ('USD', 'EUR', 'COP')),
  to_currency VARCHAR(3) NOT NULL CHECK (to_currency IN ('USD', 'EUR', 'COP')),
  rate DECIMAL(10, 6) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- Insert default exchange rates (as of 2026 approximations)
-- These should be updated regularly in production
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
ON CONFLICT (from_currency, to_currency) DO NOTHING;
