'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Businessman, Category, Product, DeliveryZone, RestaurantZone, RestaurantTable, Order } from '@/lib/types';
import { Cart } from './Cart';
import { MenuDisplay } from './MenuDisplay';
import { ZoneSelector } from './ZoneSelector';
import { useCartStore } from '@/lib/cart-store';

interface POSMenuClientProps {
    businessman: Businessman & { zones?: RestaurantZone[] };
    categories: Category[];
    products: Product[];
    deliveryZones: DeliveryZone[];
}

export function POSMenuClient({
    businessman,
    categories,
    products,
    deliveryZones
}: POSMenuClientProps) {
    const { items, clearCart } = useCartStore();
    const searchParams = useSearchParams();

    // Initialize state from URL params if available
    const [selectedTable, setSelectedTable] = useState<string>(searchParams.get('table') || '');
    const [selectedZone, setSelectedZone] = useState<string>(searchParams.get('zone') || '');

    // Clear cart if it contains items from a different merchant or context
    // Ideally we might want to persist POS cart differently, but for now reuse store
    useEffect(() => {
        if (items.length > 0) {
            // Optional check logic
        }
    }, []);

    // Update state if URL params change (e.g. navigation)
    useEffect(() => {
        const tableParam = searchParams.get('table');
        const zoneParam = searchParams.get('zone');
        if (tableParam) setSelectedTable(tableParam);
        if (zoneParam) setSelectedZone(zoneParam);
    }, [searchParams]);

    const handleTableSelect = (tableNumber: string, zoneName: string) => {
        setSelectedTable(tableNumber);
        setSelectedZone(zoneName);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img
                            src={businessman.logo_url || "https://placehold.net/main.svg"}
                            alt={businessman.business_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">{businessman.business_name}</h1>
                        <p className="text-xs text-gray-500">Modo Mesero</p>
                    </div>
                </div>
                {selectedTable && (
                    <div className="bg-rose-100 text-[#fa0050] px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        Mesa: {selectedTable}
                    </div>
                )}
            </header>

            <main className="grow container mx-auto px-4 py-6 max-w-5xl">
                {/* Zone & Table Selector */}
                {businessman.zones && businessman.zones.length > 0 ? (
                    <ZoneSelector
                        zones={businessman.zones}
                        onTableSelect={handleTableSelect}
                        selectedTable={selectedTable}
                        selectedZoneName={selectedZone}
                    />
                ) : (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
                        ⚠️ No hay zonas ni mesas configuradas para este negocio.
                    </div>
                )}

                {/* Menu Display (reuse existing component but simpler?) */}
                <MenuDisplay
                    businessmanId={businessman.id}
                    businessmanSlug={businessman.slug}
                    initialCategories={categories}
                    initialProducts={products}
                    compactMode={true} // Add this prop to MenuDisplay if we want a grid view without large headers
                />
            </main>

            {/* Cart reusing the existing component but forcing dine-in table via isPOS */}
            <Cart
                businessman={businessman}
                deliveryZones={deliveryZones}
                tableNumber={selectedTable}
                zoneName={selectedZone}
                isPOS={true}
            />
        </div>
    );
}
