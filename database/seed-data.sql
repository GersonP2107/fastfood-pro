-- ============================================================================
-- Script de Datos de Prueba - Menú Digital Colombia
-- ============================================================================
-- Este script inserta categorías, productos y modificadores de comida rápida
-- popular en Colombia para probar la UI del menú digital
-- ============================================================================

-- NOTA: Reemplaza 'YOUR_BUSINESSMAN_ID' con el ID real de tu negocio
-- Puedes obtenerlo ejecutando: SELECT id FROM businessmans WHERE slug = 'tu-slug';

-- Variable para el businessman_id (ajusta según tu caso)
-- En Supabase, ejecuta primero: SELECT id FROM businessmans LIMIT 1;
-- Luego reemplaza el UUID abajo con el resultado

DO $$
DECLARE
    v_businessman_id UUID := '702496d2-77da-444f-b97c-1a4ccd09969d'; -- REEMPLAZAR CON TU ID
    v_cat_promociones UUID;
    v_cat_antojos UUID;
    v_cat_wings UUID;
    v_cat_pancrush UUID;
    v_cat_burguesas UUID;
    v_cat_salchipapa UUID;
    v_cat_bebidas UUID;
    v_prod_id UUID;
    v_mod_queso UUID;
    v_mod_tocineta UUID;
    v_mod_huevo UUID;
    v_mod_aguacate UUID;
    v_mod_sin_cebolla UUID;
    v_mod_sin_tomate UUID;
BEGIN

-- ============================================================================
-- CATEGORÍAS
-- ============================================================================

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'PROMO DICIEMBRE', 'Promociones especiales del mes', 1, true)
    RETURNING id INTO v_cat_promociones;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'ANTOJOS', 'Deliciosos antojos para compartir', 2, true)
    RETURNING id INTO v_cat_antojos;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'HAPPY WINGS', 'Alitas crujientes con salsas especiales', 3, true)
    RETURNING id INTO v_cat_wings;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'PANCRUSH', 'Pan crujiente con ingredientes frescos', 4, true)
    RETURNING id INTO v_cat_pancrush;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'BURGUESAS', 'Hamburguesas artesanales jugosas', 5, true)
    RETURNING id INTO v_cat_burguesas;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'SALCHIPAPA PERSONAL', 'Salchipapas individuales', 6, true)
    RETURNING id INTO v_cat_salchipapa;

INSERT INTO categories (id, businessman_id, name, description, "order", is_active)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'BEBIDAS', 'Bebidas refrescantes', 7, true)
    RETURNING id INTO v_cat_bebidas;

-- ============================================================================
-- MODIFICADORES (Extras)
-- ============================================================================

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Queso Extra', 'Queso mozzarella derretido', 2000, 'extra')
    RETURNING id INTO v_mod_queso;

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Tocineta', 'Tocineta crujiente', 3000, 'extra')
    RETURNING id INTO v_mod_tocineta;

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Huevo', 'Huevo frito', 2000, 'extra')
    RETURNING id INTO v_mod_huevo;

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Aguacate', 'Aguacate fresco', 3000, 'extra')
    RETURNING id INTO v_mod_aguacate;

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Sin Cebolla', NULL, 0, 'without')
    RETURNING id INTO v_mod_sin_cebolla;

INSERT INTO modifiers (id, businessman_id, name, description, additional_price, type)
VALUES 
    (gen_random_uuid(), v_businessman_id, 'Sin Tomate', NULL, 0, 'without')
    RETURNING id INTO v_mod_sin_tomate;

-- ============================================================================
-- PRODUCTOS - PROMO DICIEMBRE
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, discount_price, is_available, featured, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_promociones, 
     'COMBO MINI COSTILLA + GASEOSA 250ML', 
     'Deliciosas mini costillas BBQ con gaseosa incluida', 
     20000, 17000, true, true, 1);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, featured, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_promociones, 
     'PICADA VALLUNA', 
     'Picada para 2 personas con chorizo, chicharrón, papa criolla, limón, guacamole, tomate y salsa de papa amarilla', 
     28000, true, true, 2);

-- ============================================================================
-- PRODUCTOS - ANTOJOS
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_antojos, 
     'PORCIÓN DE PAPA X150GR', 
     'Papas fritas crujientes con salsa de la casa', 
     8000, true, 1);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_antojos, 
     'YUCAS GRATINADAS X10', 
     '10 yucas gratinadas con queso mozzarella, tocineta para picar', 
     15000, true, 2);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_antojos, 
     'AROS DE CEBOLLA X10', 
     'Aros de cebolla acompañados con salsa tártara y de la casa', 
     12000, true, 3);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_antojos, 
     'TENDERS DE POLLO X 4', 
     'Tenders de pollo con salsa BBQ', 
     14000, true, 4);

-- ============================================================================
-- PRODUCTOS - HAPPY WINGS
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_wings, 
     'ALITAS BBQ X6', 
     'Alitas bañadas en salsa BBQ con apio y aderezo ranch', 
     16000, true, 1);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_wings, 
     'ALITAS PICANTES X6', 
     'Alitas picantes estilo buffalo con apio', 
     16000, true, 2);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_wings, 
     'ALITAS MIEL MOSTAZA X6', 
     'Alitas con salsa de miel y mostaza', 
     16000, true, 3);

-- ============================================================================
-- PRODUCTOS - PANCRUSH
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_pancrush, 
     'PANCRUSH POLLO', 
     'Pan crujiente con pollo desmechado, queso, lechuga, tomate y salsas', 
     14000, true, 1)
    RETURNING id INTO v_prod_id;

-- Agregar modificadores al Pancrush Pollo
INSERT INTO product_modifiers (product_id, modifier_id, is_required)
VALUES 
    (v_prod_id, v_mod_queso, false),
    (v_prod_id, v_mod_aguacate, false),
    (v_prod_id, v_mod_sin_cebolla, false);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_pancrush, 
     'PANCRUSH CARNE', 
     'Pan crujiente con carne desmechada, queso, lechuga, tomate y salsas', 
     15000, true, 2);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_pancrush, 
     'PANCRUSH MIXTO', 
     'Pan crujiente con pollo y carne, queso, lechuga, tomate y salsas', 
     16000, true, 3);

-- ============================================================================
-- PRODUCTOS - BURGUESAS
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_burguesas, 
     'HAMBURGUESA CLÁSICA', 
     'Carne de res 150g, queso, lechuga, tomate, cebolla y salsas', 
     15000, true, 1)
    RETURNING id INTO v_prod_id;

-- Agregar modificadores a la hamburguesa
INSERT INTO product_modifiers (product_id, modifier_id, is_required)
VALUES 
    (v_prod_id, v_mod_queso, false),
    (v_prod_id, v_mod_tocineta, false),
    (v_prod_id, v_mod_huevo, false),
    (v_prod_id, v_mod_aguacate, false),
    (v_prod_id, v_mod_sin_cebolla, false),
    (v_prod_id, v_mod_sin_tomate, false);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, featured, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_burguesas, 
     'HAMBURGUESA DOBLE CARNE', 
     'Doble carne de res 300g, doble queso, lechuga, tomate, cebolla y salsas', 
     22000, true, true, 2)
    RETURNING id INTO v_prod_id;

INSERT INTO product_modifiers (product_id, modifier_id, is_required)
VALUES 
    (v_prod_id, v_mod_tocineta, false),
    (v_prod_id, v_mod_huevo, false),
    (v_prod_id, v_mod_aguacate, false);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_burguesas, 
     'HAMBURGUESA BBQ BACON', 
     'Carne de res, tocineta, queso cheddar, aros de cebolla, salsa BBQ', 
     18000, true, 3);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_burguesas, 
     'HAMBURGUESA DE POLLO', 
     'Pechuga de pollo apanada, queso, lechuga, tomate y mayonesa', 
     14000, true, 4);

-- ============================================================================
-- PRODUCTOS - SALCHIPAPA PERSONAL
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_salchipapa, 
     'SALCHIPAPA CLÁSICA', 
     'Papas fritas, salchicha, salsas rosada, ajo y piña', 
     12000, true, 1);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_salchipapa, 
     'SALCHIPAPA ESPECIAL', 
     'Papas fritas, salchicha, pollo, queso gratinado, salsas', 
     16000, true, 2);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_salchipapa, 
     'SALCHIPAPA MIXTA', 
     'Papas fritas, salchicha, carne, pollo, queso, tocineta, salsas', 
     18000, true, 3);

-- ============================================================================
-- PRODUCTOS - BEBIDAS
-- ============================================================================

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_bebidas, 
     'GASEOSA 350ML', 
     'Coca Cola, Sprite, Colombiana o Manzana', 
     3000, true, 1);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_bebidas, 
     'GASEOSA 1.5L', 
     'Coca Cola, Sprite, Colombiana o Manzana', 
     6000, true, 2);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_bebidas, 
     'JUGO NATURAL', 
     'Lulo, mora, mango, maracuyá o guanábana', 
     5000, true, 3);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_bebidas, 
     'LIMONADA NATURAL', 
     'Limonada natural con hielo', 
     4000, true, 4);

INSERT INTO products (id, businessman_id, category_id, name, description, price, is_available, "order")
VALUES 
    (gen_random_uuid(), v_businessman_id, v_cat_bebidas, 
     'AGUA EN BOTELLA', 
     'Agua mineral 600ml', 
     2500, true, 5);

RAISE NOTICE 'Datos insertados correctamente!';
RAISE NOTICE 'Total categorías: 7';
RAISE NOTICE 'Total productos: ~30';
RAISE NOTICE 'Total modificadores: 6';

END $$;
