import { createClient } from '@/lib/supabase/server';
import { Businessman } from '@/lib/types';
import { BusinessDirectory } from '@/components/landing/BusinessDirectory';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all active merchants with delivery zones
  const { data: businesses } = (await supabase
    .from('businessmans')
    .select(`
      *,
      delivery_zones (
        zone_name,
        is_active
      )
    `)
    .eq('is_active', true)
    .order('business_name')) as { data: (Businessman & { delivery_zones?: { zone_name: string; is_active: boolean }[] })[] | null };

  // Create a map of businessman_id -> zone names for filtering
  const deliveryZonesMap = new Map<string, string[]>();
  businesses?.forEach((biz) => {
    if (biz.delivery_zones) {
      const activeZones = biz.delivery_zones
        .filter((z) => z.is_active)
        .map((z) => z.zone_name);
      deliveryZonesMap.set(biz.id, activeZones);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            FoodFast Pro
          </h1>
          <p className="text-xl md:text-2xl text-orange-50 mb-2">
            Los mejores restaurantes en un solo lugar
          </p>
          <p className="text-orange-100">
            Encuentra tu comida favorita y ordena con facilidad
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <BusinessDirectory
          businesses={businesses || []}
          deliveryZones={deliveryZonesMap}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              Powered by{' '}
              <span className="font-semibold text-orange-600">FoodFast Pro</span>
            </p>
            <p className="text-xs text-gray-400">
              Plataforma de menús digitales y pedidos en línea
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
