import { createClient } from '@/lib/supabase/server';
import { Businessman } from '@/lib/types';
import { BusinessDirectory } from '@/components/landing/BusinessDirectory';
import { HeroSection } from '@/components/landing/HeroSection';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 grow w-full">
        <BusinessDirectory
          businesses={businesses || []}
          deliveryZones={deliveryZonesMap}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto w-full">
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
