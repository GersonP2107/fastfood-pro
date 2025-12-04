'use client';

// ============================================================================
// FoodFast Pro - Category Filter Component (Tab Style)
// ============================================================================

import { motion } from 'framer-motion';
import type { Category } from '@/lib/types';
import { Search, Menu } from 'lucide-react';

interface CategoryFilterProps {
    categorias: Category[];
    selectedCategoryId?: string;
    onSelectCategory: (categoryId?: string) => void;
}

export function CategoryFilter({
    categorias,
    selectedCategoryId,
    onSelectCategory,
}: CategoryFilterProps) {
    return (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
                {/* Top Bar with Search and Menu */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                    {/* Search Icon */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Menu Icon */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Category Tabs - Horizontal Scroll */}
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-1 min-w-max">
                            {/* All Categories Tab */}
                            <motion.button
                                onClick={() => onSelectCategory(undefined)}
                                whileTap={{ scale: 0.95 }}
                                className={`relative px-4 py-2 font-semibold whitespace-nowrap transition-colors ${!selectedCategoryId
                                        ? 'text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                PROMO DICIEMBRE
                                {!selectedCategoryId && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>

                            {/* Category Tabs */}
                            {categorias.map((categoria) => (
                                <motion.button
                                    key={categoria.id}
                                    onClick={() => onSelectCategory(categoria.id)}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative px-4 py-2 font-semibold whitespace-nowrap transition-colors uppercase text-sm ${selectedCategoryId === categoria.id
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {categoria.name}
                                    {selectedCategoryId === categoria.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
