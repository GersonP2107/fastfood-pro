-- ============================================================================
-- Update Existing Businesses with City and Business Type
-- ============================================================================
-- This script helps you update your existing businesses with city and 
-- business_type values so they appear in the filtered landing page.
-- ============================================================================

-- INSTRUCTIONS:
-- 1. Find your business slug (check your database or URL)
-- 2. Update the values below with the correct information
-- 3. Run this script in Supabase SQL Editor

-- ============================================================================
-- Example 1: Update a single business
-- ============================================================================

UPDATE businessmans 
SET 
    city = 'Cali',                    -- Change to your city
    business_type = 'comida_rapida'   -- Change to your business type
WHERE slug = 'la-casa-del-sabor';     -- Change to your slug

-- ============================================================================
-- Example 2: Update multiple businesses at once
-- ============================================================================

-- Business 1
UPDATE businessmans 
SET city = 'Cali', business_type = 'hamburguesas'
WHERE slug = 'burger-express';

-- Business 2
UPDATE businessmans 
SET city = 'Bogotá', business_type = 'pizza'
WHERE slug = 'pizzeria-napoli';

-- Business 3
UPDATE businessmans 
SET city = 'Medellín', business_type = 'sushi'
WHERE slug = 'sushi-express';

-- ============================================================================
-- Verify your updates
-- ============================================================================

SELECT 
    business_name,
    slug,
    city,
    business_type,
    is_active
FROM businessmans
ORDER BY business_name;

-- ============================================================================
-- Business Type Reference
-- ============================================================================
-- Available business types (use these exact values):
-- 
-- - hamburguesas       (🍔 Hamburguesas)
-- - pizza              (🍕 Pizza)
-- - comida_rapida      (🍟 Comida Rápida)
-- - pollo              (🍗 Pollo)
-- - asados             (🥩 Asados)
-- - comida_mexicana    (🌮 Mexicana)
-- - sushi              (🍣 Sushi)
-- - postres            (🍰 Postres)
-- - bebidas            (🥤 Bebidas)
-- - panaderia          (🥖 Panadería)
-- - comida_saludable   (🥗 Saludable)
-- - mariscos           (🦐 Mariscos)
-- 
-- ============================================================================
-- Cities Reference
-- ============================================================================
-- Available cities in the filter:
-- 
-- - Cali
-- - Bogotá
-- - Medellín
-- - Barranquilla
-- - Cartagena
-- - Bucaramanga
-- - Pereira
-- - Manizales
-- - Ibagué
-- - Pasto
-- 
-- Note: You can use any city name, but these are the ones in the dropdown
-- ============================================================================
