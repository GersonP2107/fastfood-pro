# Guía de Uso - Script de Datos de Prueba

## 📋 Contenido del Script

El script `seed-data.sql` incluye:

### Categorías (7 total):
1. **PROMO DICIEMBRE** - Promociones especiales
2. **ANTOJOS** - Papas, yucas, aros de cebolla, tenders
3. **HAPPY WINGS** - Alitas con diferentes salsas
4. **PANCRUSH** - Pan crujiente con rellenos
5. **BURGUESAS** - Hamburguesas artesanales
6. **SALCHIPAPA PERSONAL** - Salchipapas individuales
7. **BEBIDAS** - Gaseosas, jugos, limonadas

### Productos (~30 total):
- Combos promocionales
- Antojos variados
- Alitas en diferentes sabores
- Hamburguesas con modificadores
- Salchipapas
- Bebidas

### Modificadores (6 total):
- Queso Extra (+$2,000)
- Tocineta (+$3,000)
- Huevo (+$2,000)
- Aguacate (+$3,000)
- Sin Cebolla (gratis)
- Sin Tomate (gratis)

## 🚀 Cómo Ejecutar el Script

### Paso 1: Obtener tu Businessman ID

Primero, necesitas obtener el ID de tu negocio. En Supabase SQL Editor, ejecuta:

```sql
SELECT id, business_name, slug FROM businessmans LIMIT 5;
```

Copia el `id` (UUID) del negocio que quieres usar.

### Paso 2: Editar el Script

Abre el archivo `database/seed-data.sql` y reemplaza esta línea:

```sql
v_businessman_id UUID := 'YOUR_BUSINESSMAN_ID'; -- REEMPLAZAR CON TU ID
```

Por ejemplo:
```sql
v_businessman_id UUID := '123e4567-e89b-12d3-a456-426614174000';
```

### Paso 3: Ejecutar en Supabase

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Crea una nueva query
4. Copia y pega todo el contenido del archivo `seed-data.sql`
5. Haz clic en **Run** o presiona `Ctrl+Enter`

### Paso 4: Verificar

Ejecuta estas queries para verificar que los datos se insertaron:

```sql
-- Ver categorías
SELECT name, "order" FROM categories ORDER BY "order";

-- Ver productos por categoría
SELECT c.name as categoria, p.name as producto, p.price
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c."order", p."order";

-- Ver modificadores
SELECT name, additional_price, type FROM modifiers;
```

## 🎨 Personalización

### Agregar Imágenes a los Productos

Los productos no tienen imágenes por defecto. Para agregar imágenes:

```sql
UPDATE products 
SET image_url = 'https://tu-url-de-imagen.com/imagen.jpg'
WHERE name = 'NOMBRE_DEL_PRODUCTO';
```

### Cambiar Precios

```sql
UPDATE products 
SET price = 20000 
WHERE name = 'HAMBURGUESA CLÁSICA';
```

### Agregar Más Productos

```sql
INSERT INTO products (businessman_id, category_id, name, description, price, is_available, "order")
VALUES (
    'TU_BUSINESSMAN_ID',
    (SELECT id FROM categories WHERE name = 'BURGUESAS'),
    'HAMBURGUESA VEGETARIANA',
    'Hamburguesa de lentejas con vegetales frescos',
    16000,
    true,
    5
);
```

## 🧹 Limpiar Datos de Prueba

Si quieres eliminar todos los datos de prueba:

```sql
-- CUIDADO: Esto eliminará TODOS los datos
DELETE FROM product_modifiers WHERE product_id IN (
    SELECT id FROM products WHERE businessman_id = 'TU_BUSINESSMAN_ID'
);

DELETE FROM products WHERE businessman_id = 'TU_BUSINESSMAN_ID';
DELETE FROM modifiers WHERE businessman_id = 'TU_BUSINESSMAN_ID';
DELETE FROM categories WHERE businessman_id = 'TU_BUSINESSMAN_ID';
```

## 📝 Notas Importantes

- Los precios están en pesos colombianos (COP)
- Algunos productos tienen modificadores asociados (hamburguesas, pancrush)
- Los productos destacados (`featured = true`) aparecerán con badge especial
- Las promociones tienen `discount_price` para mostrar descuentos
- El orden (`order`) determina cómo se muestran en el menú

## 🎯 Resultado Esperado

Después de ejecutar el script, tu menú digital mostrará:
- 7 categorías organizadas
- ~30 productos con descripciones
- Productos con y sin descuentos
- Productos destacados con badge
- Modificadores funcionales en hamburguesas

¡Listo para probar tu UI! 🚀
