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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Buscar restaurante por nombre..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter('searchTerm', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* City Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Ciudad
                    </label>
                    <select
                        value={filters.selectedCity}
                        onChange={(e) => updateFilter('selectedCity', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                        <option value="">Todas las ciudades</option>
                        {CITIES.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Delivery Zone Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Zona de entrega
                    </label>
                    <input
                        type="search"
                        placeholder="Ej: Limonar, Ciudad Jardín..."
                        value={filters.selectedZone}
                        onChange={(e) => updateFilter('selectedZone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Business Type Filter - Chips */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    <UtensilsCrossed className="w-4 h-4 inline mr-1" />
                    Tipo de comida
                </label>
                <div className="flex flex-wrap gap-2">
                    {BUSINESS_TYPES.map((type) => (
                        <button
                            key={type.value}
                            onClick={() =>
                                updateFilter(
                                    'selectedType',
                                    filters.selectedType === type.value ? '' : type.value
                                )
                            }
                            className={`px-4 py-2 rounded-full font-medium transition-all ${filters.selectedType === type.value
                                    ? 'bg-orange-500 text-white shadow-md scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
