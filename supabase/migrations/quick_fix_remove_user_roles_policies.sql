-- ============================================================================
-- QUICK FIX: Remove All RLS Policies from user_roles
-- ============================================================================
-- This is a TEMPORARY quick fix to get your menu working immediately.
-- Run this in Supabase SQL Editor to remove the problematic policies.
-- 
-- ⚠️ WARNING: This will temporarily disable RLS protection on user_roles
-- After the menu is working, you should apply the full fix from
-- fix_user_roles_rls.sql to restore proper security.
-- ============================================================================

-- Drop all policies on user_roles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_roles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ All policies dropped from user_roles table';
    RAISE NOTICE '⚠️  WARNING: user_roles table now has NO RLS protection';
    RAISE NOTICE '📝 Next step: Apply the full fix from fix_user_roles_rls.sql';
END $$;

-- Disable RLS temporarily (ONLY if you want to completely bypass RLS for testing)
-- Uncomment the line below ONLY for testing, then re-enable it
-- ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script:
-- 1. Refresh your digital menu page
-- 2. It should load without the "infinite recursion" error
-- 3. Once confirmed working, apply fix_user_roles_rls.sql for proper security
-- ============================================================================
