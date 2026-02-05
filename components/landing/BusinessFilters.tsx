'use client';

import { useState } from 'react';
import { Search, MapPin, UtensilsCrossed, X } from 'lucide-react';

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
    { value: 'hamburguesas', label: '🍔 Hamburguesas', emoji: '🍔' },
    { value: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
    { value: 'comida_rapida', label: '🍟 Comida Rápida', emoji: '🍟' },
    { value: 'pollo', label: '🍗 Pollo', emoji: '🍗' },
    { value: 'asados', label: '🥩 Asados', emoji: '🥩' },
    { value: 'comida_mexicana', label: '🌮 Mexicana', emoji: '🌮' },
    { value: 'sushi', label: '🍣 Sushi', emoji: '🍣' },
    { value: 'postres', label: '🍰 Postres', emoji: '🍰' },
    { value: 'bebidas', label: '🥤 Bebidas', emoji: '🥤' },
    { value: 'panaderia', label: '🥖 Panadería', emoji: '🥖' },
    { value: 'comida_saludable', label: '🥗 Saludable', emoji: '🥗' },
    { value: 'mariscos', label: '🦐 Mariscos', emoji: '🦐' },
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

    const hasActiveFilters =
        filters.searchTerm ||
        filters.selectedCity ||
        filters.selectedType ||
        filters.selectedZone;

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-12">
            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="search"
                        placeholder="¿Qué se te antoja hoy? (Ej: Hamburguesa, Sushi...)"
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter('searchTerm', e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-gray-50/50 hover:bg-white border-0 rounded-full focus:ring-4 focus:ring-orange-100/50 focus:bg-white outline-none transition-all text-lg shadow-[0_2px_15px_rgb(0,0,0,0.05)] placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                {/* City Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                        <MapPin className="w-4 h-4 inline mr-1 text-orange-500" />
                        Ciudad
                    </label>
                    <div className="relative">
                        <select
                            value={filters.selectedCity}
                            onChange={(e) => updateFilter('selectedCity', e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all appearance-none cursor-pointer hover:bg-white shadow-[0_2px_10px_rgb(0,0,0,0.03)]"
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
                </div>

                {/* Delivery Zone Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                        <MapPin className="w-4 h-4 inline mr-1 text-orange-500" />
                        Zona de entrega
                    </label>
                    <input
                        type="search"
                        placeholder="Ej: El Poblado, Chapinero..."
                        value={filters.selectedZone}
                        onChange={(e) => updateFilter('selectedZone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all hover:bg-white shadow-[0_2px_10px_rgb(0,0,0,0.03)]"
                    />
                </div>
            </div>

            {/* Clear Filters Button - centered below inputs */}
            {hasActiveFilters && (
                <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors font-medium flex items-center gap-2 text-sm"
                    >
                        <X className="w-4 h-4" />
                        Limpiar todos los filtros
                    </button>
                </div>
            )}

            {/* Business Type Filter - Chips */}
            <div className="border-t border-gray-100 pt-8">
                <label className="block text-sm font-bold text-gray-700 mb-4 text-center">
                    <UtensilsCrossed className="w-4 h-4 inline mr-2 text-orange-500" />
                    Explora por categorías
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                    {BUSINESS_TYPES.map((type) => (
                        <button
                            key={type.value}
                            onClick={() =>
                                updateFilter(
                                    'selectedType',
                                    filters.selectedType === type.value ? '' : type.value
                                )
                            }
                            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 border ${filters.selectedType === type.value
                                ? 'bg-orange-500 text-white border-orange-600 shadow-md transform -translate-y-1'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                }`}
                        >
                            <span className="mr-2">{type.emoji}</span>
                            {type.label.split(' ').slice(1).join(' ')}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
