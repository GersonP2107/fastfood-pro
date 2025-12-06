-- ============================================================================
-- FoodFast Pro - Delivery Zones Migration
-- ============================================================================
-- This migration adds support for delivery zones with custom pricing per zone

-- Create delivery_zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    businessman_id UUID NOT NULL REFERENCES businessmen(id) ON DELETE CASCADE,
    zone_name VARCHAR(255) NOT NULL,
    delivery_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique zone names per businessman
    CONSTRAINT unique_zone_per_businessman UNIQUE (businessman_id, zone_name)
);

-- Create index for faster queries
CREATE INDEX idx_delivery_zones_businessman ON delivery_zones(businessman_id);
CREATE INDEX idx_delivery_zones_active ON delivery_zones(businessman_id, is_active);

-- Enable RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to active delivery zones
CREATE POLICY "Public can view active delivery zones"
    ON delivery_zones
    FOR SELECT
    USING (is_active = true);

-- Allow businessmen to manage their own delivery zones
CREATE POLICY "Businessmen can manage their delivery zones"
    ON delivery_zones
    FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM businessmen WHERE id = businessman_id
    ));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_delivery_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_zones_updated_at
    BEFORE UPDATE ON delivery_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_zones_updated_at();

-- Insert sample data for testing (optional)
-- You can remove this section in production
INSERT INTO delivery_zones (businessman_id, zone_name, delivery_cost) 
SELECT 
    id,
    unnest(ARRAY[
        'LA HACIENDA', 'TEQUENDAMA', 'LIMONAR', 'EL DORADO', 'CIUDAD JARDIN',
        'VEGAS DE COMFANDI', 'REPUBLICA DE ISRAEL', 'BELALCAZAR', 'ALAMEDA',
        'PUERTO RELLENA', 'LLANO VERDE', 'CHAMPAGNAT', 'CALICANTO', 'VALLADO',
        'VALLE DEL LILI', 'SANTA HELENA', 'COLSEGUROS', 'UNION', 'CANEY',
        'CAPRI', 'DEPARTAMENTAL', 'MARIANO RAMOS', 'GUADUALES', 'NAPOLES',
        'BOCHALEMA', 'CRISTOBAL COLON', 'CIUDADELA COMFANDI', 'CAMINO REAL',
        'SAUCES', 'CIUDAD MELENDEZ', 'LAS VEGAS', 'PRIMERA DE MAYO',
        'EL REFUGIO', 'CIUDAD PACIFICA', 'SAN JUDAS', 'CUARTO DE LEGUA',
        'CIUDAD CORDOBA', 'GUAYAQUIL', 'JUNIN', 'LOS CAMBULOS', 'CAÑAVERALES',
        'VAYADO', 'SANTA ANITA', 'SAN NICOLAS', 'JARDIN', 'MORICHAL',
        'PAMPALINDA', 'SANTA LIBRADA', 'LA INDEPENDENCIA', 'LIDO',
        'PRADOS DEL LIMONAR', 'CIUDAD 2000', 'EL DIAMANTE', 'GUABAL',
        'BATALLON', 'ANTONIO NARIÑO', 'HACIENDA KACHIPAY', 'LA SELVA',
        'INGENIO', 'PASO ANCHO', 'PANCE', 'CAÑAS GORDAS', 'Meléndez',
        'SAN FERNANDO'
    ]),
    (RANDOM() * 5000 + 3000)::DECIMAL(10,2) -- Random cost between 3000 and 8000
FROM businessmen
LIMIT 1; -- Only for the first businessman as example

COMMENT ON TABLE delivery_zones IS 'Stores delivery coverage zones and costs for each businessman';
COMMENT ON COLUMN delivery_zones.zone_name IS 'Name of the neighborhood/zone';
COMMENT ON COLUMN delivery_zones.delivery_cost IS 'Cost of delivery to this zone in local currency';
COMMENT ON COLUMN delivery_zones.is_active IS 'Whether this zone is currently available for delivery';
