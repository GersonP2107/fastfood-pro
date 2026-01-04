'use client';

import { useState, useEffect } from 'react';
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
    const [selectedTable, setSelectedTable] = useState<string>('');

    // Clear cart if it contains items from a different merchant or context
    // Ideally we might want to persist POS cart differently, but for now reuse store
    useEffect(() => {
        if (items.length > 0) {
            // Optional check logic
        }
    }, []);

    const handleTableSelect = (tableNumber: string) => {
        setSelectedTable(tableNumber);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        POS
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">{businessman.business_name}</h1>
                        <p className="text-xs text-gray-500">Modo Mesero</p>
                    </div>
                </div>
                {selectedTable && (
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        Mesa: {selectedTable}
                    </div>
                )}
            </header>

            <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
                {/* Zone & Table Selector */}
                {businessman.zones && businessman.zones.length > 0 ? (
                    <ZoneSelector
                        zones={businessman.zones}
                        onTableSelect={handleTableSelect}
                        selectedTable={selectedTable}
                    />
                ) : (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
                        ⚠️ No hay zonas ni mesas configuradas para este negocio.
                        <br />
                        <span className="text-xs text-yellow-600 mt-1 block">
                            (Se requiere configuración en base de datos: restaurant_zones y tables)
                        </span>
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
                isPOS={true}
            />
        </div>
    );
}
