-- ============================================================================
-- Add City and Business Type to Businessmen Table
-- ============================================================================
-- This migration adds filtering capabilities to the businessmen table
-- by adding city and business_type columns with appropriate indexes.
-- ============================================================================

-- Step 1: Add new columns
ALTER TABLE businessmans
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businessmans_city ON businessmans(city);
CREATE INDEX IF NOT EXISTS idx_businessmans_type ON businessmans(business_type);
CREATE INDEX IF NOT EXISTS idx_businessmans_active_city ON businessmans(is_active, city);
CREATE INDEX IF NOT EXISTS idx_businessmans_active_type ON businessmans(is_active, business_type);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN businessmans.city IS 'City where the business is located (e.g., Cali, Bogotá, Medellín)';
COMMENT ON COLUMN businessmans.business_type IS 'Type of business (e.g., hamburguesas, pizza, comida_rapida)';

-- Step 4: Update existing businesses with default values (optional)
-- You can update these manually or through the admin panel later
-- Example:
-- UPDATE businessmans SET city = 'Cali', business_type = 'comida_rapida' WHERE slug = 'la-casa-del-sabor';

-- ============================================================================
-- Business Type Reference Values
-- ============================================================================
-- Suggested values for business_type:
-- - hamburguesas
-- - pizza
-- - comida_rapida
-- - pollo
-- - asados
-- - comida_mexicana
-- - sushi
-- - postres
-- - bebidas
-- - panaderia
-- - comida_saludable
-- - comida_vegetariana
-- - mariscos
-- - otro

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '- city (VARCHAR 100)';
    RAISE NOTICE '- business_type (VARCHAR 50)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created indexes:';
    RAISE NOTICE '- idx_businessmans_city';
    RAISE NOTICE '- idx_businessmans_type';
    RAISE NOTICE '- idx_businessmans_active_city';
    RAISE NOTICE '- idx_businessmans_active_type';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- Next Steps
-- ============================================================================
-- 1. Update existing businesses with city and business_type values
-- 2. Update the add-new-business.sql template to include these fields
-- 3. Update TypeScript types to include city and business_type
-- 4. Implement filters in the landing page
