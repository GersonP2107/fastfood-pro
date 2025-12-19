import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Businessman } from '@/lib/types';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all active merchants
  const { data: businesses } = await supabase
    .from('businessmans')
    .select('*')
    .eq('is_active', true)
    .order('business_name') as { data: Businessman[] | null; error: any };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FoodFast Pro
          </h1>
          <p className="text-xl text-gray-600">
            Los mejores restaurantes en un solo lugar.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses?.map((biz) => (
            <Link
              href={`/${biz.slug}`}
              key={biz.id}
              className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {biz.logo_url ? (
                    <img
                      src={biz.logo_url}
                      alt={biz.business_name}
                      className="w-16 h-16 rounded-full object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                      {biz.business_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {biz.business_name}
                    </h2>
                    {biz.accept_orders ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full">
                        Abierto
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-full">
                        Cerrado
                      </span>
                    )}
                  </div>
                </div>

                {biz.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {biz.description}
                  </p>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Ver Menú &rarr;</span>
                </div>
              </div>
            </Link>
          ))}

          {(!businesses || businesses.length === 0) && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                No hay restaurantes disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
