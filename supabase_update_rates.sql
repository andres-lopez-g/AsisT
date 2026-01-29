-- ===========================================================================
-- UPDATE EXCHANGE RATES (DEPRECATED - USE AUTOMATED UPDATES INSTEAD)
-- ===========================================================================
-- ⚠️ DEPRECATION NOTICE:
-- This manual script is no longer needed!
-- The application now automatically updates exchange rates every 24 hours
-- using a free API from open.exchangerate-api.com
--
-- To manually trigger an update, use the API endpoint instead:
-- POST /api/finance/exchange-rates/update
--
-- This script is kept only for reference or emergency fallback.
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
