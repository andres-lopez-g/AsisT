-- ===========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR SUPABASE - CUSTOM AUTH VERSION
-- ===========================================================================
-- This script enables RLS using PostgreSQL session variables instead of auth.uid()
-- This version works with custom JWT authentication (not Supabase Auth)
-- ===========================================================================

-- ===========================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ===========================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on debts table
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on debt_payments table
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on categorization_rules table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorization_rules') THEN
        ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on recurring_transactions table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_transactions') THEN
        ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on forecast_settings table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forecast_settings') THEN
        ALTER TABLE forecast_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on exchange_rates table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_rates') THEN
        ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on documents table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ===========================================================================
-- STEP 2: CREATE RLS POLICIES FOR USERS TABLE
-- ===========================================================================

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (
  current_setting('app.user_id', true)::integer = id
);

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (
  current_setting('app.user_id', true)::integer = id
);

-- Users can insert their own record (for registration)
CREATE POLICY "Users can insert own record"
ON users FOR INSERT
WITH CHECK (
  current_setting('app.user_id', true)::integer = id
);

-- ===========================================================================
-- STEP 3: CREATE RLS POLICIES FOR TRANSACTIONS TABLE
-- ===========================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- ===========================================================================
-- STEP 4: CREATE RLS POLICIES FOR TASKS TABLE
-- ===========================================================================

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- ===========================================================================
-- STEP 5: CREATE RLS POLICIES FOR DEBTS TABLE
-- ===========================================================================

-- Users can view their own debts
CREATE POLICY "Users can view own debts"
ON debts FOR SELECT
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can insert their own debts
CREATE POLICY "Users can insert own debts"
ON debts FOR INSERT
WITH CHECK (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can update their own debts
CREATE POLICY "Users can update own debts"
ON debts FOR UPDATE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can delete their own debts
CREATE POLICY "Users can delete own debts"
ON debts FOR DELETE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- ===========================================================================
-- STEP 6: CREATE RLS POLICIES FOR DEBT_PAYMENTS TABLE
-- ===========================================================================

-- Users can view debt payments for their own debts
CREATE POLICY "Users can view own debt payments"
ON debt_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM debts 
    WHERE debts.id = debt_payments.debt_id 
    AND current_setting('app.user_id', true)::integer = debts.user_id
  )
);

-- Users can insert debt payments for their own debts
CREATE POLICY "Users can insert own debt payments"
ON debt_payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM debts 
    WHERE debts.id = debt_payments.debt_id 
    AND current_setting('app.user_id', true)::integer = debts.user_id
  )
);

-- Users can update debt payments for their own debts
CREATE POLICY "Users can update own debt payments"
ON debt_payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM debts 
    WHERE debts.id = debt_payments.debt_id 
    AND current_setting('app.user_id', true)::integer = debts.user_id
  )
);

-- Users can delete debt payments for their own debts
CREATE POLICY "Users can delete own debt payments"
ON debt_payments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM debts 
    WHERE debts.id = debt_payments.debt_id 
    AND current_setting('app.user_id', true)::integer = debts.user_id
  )
);

-- ===========================================================================
-- STEP 7: CREATE RLS POLICIES FOR CATEGORIES TABLE
-- ===========================================================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
ON categories FOR SELECT
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (
  current_setting('app.user_id', true)::integer = user_id
);

-- ===========================================================================
-- STEP 8: CREATE RLS POLICIES FOR CATEGORIZATION_RULES TABLE (if exists)
-- ===========================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorization_rules') THEN
        -- Users can view their own categorization rules
        EXECUTE 'CREATE POLICY "Users can view own categorization rules"
        ON categorization_rules FOR SELECT
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can insert their own categorization rules
        EXECUTE 'CREATE POLICY "Users can insert own categorization rules"
        ON categorization_rules FOR INSERT
        WITH CHECK (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can update their own categorization rules
        EXECUTE 'CREATE POLICY "Users can update own categorization rules"
        ON categorization_rules FOR UPDATE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can delete their own categorization rules
        EXECUTE 'CREATE POLICY "Users can delete own categorization rules"
        ON categorization_rules FOR DELETE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';
    END IF;
END $$;

-- ===========================================================================
-- STEP 9: CREATE RLS POLICIES FOR RECURRING_TRANSACTIONS TABLE (if exists)
-- ===========================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_transactions') THEN
        -- Users can view their own recurring transactions
        EXECUTE 'CREATE POLICY "Users can view own recurring transactions"
        ON recurring_transactions FOR SELECT
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can insert their own recurring transactions
        EXECUTE 'CREATE POLICY "Users can insert own recurring transactions"
        ON recurring_transactions FOR INSERT
        WITH CHECK (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can update their own recurring transactions
        EXECUTE 'CREATE POLICY "Users can update own recurring transactions"
        ON recurring_transactions FOR UPDATE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can delete their own recurring transactions
        EXECUTE 'CREATE POLICY "Users can delete own recurring transactions"
        ON recurring_transactions FOR DELETE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';
    END IF;
END $$;

-- ===========================================================================
-- STEP 10: CREATE RLS POLICIES FOR FORECAST_SETTINGS TABLE (if exists)
-- ===========================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forecast_settings') THEN
        -- Users can view their own forecast settings
        EXECUTE 'CREATE POLICY "Users can view own forecast settings"
        ON forecast_settings FOR SELECT
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can insert their own forecast settings
        EXECUTE 'CREATE POLICY "Users can insert own forecast settings"
        ON forecast_settings FOR INSERT
        WITH CHECK (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can update their own forecast settings
        EXECUTE 'CREATE POLICY "Users can update own forecast settings"
        ON forecast_settings FOR UPDATE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';

        -- Users can delete their own forecast settings
        EXECUTE 'CREATE POLICY "Users can delete own forecast settings"
        ON forecast_settings FOR DELETE
        USING (current_setting(''app.user_id'', true)::integer = user_id)';
    END IF;
END $$;

-- ===========================================================================
-- STEP 11: CREATE RLS POLICIES FOR EXCHANGE_RATES TABLE (if exists)
-- ===========================================================================
-- Exchange rates are readable by all authenticated users (identified by having app.user_id set)

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_rates') THEN
        -- All authenticated users can view exchange rates
        EXECUTE 'CREATE POLICY "Authenticated users can view exchange rates"
        ON exchange_rates FOR SELECT
        USING (current_setting(''app.user_id'', true) IS NOT NULL)';
    END IF;
END $$;

-- ===========================================================================
-- STEP 12: CREATE RLS POLICIES FOR DOCUMENTS TABLE (if exists)
-- ===========================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        -- Check if documents table has user_id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'documents' AND column_name = 'user_id'
        ) THEN
            -- Users can view their own documents
            EXECUTE 'CREATE POLICY "Users can view own documents"
            ON documents FOR SELECT
            USING (current_setting(''app.user_id'', true)::integer = user_id)';

            -- Users can insert their own documents
            EXECUTE 'CREATE POLICY "Users can insert own documents"
            ON documents FOR INSERT
            WITH CHECK (current_setting(''app.user_id'', true)::integer = user_id)';

            -- Users can update their own documents
            EXECUTE 'CREATE POLICY "Users can update own documents"
            ON documents FOR UPDATE
            USING (current_setting(''app.user_id'', true)::integer = user_id)';

            -- Users can delete their own documents
            EXECUTE 'CREATE POLICY "Users can delete own documents"
            ON documents FOR DELETE
            USING (current_setting(''app.user_id'', true)::integer = user_id)';
        END IF;
    END IF;
END $$;

-- ===========================================================================
-- STEP 13: VERIFICATION
-- ===========================================================================

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================================================================
-- MIGRATION COMPLETE
-- ===========================================================================
-- All public tables now have RLS enabled with appropriate policies
-- IMPORTANT: Your application must set app.user_id session variable for RLS to work
-- See RLS_MIGRATION_README.md for implementation details
-- ===========================================================================
