'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Businessman } from '@/lib/types';
import { BusinessFilters, FilterState } from '@/components/landing/BusinessFilters';
import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section id="directory" className="scroll-mt-20">
            {/* Filters */}
            <BusinessFilters onFilterChange={setFilters} />

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 font-medium">
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
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredBusinesses.map((biz) => (
                    <motion.div key={biz.id} variants={item}>
                        <Link
                            href={`/${biz.slug}`}
                            className="group bg-white rounded-3xl shadow-xl hover:shadow-[0_2px_30px_rgb(0,0,0,0.05)] transition-all duration-300 overflow-hidden h-full flex flex-col hover:-translate-y-1"
                        >
                            {/* Logo/Image */}
                            <div className="relative h-56 bg-linear-to-br from-rose-50 to-pink-50 overflow-hidden">
                                {biz.logo_url ? (
                                    <Image
                                        src={biz.logo_url}
                                        alt={biz.business_name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-[#fa0050] font-bold text-3xl">
                                            {biz.business_name.substring(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    {biz.accept_orders ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/90 backdrop-blur-md rounded-full shadow-sm ring-1 ring-emerald-100">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            Abierto
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50/90 backdrop-blur-md rounded-full shadow-sm ring-1 ring-rose-100">
                                            <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                            Cerrado
                                        </span>
                                    )}
                                </div>

                                {/* Business Type Badge */}
                                {biz.business_type && (
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="inline-block px-3 py-1.5 text-xs font-bold text-gray-700 bg-white/90 backdrop-blur-md rounded-full shadow-sm ring-1 ring-gray-100">
                                            {getBusinessTypeLabel(biz.business_type)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                {/* Business Name */}
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#fa0050] transition-colors mb-3 line-clamp-1">
                                    {biz.business_name}
                                </h2>

                                {/* Description */}
                                {biz.description && (
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                                        {biz.description}
                                    </p>
                                )}

                                {/* Info Row */}
                                <div className="space-y-3 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-auto">
                                    {/* City */}
                                    {biz.city && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-full bg-gray-50 text-gray-400">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                            </div>
                                            <span className="truncate font-medium">{biz.city}</span>
                                        </div>
                                    )}

                                    {/* Hours */}
                                    {biz.opening_hours && biz.closing_hours && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-full bg-gray-50 text-gray-400">
                                                <Clock className="w-4 h-4 shrink-0" />
                                            </div>
                                            <span className="font-medium">
                                                {biz.opening_hours} - {biz.closing_hours}
                                            </span>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {biz.phone && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-full bg-gray-50 text-gray-400">
                                                <Phone className="w-4 h-4 shrink-0" />
                                            </div>
                                            <span className="font-medium">{biz.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* CTA */}
                                <div className="mt-6">
                                    <span className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-900 font-bold py-3 rounded-xl group-hover:bg-black group-hover:text-white transition-all duration-300">
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
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}

                {/* Empty State */}
                {filteredBusinesses.length === 0 && (
                    <motion.div
                        variants={item}
                        className="col-span-full text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-sm">
                            <MapPin className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No se encontraron restaurantes
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Intenta ajustar los filtros de búsqueda o prueba con otra ciudad o tipo de comida.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </section>
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
