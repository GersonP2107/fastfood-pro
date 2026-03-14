'use client';

import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessFiltersProps {
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    searchTerm: string;
    selectedCity: string;
    selectedType: string;
    selectedZone: string;
}

const BUSINESS_TYPES = [
    { value: 'hamburguesas', label: '🍔  Hamburguesas' },
    { value: 'pizza', label: '🍕  Pizza' },
    { value: 'comida_rapida', label: '🍟  Comida Rápida' },
    { value: 'pollo', label: '🍗  Pollo' },
    { value: 'asados', label: '🥩  Asados' },
    { value: 'comida_mexicana', label: '🌮  Mexicana' },
    { value: 'sushi', label: '🍣  Sushi' },
    { value: 'postres', label: '🍰  Postres' },
    { value: 'bebidas', label: '🥤  Bebidas' },
    { value: 'panaderia', label: '🥖  Panadería' },
    { value: 'comida_saludable', label: '🥗  Saludable' },
    { value: 'mariscos', label: '🦐  Mariscos' },
];

const CITIES = [
    'Cali',
    'Bogotá',
    'Medellín',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales',
    'Ibagué',
    'Pasto',
];

export function BusinessFilters({ onFilterChange }: BusinessFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        selectedCity: '',
        selectedType: '',
        selectedZone: '',
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters: FilterState = {
            searchTerm: '',
            selectedCity: '',
            selectedType: '',
            selectedZone: '',
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const hasAdvancedFilters = filters.selectedCity || filters.selectedZone;
    const hasAnyFilters = filters.searchTerm || hasAdvancedFilters || filters.selectedType;

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_2px_30px_rgb(0,0,0,0.05)] p-4 md:p-6 mb-12">
            {/* Top Bar: Search and Settings Toggle */}
            <div className="flex items-center gap-3 w-full mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Buscar por nombre (Ej: Casa del Sabor...)"
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter('searchTerm', e.target.value)}
                        className="w-full pl-14 pr-5 py-3.5 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-[#fa0050]/20 focus:bg-white outline-none transition-all text-sm shadow-sm placeholder:text-gray-400"
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`p-3.5 rounded-full transition-colors shrink-0 shadow-sm ${showAdvancedFilters || hasAdvancedFilters
                        ? 'bg-[#fa0050] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Advanced Filters Section - Animated */}
            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-100 mb-2">
                            {/* City Filter */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <MapPin className="w-4 h-4 text-[#fa0050]" />
                                </div>
                                <select
                                    value={filters.selectedCity}
                                    onChange={(e) => updateFilter('selectedCity', e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#fa0050]/20 focus:bg-white outline-none transition-all appearance-none cursor-pointer text-sm font-medium text-gray-700"
                                >
                                    <option value="">Todas las ciudades</option>
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Delivery Zone Filter */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <MapPin className="w-4 h-4 text-[#fa0050]" />
                                </div>
                                <input
                                    type="search"
                                    placeholder="Zona de entrega (Ej: El Poblado)..."
                                    value={filters.selectedZone}
                                    onChange={(e) => updateFilter('selectedZone', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#fa0050]/20 focus:bg-white outline-none transition-all text-sm font-medium text-gray-700 placeholder:text-gray-500 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Tabs - Horizontal Scroll (Matching the Menu style) */}
            <div className="relative mt-2">
                <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
                    <div className="flex gap-6 min-w-max items-center h-full pb-2">
                        {/* All Categories Tab */}
                        <motion.button
                            onClick={() => updateFilter('selectedType', '')}
                            className={`relative py-2 px-1 transition-colors uppercase tracking-wider ${!filters.selectedType
                                ? 'text-gray-900 font-black text-sm'
                                : 'text-gray-400 font-semibold text-sm hover:text-gray-700'
                                }`}
                        >
                            TODOS
                            {!filters.selectedType && (
                                <motion.div
                                    layoutId="activeBusinessTab"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-6 bg-[#fa0050] rounded-t-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>

                        {/* Category Tabs */}
                        {BUSINESS_TYPES.map((type) => (
                            <motion.button
                                key={type.value}
                                onClick={() => updateFilter('selectedType', type.value)}
                                className={`relative py-2 px-1 transition-colors uppercase tracking-wider ${filters.selectedType === type.value
                                    ? 'text-gray-900 font-black text-sm'
                                    : 'text-gray-400 font-semibold text-sm hover:text-gray-700'
                                    }`}
                            >
                                {type.label}
                                {filters.selectedType === type.value && (
                                    <motion.div
                                        layoutId="activeBusinessTab"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-6 bg-[#fa0050] rounded-t-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {hasAnyFilters && (
                <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={clearFilters}
                        className="px-5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors font-medium flex items-center gap-2 text-xs uppercase tracking-wider"
                    >
                        <X className="w-3.5 h-3.5" />
                        Limpiar Búsqueda
                    </button>
                </div>
            )}
        </div>
    );
}
