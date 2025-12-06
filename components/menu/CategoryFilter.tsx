'use client';

// ============================================================================
// FoodFast Pro - Category Filter Component (Tab Style)
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '@/lib/types';
import { Search, Menu, X } from 'lucide-react';

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
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="sticky top-2 z-20 bg-white shadow-lg rounded-xl">
            <div className="container mx-auto px-4">
                {/* Top Bar with Search and Menu */}
                <div className="flex items-center gap-3 py-3">
                    {/* Search Icon */}
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (showSearch) setSearchQuery('');
                        }}
                        className={`p-2 rounded-lg transition-colors ${showSearch
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        {showSearch ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </button>

                    {/* Menu Icon */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2 rounded-lg transition-colors ${showMenu
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <Menu className="w-5 h-5" />
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

                {/* Search Input - Animated */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-100"
                        >
                            <div className="py-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar productos..."
                                    autoFocus
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu Dropdown - Animated */}
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-100"
                        >
                            <div className="py-3 space-y-1">
                                <button
                                    onClick={() => {
                                        onSelectCategory(undefined);
                                        setShowMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${!selectedCategoryId
                                            ? 'bg-gray-900 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    PROMO DICIEMBRE
                                </button>
                                {categorias.map((categoria) => (
                                    <button
                                        key={categoria.id}
                                        onClick={() => {
                                            onSelectCategory(categoria.id);
                                            setShowMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors uppercase text-sm ${selectedCategoryId === categoria.id
                                                ? 'bg-gray-900 text-white'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {categoria.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
