-- ============================================================================
-- Fix Infinite Recursion in user_roles RLS Policies
-- ============================================================================
-- This migration fixes the infinite recursion error by removing problematic
-- RLS policies on the user_roles table and creating safe, non-recursive ones.
-- 
-- PROBLEM: Policies that query user_roles within user_roles policies create
-- infinite recursion.
-- 
-- SOLUTION: Use auth.uid() directly without querying user_roles.
-- ============================================================================

-- Step 1: Drop ALL existing policies on user_roles table
-- This ensures we start with a clean slate
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies on user_roles table and drop them
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_roles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create safe, non-recursive policies

-- Policy 1: Users can view their own roles
-- ✅ SAFE: Only uses auth.uid(), no recursion
CREATE POLICY "Users can view own roles"
    ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own roles (if needed during signup)
-- ✅ SAFE: Only uses auth.uid(), no recursion
CREATE POLICY "Users can insert own roles"
    ON user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Service role has full access (for admin operations)
-- ✅ SAFE: Uses auth.role(), no table queries
CREATE POLICY "Service role has full access"
    ON user_roles
    FOR ALL
    USING (auth.role() = 'service_role');

-- Step 4: Optional - If you need admins to manage other users' roles
-- Only uncomment this if you have a separate admin_users table or similar
-- DO NOT use this if it queries user_roles!

-- CREATE POLICY "Admins can manage all roles"
--     ON user_roles
--     FOR ALL
--     USING (
--         auth.uid() IN (
--             SELECT user_id FROM admin_users  -- ✅ Different table, no recursion
--         )
--     );

-- Step 5: Verify the policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_roles';
    
    RAISE NOTICE 'Total policies on user_roles table: %', policy_count;
    
    IF policy_count = 0 THEN
        RAISE WARNING 'No policies found on user_roles! This means the table has no RLS protection.';
    ELSE
        RAISE NOTICE 'RLS policies successfully created on user_roles table.';
    END IF;
END $$;

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. After running this migration, test the customer-facing menu immediately
-- 2. Verify that the menu loads without "infinite recursion" errors
-- 3. If you have dashboard functionality, test that role-based access still works
-- 4. If you need more complex role checking, create a separate function that
--    uses SECURITY DEFINER to bypass RLS when checking roles
-- ============================================================================

COMMENT ON POLICY "Users can view own roles" ON user_roles IS 
    'Allows users to view their own roles without causing infinite recursion';

COMMENT ON POLICY "Users can insert own roles" ON user_roles IS 
    'Allows users to insert their own roles during signup or profile creation';

COMMENT ON POLICY "Service role has full access" ON user_roles IS 
    'Allows backend service role to manage all user roles for admin operations';
