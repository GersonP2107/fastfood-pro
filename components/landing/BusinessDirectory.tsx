'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Businessman } from '@/lib/types';
import { BusinessFilters, FilterState } from '@/components/landing/BusinessFilters';
import { MapPin, Clock, Phone } from 'lucide-react';

interface BusinessDirectoryProps {
    businesses: Businessman[];
    deliveryZones?: Map<string, string[]>; // businessman_id -> zone_names[]
}

export function BusinessDirectory({ businesses, deliveryZones }: BusinessDirectoryProps) {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        selectedCity: '',
        selectedType: '',
        selectedZone: '',
    });

    // Filter businesses based on active filters
    const filteredBusinesses = useMemo(() => {
        return businesses.filter((biz) => {
            // Search filter
            if (
                filters.searchTerm &&
                !biz.business_name.toLowerCase().includes(filters.searchTerm.toLowerCase())
            ) {
                return false;
            }

            // City filter
            if (filters.selectedCity && biz.city !== filters.selectedCity) {
                return false;
            }

            // Business type filter
            if (filters.selectedType && biz.business_type !== filters.selectedType) {
                return false;
            }

            // Delivery zone filter
            if (filters.selectedZone && deliveryZones) {
                const zones = deliveryZones.get(biz.id) || [];
                const hasZone = zones.some((zone) =>
                    zone.toLowerCase().includes(filters.selectedZone.toLowerCase())
                );
                if (!hasZone) return false;
            }

            return true;
        });
    }, [businesses, filters, deliveryZones]);

    return (
        <div>
            {/* Filters */}
            <BusinessFilters onFilterChange={setFilters} />

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-gray-600">
                    {filteredBusinesses.length === 0 ? (
                        'No se encontraron restaurantes'
                    ) : filteredBusinesses.length === 1 ? (
                        '1 restaurante encontrado'
                    ) : (
                        `${filteredBusinesses.length} restaurantes encontrados`
                    )}
                </p>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((biz) => (
                    <Link
                        href={`/${biz.slug}`}
                        key={biz.id}
                        className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:border-orange-200"
                    >
                        {/* Logo/Image */}
                        <div className="relative h-48 bg-linear-to-br from-orange-100 to-amber-50 overflow-hidden">
                            {biz.logo_url ? (
                                <img
                                    src={biz.logo_url}
                                    alt={biz.business_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-3xl">
                                        {biz.business_name.substring(0, 2).toUpperCase()}
                                    </div>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                {biz.accept_orders ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-full shadow-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Abierto
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-full shadow-sm">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        Cerrado
                                    </span>
                                )}
                            </div>

                            {/* Business Type Badge */}
                            {biz.business_type && (
                                <div className="absolute top-3 left-3">
                                    <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-700 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                        {getBusinessTypeLabel(biz.business_type)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {/* Business Name */}
                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-1">
                                {biz.business_name}
                            </h2>

                            {/* Description */}
                            {biz.description && (
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {biz.description}
                                </p>
                            )}

                            {/* Info Row */}
                            <div className="space-y-2 text-sm text-gray-500">
                                {/* City */}
                                {biz.city && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{biz.city}</span>
                                    </div>
                                )}

                                {/* Hours */}
                                {biz.opening_hours && biz.closing_hours && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 shrink-0" />
                                        <span>
                                            {biz.opening_hours} - {biz.closing_hours}
                                        </span>
                                    </div>
                                )}

                                {/* Phone */}
                                {biz.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>{biz.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="text-orange-600 font-semibold text-sm group-hover:text-orange-700 flex items-center justify-between">
                                    Ver Menú
                                    <svg
                                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Empty State */}
                {filteredBusinesses.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No se encontraron restaurantes
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Intenta ajustar los filtros para ver más resultados
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to get business type label
function getBusinessTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        hamburguesas: '🍔 Hamburguesas',
        pizza: '🍕 Pizza',
        comida_rapida: '🍟 Comida Rápida',
        pollo: '🍗 Pollo',
        asados: '🥩 Asados',
        comida_mexicana: '🌮 Mexicana',
        sushi: '🍣 Sushi',
        postres: '🍰 Postres',
        bebidas: '🥤 Bebidas',
        panaderia: '🥖 Panadería',
        comida_saludable: '🥗 Saludable',
        mariscos: '🦐 Mariscos',
    };
    return labels[type] || type;
}
