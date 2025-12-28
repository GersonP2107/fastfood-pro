-- ============================================================================
-- Script para Agregar un Nuevo Negocio (Multi-Tenant)
-- ============================================================================
-- Este script te permite agregar un nuevo restaurante/negocio a tu plataforma
-- con sus categorías, productos y zonas de entrega iniciales.
-- ============================================================================

-- INSTRUCCIONES:
-- 1. Reemplaza los valores entre 'COMILLAS' con la información real
-- 2. Ejecuta este script en Supabase SQL Editor
-- 3. El negocio estará disponible en: tudominio.com/[slug]

DO $$
DECLARE
    -- Variables para almacenar IDs
    v_businessman_id UUID;
    v_user_id UUID := NULL; -- Opcional: ID del usuario dueño desde Supabase Auth
    
    -- IDs de categorías
    v_cat_entradas UUID;
    v_cat_platos_fuertes UUID;
    v_cat_bebidas UUID;
    
    -- IDs de modificadores
    v_mod_extra_queso UUID;
    v_mod_sin_cebolla UUID;
BEGIN

-- ============================================================================
-- PASO 1: CREAR EL NEGOCIO
-- ============================================================================

INSERT INTO businessmen (
    id,
    user_id,                    -- Opcional: vincular con usuario de Supabase Auth
    business_name,
    slug,                       -- URL única (solo letras minúsculas, números y guiones)
    description,
    city,                       -- Ciudad donde está ubicado el negocio
    business_type,              -- Tipo de negocio (hamburguesas, pizza, etc.)
    phone,
    whatsapp_number,           -- Formato: 573001234567 (código país + número)
    email,
    address,
    logo_url,                  -- Opcional: URL del logo
    is_active,
    accept_orders,
    opening_hours,
    closing_hours
) VALUES (
    gen_random_uuid(),
    v_user_id,                 -- NULL si no tienes usuario aún
    'NOMBRE DEL NEGOCIO',      -- ej: "Pizzería Napoli"
    'slug-del-negocio',        -- ej: "pizzeria-napoli" (debe ser único)
    'Descripción del negocio', -- ej: "Las mejores pizzas artesanales de Cali"
    'Cali',                    -- Ciudad (Cali, Bogotá, Medellín, etc.)
    'pizza',                   -- Tipo: hamburguesas, pizza, comida_rapida, pollo, asados, sushi, etc.
    '+573001234567',           -- Teléfono
    '573001234567',            -- WhatsApp (sin + ni espacios)
    'email@negocio.com',
    'Dirección completa',      -- ej: "Calle 5 #45-67, Cali, Valle"
    NULL,                      -- URL del logo (opcional)
    true,                      -- Negocio activo
    true,                      -- Acepta órdenes
    '08:00',                   -- Hora apertura (formato 24h)
    '22:00'                    -- Hora cierre (formato 24h)
)
RETURNING id INTO v_businessman_id;

RAISE NOTICE '✅ Negocio creado con ID: %', v_businessman_id;

-- ============================================================================
-- PASO 2: CREAR CATEGORÍAS
-- ============================================================================

-- Categoría 1: Entradas
INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES (gen_random_uuid(), v_businessman_id, 'ENTRADAS', 'Aperitivos y entradas', 1, true)
RETURNING id INTO v_cat_entradas;

-- Categoría 2: Platos Fuertes
INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES (gen_random_uuid(), v_businessman_id, 'PLATOS FUERTES', 'Platos principales', 2, true)
RETURNING id INTO v_cat_platos_fuertes;

-- Categoría 3: Bebidas
INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES (gen_random_uuid(), v_businessman_id, 'BEBIDAS', 'Bebidas frías y calientes', 3, true)
RETURNING id INTO v_cat_bebidas;

RAISE NOTICE '✅ Categorías creadas: 3';

-- ============================================================================
-- PASO 3: CREAR MODIFICADORES (EXTRAS)
-- ============================================================================

-- Modificador 1: Extra Queso
INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES (gen_random_uuid(), v_businessman_id, 'Queso Extra', 'Porción adicional de queso', 2000, 'extra')
RETURNING id INTO v_mod_extra_queso;

-- Modificador 2: Sin Cebolla
INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES (gen_random_uuid(), v_businessman_id, 'Sin Cebolla', NULL, 0, 'without')
RETURNING id INTO v_mod_sin_cebolla;

RAISE NOTICE '✅ Modificadores creados: 2';

-- ============================================================================
-- PASO 4: CREAR PRODUCTOS DE EJEMPLO
-- ============================================================================

-- Producto 1: Entrada
INSERT INTO products (
    id, businessman_id, category_id, 
    name, description, price, 
    is_available, featured, "order"
) VALUES (
    gen_random_uuid(), v_businessman_id, v_cat_entradas,
    'Aros de Cebolla', 
    '10 aros de cebolla crujientes con salsa especial',
    8000,
    true, false, 1
);

-- Producto 2: Plato Fuerte (con modificadores)
DECLARE v_producto_id UUID;
BEGIN
    INSERT INTO products (
        id, businessman_id, category_id,
        name, description, price,
        discount_price, is_available, featured, "order"
    ) VALUES (
        gen_random_uuid(), v_businessman_id, v_cat_platos_fuertes,
        'Pizza Margarita',
        'Pizza clásica con tomate, mozzarella y albahaca fresca',
        25000,
        22000,  -- Precio con descuento (opcional)
        true, true, 1
    )
    RETURNING id INTO v_producto_id;
    
    -- Asociar modificadores al producto
    INSERT INTO product_modifiers (product_id, modifier_id, is_required)
    VALUES 
        (v_producto_id, v_mod_extra_queso, false),
        (v_producto_id, v_mod_sin_cebolla, false);
END;

-- Producto 3: Bebida
INSERT INTO products (
    id, businessman_id, category_id,
    name, description, price,
    is_available, "order"
) VALUES (
    gen_random_uuid(), v_businessman_id, v_cat_bebidas,
    'Limonada Natural',
    'Limonada natural con hielo',
    4000,
    true, 1
);

RAISE NOTICE '✅ Productos creados: 3';

-- ============================================================================
-- PASO 5: CREAR ZONAS DE ENTREGA (OPCIONAL)
-- ============================================================================

INSERT INTO delivery_zones (businessman_id, zone_name, delivery_cost, is_active)
VALUES 
    (v_businessman_id, 'CENTRO', 3000, true),
    (v_businessman_id, 'NORTE', 5000, true),
    (v_businessman_id, 'SUR', 5000, true);

RAISE NOTICE '✅ Zonas de entrega creadas: 3';

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================

RAISE NOTICE '========================================';
RAISE NOTICE '✅ NEGOCIO CREADO EXITOSAMENTE';
RAISE NOTICE '========================================';
RAISE NOTICE 'ID del Negocio: %', v_businessman_id;
RAISE NOTICE 'Slug: slug-del-negocio';
RAISE NOTICE 'URL: tudominio.com/slug-del-negocio';
RAISE NOTICE '';
RAISE NOTICE 'Datos creados:';
RAISE NOTICE '- 1 Negocio';
RAISE NOTICE '- 3 Categorías';
RAISE NOTICE '- 2 Modificadores';
RAISE NOTICE '- 3 Productos';
RAISE NOTICE '- 3 Zonas de entrega';
RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver el negocio creado
-- SELECT * FROM businessmens WHERE slug = 'slug-del-negocio';

-- Ver categorías del negocio
-- SELECT * FROM categories WHERE businessman_id = 'tu-businessman-id';

-- Ver productos del negocio
-- SELECT p.name, c.name as category, p.price 
-- FROM products p
-- JOIN categories c ON p.category_id = c.id
-- WHERE p.businessman_id = 'tu-businessman-id';
