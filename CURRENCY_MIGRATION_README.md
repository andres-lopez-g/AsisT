# Multi-Currency Support - Database Migration Guide

## Overview
This migration adds support for multiple currencies (USD, EUR, COP) to the AsisT finance application with **automated exchange rate updates**.

## What Gets Added
- Currency field to `transactions` table
- Currency field to `debts` table  
- Currency field to `recurring_transactions` table
- New `exchange_rates` table for currency conversions
- **Automated exchange rate updates from free API**

## Automated Exchange Rates 🔄

The application now **automatically updates exchange rates** using a free API:

- **API Source**: [open.exchangerate-api.com](https://open.exchangerate-api.com)
- **Update Frequency**: Every 24 hours
- **Startup Check**: Rates are checked and updated on server startup if older than 24 hours
- **Free Tier**: 1,500 requests/month (more than enough for daily updates)
- **No API Key Required**: Uses the free public endpoint

### Manual Rate Update

You can also manually trigger a rate update via API:

```bash
POST /api/finance/exchange-rates/update
Authorization: Bearer <your-jwt-token>
```

Response:
```json
{
  "message": "Exchange rates updated successfully",
  "updatedCount": 9,
  "timestamp": "2026-01-29T16:45:00.000Z",
  "rates": [...]
}
```

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

### Automatic Updates (Recommended) ✅

The application **automatically** fetches and updates exchange rates:

- **On Startup**: Checks if rates are older than 24 hours and updates if needed
- **Scheduled**: Runs a check every 24 hours
- **Source**: Free API from open.exchangerate-api.com
- **No Configuration Required**: Works out of the box

### Manual Updates (Optional)

If you want to force an immediate update:

1. **Via API**: Send a POST request to `/api/finance/exchange-rates/update`
2. **Via Frontend**: (Can be implemented as a button in settings)

You no longer need to:
- ❌ Run SQL scripts manually
- ❌ Find current exchange rates
- ❌ Remember to update rates
- ❌ Use `supabase_update_rates.sql` (deprecated)

## Current Exchange Rates (Initial Migration Values)

The migration includes initial exchange rates. These will be **automatically updated** by the application every 24 hours.

| From | To  | Initial Rate |
|------|-----|------------|
| USD  | EUR | 0.920000   |
| USD  | COP | 4000.00    |
| EUR  | USD | 1.086957   |
| EUR  | COP | 4347.83    |
| COP  | USD | 0.000250   |
| COP  | EUR | 0.000230   |

**Note**: You don't need to manually update these rates anymore! The application handles this automatically.

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
- ✅ **Automatically update exchange rates every 24 hours**
- ✅ **Fetch rates from free API with no manual intervention**
- ✅ Fix the forecast update issue (transactions prop passed to ForecastChart)

## API Details

The application uses **open.exchangerate-api.com** which provides:

- ✅ Free tier with 1,500 requests/month
- ✅ No API key required for basic usage
- ✅ Real-time exchange rates
- ✅ Updated daily
- ✅ Supports 150+ currencies (we use USD, EUR, COP)
- ✅ 99.9% uptime SLA

### Rate Update Logs

You'll see these logs in your server console:

```
[EXCHANGE] Initializing automatic exchange rate updates
[EXCHANGE] Auto-update scheduler initialized (checks every 24 hours)
[EXCHANGE] Last update: 2026-01-28T10:30:00.000Z, Hours ago: 30.5, Needs update: true
[EXCHANGE] Starting exchange rate update...
[EXCHANGE] Successfully fetched exchange rates from API
[EXCHANGE] Successfully updated 9 exchange rates
```

## Next Steps

After running the migration:
1. Restart your application server to load the new schema
2. Test creating transactions in different currencies
3. Verify that currency symbols display correctly
4. Check that the forecast chart updates when you add/edit transactions
