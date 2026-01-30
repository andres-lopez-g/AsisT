# Quick Start Guide - Fixing RLS Errors in Supabase

This guide helps you quickly fix the 11 RLS security warnings in your Supabase dashboard.

## 🎯 What You Need to Do

You have **11 security errors** in Supabase because Row Level Security (RLS) is not enabled on your tables. This PR provides everything you need to fix them.

## ⚡ Quick Fix (5 minutes)

### Step 1: Run the SQL Migration

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Click **New Query**
4. Open the file `supabase_enable_rls_custom_auth.sql` from this PR
5. Copy all the content
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

✅ This will enable RLS on all 11 tables and create security policies.

### Step 2: Update Your Code

**Choose ONE of these options:**

#### Option A: Full Solution (Recommended for Production)

Update your application to work with RLS:

```bash
# 1. Backup your current database file
cp server/db.js server/db.js.backup

# 2. Use the new RLS-aware version
cp server/db_with_rls.js server/db.js

# 3. Update your route handlers
# Add { userId: req.user.id } to all db.query() calls
# See RLS_MIGRATION_README.md for examples
```

#### Option B: Quick Temporary Fix (For Testing)

Use a service role connection that bypasses RLS temporarily:

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Find **Connection string**
3. Copy the one that says **Transaction mode** with **service_role**
4. Update your `.env` file:
   ```
   DATABASE_URL=<paste the service_role connection string here>
   ```

⚠️ **Warning**: This bypasses all security! Use only for testing.

## 📋 Files in This PR

| File | Purpose |
|------|---------|
| `supabase_enable_rls_custom_auth.sql` | **Main migration file** - Run this in Supabase |
| `server/db_with_rls.js` | Database wrapper with RLS support |
| `RLS_MIGRATION_README.md` | Complete documentation |
| `RLS_IMPLEMENTATION_SUMMARY.md` | Overview of changes |
| `QUICK_START_RLS.md` | This file |

## ✅ How to Verify It Works

After running the migration:

1. Go to Supabase Dashboard → Database
2. Click on any table (e.g., `users`, `transactions`)
3. Look for "RLS enabled" badge at the top
4. Click "View Policies" to see the security rules

## 🔍 What Gets Fixed

All 11 security errors will be resolved:

- ✅ users
- ✅ transactions  
- ✅ tasks
- ✅ debts
- ✅ debt_payments
- ✅ categories
- ✅ categorization_rules
- ✅ recurring_transactions
- ✅ forecast_settings
- ✅ exchange_rates
- ✅ documents (if it exists)

## 🆘 Troubleshooting

### "Can't see any data after migration"
- You haven't updated your application code yet
- Use Option B (service role) temporarily while you implement Option A

### "User registration is broken"
- This is expected - see `RLS_MIGRATION_README.md` section on "User Registration"
- Registration needs to use service role or be handled specially

### "What about Vercel deployment?"
- This only changes database security, not your app deployment
- Your Vercel deployment will continue to work
- Just make sure to update your code (Option A) before deploying

## 📚 Need More Details?

- **Complete Guide**: `RLS_MIGRATION_README.md`
- **Implementation Details**: `RLS_IMPLEMENTATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth/row-level-security

## 🎉 That's It!

Once you run the SQL migration, all 11 security errors in Supabase will disappear. Then update your code at your convenience.

---

**Time to Complete**: 5 minutes (SQL) + 30-60 minutes (code updates)
**Difficulty**: Easy (SQL), Medium (code updates)
**Impact**: Fixes all 11 security errors ✅
