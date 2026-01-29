# Multi-Currency Support - Database Migration Guide

## Overview
This migration adds support for multiple currencies (USD, EUR, COP) to the AsisT finance application.

## What Gets Added
- Currency field to `transactions` table
- Currency field to `debts` table  
- Currency field to `recurring_transactions` table
- New `exchange_rates` table for currency conversions
- Default exchange rates for USD, EUR, and COP

## How to Run the Migration in Supabase

### Step 1: Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Navigate to your project
3. Go to the **SQL Editor** (usually in the left sidebar)

### Step 2: Run the Migration Script
1. Open the file: `supabase_currency_migration.sql`
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute the migration

### Step 3: Verify the Migration
After running the migration, you should see:
- ✅ Currency columns added to transactions and debts tables
- ✅ Exchange rates table created with 9 rows (3 currencies × 3 conversions)
- ✅ All existing records have 'USD' as default currency

## Updating Exchange Rates

Exchange rates can become outdated. To update them:

1. Get current exchange rates from a reliable source (e.g., XE.com, Google Finance)
2. Open `supabase_update_rates.sql`
3. Update the rate values with current rates
4. Run the script in Supabase SQL Editor

## Current Exchange Rates (as of migration)

| From | To  | Rate       |
|------|-----|------------|
| USD  | EUR | 0.920000   |
| USD  | COP | 4000.00    |
| EUR  | USD | 1.086957   |
| EUR  | COP | 4347.83    |
| COP  | USD | 0.000250   |
| COP  | EUR | 0.000230   |

## Troubleshooting

### Issue: "column already exists"
**Solution**: This is normal if you run the migration twice. The script uses `ADD COLUMN IF NOT EXISTS` to safely skip existing columns.

### Issue: "relation does not exist"
**Solution**: Make sure you've run the base schema migrations first. Check that these tables exist:
- `transactions`
- `debts`
- `recurring_transactions` (optional, created by smart features migration)

### Issue: "permission denied"
**Solution**: Make sure you're using a database role with sufficient permissions. In Supabase, use the SQL Editor which automatically uses the correct role.

## Rolling Back (if needed)

If you need to remove the currency support:

```sql
-- Remove currency columns
ALTER TABLE transactions DROP COLUMN IF EXISTS currency;
ALTER TABLE debts DROP COLUMN IF EXISTS currency;
ALTER TABLE recurring_transactions DROP COLUMN IF EXISTS currency;

-- Remove exchange rates table
DROP TABLE IF EXISTS exchange_rates;
```

## What This Enables

After running this migration, the application will:
- ✅ Allow users to select currency (USD/EUR/COP) when creating transactions
- ✅ Allow users to select currency when creating debts
- ✅ Display amounts with the correct currency symbol
- ✅ Store exchange rates for future conversion features
- ✅ Fix the forecast update issue (transactions prop passed to ForecastChart)

## Next Steps

After running the migration:
1. Restart your application server to load the new schema
2. Test creating transactions in different currencies
3. Verify that currency symbols display correctly
4. Check that the forecast chart updates when you add/edit transactions
