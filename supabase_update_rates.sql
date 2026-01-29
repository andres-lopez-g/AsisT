-- ===========================================================================
-- UPDATE EXCHANGE RATES
-- ===========================================================================
-- Use this script to update exchange rates in your Supabase database
-- Run this periodically to keep rates current
-- ===========================================================================

-- Update all exchange rates with current values
-- Replace these rates with current market rates before running

UPDATE exchange_rates SET rate = 1.000000, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'USD' AND to_currency = 'USD';

UPDATE exchange_rates SET rate = 0.920000, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'USD' AND to_currency = 'EUR';

UPDATE exchange_rates SET rate = 4000.000000, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'USD' AND to_currency = 'COP';

UPDATE exchange_rates SET rate = 1.086957, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'EUR' AND to_currency = 'USD';

UPDATE exchange_rates SET rate = 1.000000, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'EUR' AND to_currency = 'EUR';

UPDATE exchange_rates SET rate = 4347.826087, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'EUR' AND to_currency = 'COP';

UPDATE exchange_rates SET rate = 0.000250, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'COP' AND to_currency = 'USD';

UPDATE exchange_rates SET rate = 0.000230, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'COP' AND to_currency = 'EUR';

UPDATE exchange_rates SET rate = 1.000000, updated_at = CURRENT_TIMESTAMP 
WHERE from_currency = 'COP' AND to_currency = 'COP';

-- Verify the updates
SELECT 
  from_currency || ' -> ' || to_currency AS conversion,
  rate,
  updated_at
FROM exchange_rates 
ORDER BY from_currency, to_currency;
