# Quick Start Guide: Multi-Currency + Automated Exchange Rates

## What You Need to Do

### 1. Run the Database Migration (ONE TIME ONLY)

Open your **Supabase SQL Editor** and run:

📄 **File**: `supabase_currency_migration.sql`

**That's it!** This is the ONLY script you need to run manually.

### 2. Deploy Your Application

Push your code to production (Vercel, Render, etc.)

**The exchange rates will automatically update!** 🎉

## What Happens Automatically

Once deployed, the application will:

1. ✅ Start the server
2. ✅ Wait 5 seconds (for database connections)
3. ✅ Check if exchange rates are older than 24 hours
4. ✅ If yes → Fetch fresh rates from free API
5. ✅ Update database with new rates
6. ✅ Repeat check every 24 hours

**You never need to manually update rates again!**

## Scripts Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `supabase_currency_migration.sql` | ✅ **RUN THIS** | One-time setup in Supabase |
| `supabase_update_rates.sql` | ⚠️ Deprecated | Emergency fallback only |
| Backend code | ✅ Auto-runs | No action needed |

## Verification

After deployment, check your server logs:

```bash
# You should see these messages:
[EXCHANGE] Initializing automatic exchange rate updates
[EXCHANGE] Auto-update scheduler initialized (checks every 24 hours)
[EXCHANGE] Last update: ..., Needs update: true
[EXCHANGE] Starting exchange rate update...
[EXCHANGE] Successfully fetched exchange rates from API
[EXCHANGE] Successfully updated 9 exchange rates
```

## Manual Update (Optional)

If you ever want to force an immediate update:

```bash
POST https://your-domain.com/api/finance/exchange-rates/update
Authorization: Bearer YOUR_JWT_TOKEN
```

## Documentation Files

📚 **Read these for more details:**

- **AUTOMATED_EXCHANGE_RATES.md** - Complete guide to the automated system
- **CURRENCY_MIGRATION_README.md** - Database migration instructions
- **supabase_currency_migration.sql** - The SQL script to run in Supabase

## Questions?

**Q: Do I need to run any SQL scripts regularly?**  
A: No! Only run `supabase_currency_migration.sql` once. Everything else is automatic.

**Q: What if the API goes down?**  
A: Old rates stay in place. System retries in 24 hours. Use manual SQL as emergency backup.

**Q: Does this cost money?**  
A: No! Uses a free API with 1,500 requests/month (you only use ~30/month).

**Q: Can I see the current rates?**  
A: Yes! Query your database: `SELECT * FROM exchange_rates;`

## Summary

✅ **Run once**: `supabase_currency_migration.sql` in Supabase  
✅ **Deploy**: Push your code  
✅ **Relax**: Rates update automatically forever!

No more manual work! 🎉
