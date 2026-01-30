# Row Level Security (RLS) Migration Guide

## Overview

This migration enables Row Level Security (RLS) on all public tables in your Supabase database to fix the security warnings you're seeing in the Supabase dashboard.

## What is RLS?

Row Level Security (RLS) is a PostgreSQL security feature that allows you to control which rows users can access in database tables. When RLS is enabled on a table, users can only access rows that match the defined security policies.

## Security Issues Fixed

This migration addresses the following RLS warnings from Supabase:

- ✅ `users` - RLS enabled with user-specific access
- ✅ `transactions` - RLS enabled with user-specific access
- ✅ `tasks` - RLS enabled with user-specific access
- ✅ `debts` - RLS enabled with user-specific access
- ✅ `debt_payments` - RLS enabled with debt ownership verification
- ✅ `categories` - RLS enabled with user-specific access
- ✅ `categorization_rules` - RLS enabled with user-specific access
- ✅ `recurring_transactions` - RLS enabled with user-specific access
- ✅ `forecast_settings` - RLS enabled with user-specific access
- ✅ `exchange_rates` - RLS enabled with read-only access for all authenticated users
- ✅ `documents` - RLS enabled with user-specific access (if table exists)

## How to Apply

### Option 1: Using Supabase SQL Editor (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to the **SQL Editor** section
4. Click **New Query**
5. Copy the entire contents of `supabase_enable_rls.sql`
6. Paste into the SQL Editor
7. Click **Run** to execute the migration
8. Review the verification output at the bottom to confirm all tables have RLS enabled

### Option 2: Using Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push < supabase_enable_rls.sql
```

## What This Migration Does

### 1. Enables RLS on All Tables

The migration enables Row Level Security on the following tables:
- `users`
- `transactions`
- `tasks`
- `debts`
- `debt_payments`
- `categories`
- `categorization_rules` (if exists)
- `recurring_transactions` (if exists)
- `forecast_settings` (if exists)
- `exchange_rates` (if exists)
- `documents` (if exists)

### 2. Creates Security Policies

For each table, the migration creates policies that:

#### User-Owned Tables
For tables with a `user_id` column (`users`, `transactions`, `tasks`, `debts`, `categories`, etc.):
- **SELECT**: Users can only view their own records
- **INSERT**: Users can only insert records for themselves
- **UPDATE**: Users can only update their own records
- **DELETE**: Users can only delete their own records

#### Related Tables
For `debt_payments`:
- Users can only access debt payments for debts they own
- Verified through a JOIN with the `debts` table

#### Shared Tables
For `exchange_rates`:
- All authenticated users can view exchange rates (SELECT)
- No INSERT/UPDATE/DELETE policies (only service role can modify)

## Authentication Integration

The policies use Supabase's built-in authentication:
- `auth.uid()` - Returns the current authenticated user's ID
- `auth.role()` - Returns the user's role (authenticated, anon, service_role)

**Important**: Your application must use Supabase authentication for these policies to work correctly. If you're using custom authentication (JWT), you'll need to adjust the policies accordingly.

## Verification

After running the migration, you can verify it worked by:

1. **Check the Supabase Dashboard**:
   - Go to Database → Database
   - Click on any table
   - You should see "RLS enabled" at the top
   - Click "View Policies" to see the created policies

2. **Run Verification Queries**:
   The migration includes verification queries at the end that show:
   - Which tables have RLS enabled
   - Which policies were created

3. **Test Your Application**:
   - Log in as a user
   - Verify you can only see your own data
   - Try to access another user's data (should fail)

## Important Notes

### Before Running

1. **Backup Your Database**: Always backup before running migrations
2. **Test in Development**: Test in a development environment first
3. **Existing Data**: This migration doesn't affect existing data, only access controls

### After Running

1. **Service Role Access**: The service role can bypass RLS, so be careful with service role keys
2. **Admin Access**: If you need admin access to all data, you'll need to add additional policies or use the service role
3. **Performance**: RLS policies add minimal overhead but are checked on every query

### Troubleshooting

If you encounter issues after enabling RLS:

1. **Can't Access Data**:
   - Verify you're authenticated with Supabase Auth
   - Check that `auth.uid()` matches your user_id values
   - User IDs must match (both should be text or both should be integers)

2. **Type Mismatch Errors**:
   - The policies cast to `::text` for comparison
   - If your user_id is UUID, you may need to adjust the policies

3. **Need to Disable RLS Temporarily**:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

## Custom Authentication Setup

If you're using custom authentication (not Supabase Auth), you'll need to modify the policies to use your JWT claims. Example:

```sql
-- Instead of: auth.uid()::text = user_id::text
-- Use: current_setting('request.jwt.claims', true)::json->>'user_id' = user_id::text
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)

## Support

If you encounter issues:
1. Check the Supabase logs for policy violation errors
2. Review the PostgreSQL error messages
3. Consult the Supabase Discord community
4. Open an issue in this repository

---

**Last Updated**: January 2026  
**Compatible With**: PostgreSQL 13+, Supabase Platform
