# Row Level Security (RLS) Migration Guide

## Overview

This migration enables Row Level Security (RLS) on all public tables in your Supabase database to fix the security warnings you're seeing in the Supabase dashboard.

## What is RLS?

Row Level Security (RLS) is a PostgreSQL security feature that allows you to control which rows users can access in database tables. When RLS is enabled on a table, users can only access rows that match the defined security policies.

## Which Migration File to Use?

**Two migration files are provided:**

1. **`supabase_enable_rls.sql`** - For applications using **Supabase Authentication**
   - Uses `auth.uid()` from Supabase Auth
   - Best for apps integrated with Supabase client libraries
   
2. **`supabase_enable_rls_custom_auth.sql`** - For applications using **Custom JWT Authentication** (THIS IS YOU!)
   - Uses PostgreSQL session variables (`current_setting('app.user_id')`)
   - **Recommended for this application** since it uses custom JWT auth
   - Requires code changes to set the user ID in database session

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

### Step 1: Run the SQL Migration

#### Option A: Using Supabase SQL Editor (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to the **SQL Editor** section
4. Click **New Query**
5. Copy the entire contents of **`supabase_enable_rls_custom_auth.sql`** (the custom auth version)
6. Paste into the SQL Editor
7. Click **Run** to execute the migration
8. Review the verification output at the bottom to confirm all tables have RLS enabled

#### Option B: Using Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push < supabase_enable_rls_custom_auth.sql
```

### Step 2: Update Your Application Code

**IMPORTANT**: After enabling RLS with custom authentication, you MUST update your application code to set the user ID in the database session for each request. Otherwise, users won't be able to access any data.

#### Option A: Update db.js to use the new RLS-aware version (Recommended)

1. **Backup your current `server/db.js`**:
   ```bash
   cp server/db.js server/db.js.backup
   ```

2. **Replace `server/db.js` with `server/db_with_rls.js`**:
   ```bash
   cp server/db_with_rls.js server/db.js
   ```

3. **Update your route handlers** to pass the userId option:
   ```javascript
   // Before (old way):
   const result = await db.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
   
   // After (new way with RLS):
   const result = await db.query(
       'SELECT * FROM transactions WHERE user_id = $1', 
       [userId],
       { userId: req.user.id }  // Pass userId from JWT
   );
   ```

4. **For transactions**, use the new transaction helper:
   ```javascript
   const result = await db.transaction(async (client) => {
       await client.query('INSERT INTO transactions (...) VALUES (...)', [...]);
       await client.query('UPDATE debts SET ...', [...]);
       return result;
   }, { userId: req.user.id });
   ```

#### Option B: Use Service Role Connection (Temporary Workaround)

If you don't want to update your code immediately, you can use a service role connection string that bypasses RLS:

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Find the **Connection String** section
3. Copy the **Connection pooling** string with **Transaction mode**
4. Make sure to use the **service_role** key (NOT the anon key)
5. Update your environment variable:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:6543/postgres?pgbouncer=true
   ```

**Warning**: Using service role bypasses RLS entirely. This is NOT recommended for production as it defeats the purpose of RLS. Use this only temporarily while you update your code.

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
3. **Choose the Right Migration**: Use `supabase_enable_rls_custom_auth.sql` for this application
4. **Plan for Code Changes**: You'll need to update your application code after enabling RLS

### After Running

1. **Update Application Code**: Required! See Step 2 above
2. **Test Thoroughly**: Verify users can only access their own data
3. **Service Role Access**: The service role can bypass RLS, so be careful with service role keys
4. **Admin Access**: If you need admin access to all data, use the service role or add special admin policies

### Migration Options Summary

| Approach | Pros | Cons | Recommended |
|----------|------|------|-------------|
| **Update code to use session variables** | Secure, proper RLS implementation | Requires code changes | ✅ YES |
| **Use service role connection** | No code changes needed | Bypasses RLS security | ❌ NO (temporary only) |
| **Keep RLS disabled** | No changes needed | Major security vulnerability | ❌ NEVER |

### Troubleshooting

If you encounter issues after enabling RLS:

1. **Can't Access Data After Migration**:
   - Most likely cause: You haven't updated your code to set `app.user_id` session variable
   - Solution: Follow Step 2 above to update your application code
   - Quick test: Check if using service role connection string works (confirms it's an RLS issue)

2. **"unrecognized configuration parameter" Error**:
   - This happens if the session variable isn't set
   - Make sure you're using the updated `db.js` that sets the variable
   - Verify `options.userId` is being passed to all queries

3. **Users Can See Other Users' Data**:
   - Check that `req.user.id` is the correct user ID from JWT
   - Verify the session variable is being set correctly
   - Check RLS policies are created: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

4. **Type Mismatch Errors**:
   - The policies assume `user_id` is an INTEGER
   - If your user_id is UUID or TEXT, modify the policies to match:
     ```sql
     -- For UUID:
     current_setting('app.user_id', true)::uuid = user_id
     
     -- For TEXT:
     current_setting('app.user_id', true) = user_id
     ```

5. **Performance Issues**:
   - RLS policies are checked on every query
   - Make sure you have proper indexes on `user_id` columns
   - Consider using connection pooling with session presets

6. **Need to Disable RLS Temporarily**:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```
   **Warning**: This is a security risk in production!

## Custom Authentication Setup

This application uses **custom JWT authentication** (not Supabase Auth). The `supabase_enable_rls_custom_auth.sql` migration is designed specifically for this setup.

### How It Works

1. **Session Variables**: PostgreSQL allows setting session-specific variables using `SET LOCAL`
2. **Per-Request Context**: Each database query sets `app.user_id` to the authenticated user's ID
3. **Policy Evaluation**: RLS policies check `current_setting('app.user_id')` to determine access

### Example Implementation

```javascript
// In your route handler (e.g., server/routes/finance.js):
router.get('/transactions', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // From JWT decoded by authenticate middleware
        
        // Old way (without RLS):
        // const result = await db.query(
        //     'SELECT * FROM transactions WHERE user_id = $1',
        //     [userId]
        // );
        
        // New way (with RLS):
        const result = await db.query(
            'SELECT * FROM transactions',  // No WHERE clause needed!
            [],
            { userId: userId }  // RLS handles filtering automatically
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

### Why This Is Better

1. **Defense in Depth**: Even if you forget the WHERE clause, RLS protects the data
2. **Consistent Security**: All queries automatically respect user boundaries
3. **Simpler Queries**: Let RLS handle user filtering instead of manual WHERE clauses
4. **Audit Trail**: PostgreSQL logs RLS policy violations

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
