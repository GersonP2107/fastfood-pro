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
        <div className={`sticky top-0 sm:top-2 z-30 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 rounded-[24px]`}>
            <div className="container mx-auto px-4">
                {/* Top Bar with Action Buttons and Tabs */}
                <div className="flex items-center gap-2 py-3">
                    {/* Search Icon */}
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (showSearch) setSearchQuery('');
                        }}
                        className={`p-2.5 rounded-full transition-colors shrink-0 ${showSearch
                            ? 'bg-[#fa0050] text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
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
                        className={`p-2.5 rounded-full transition-colors shrink-0 mr-1 ${showMenu
                            ? 'bg-[#fa0050] text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Category Tabs - Horizontal Scroll */}
                    <div className="flex-1 overflow-x-auto scrollbar-hide -mr-4 pr-4">
                        <div className="flex gap-4 min-w-max items-center h-full">
                            {/* All Categories Tab */}
                            <motion.button
                                onClick={() => onSelectCategory(undefined)}
                                className={`relative py-2 transition-colors ${!selectedCategoryId
                                    ? 'text-gray-900 font-black text-base'
                                    : 'text-gray-400 font-medium text-sm hover:text-gray-700'
                                    }`}
                            >
                                TODOS
                                {!selectedCategoryId && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-6 bg-[#fa0050] rounded-t-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>

                            {/* Category Tabs */}
                            {categorias.map((categoria) => (
                                <motion.button
                                    key={categoria.id}
                                    onClick={() => onSelectCategory(categoria.id)}
                                    className={`relative py-2 transition-colors uppercase ${selectedCategoryId === categoria.id
                                        ? 'text-gray-900 font-bold text-base'
                                        : 'text-gray-400 font-medium text-sm hover:text-gray-700'
                                        }`}
                                >
                                    {categoria.name}
                                    {selectedCategoryId === categoria.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-6 bg-[#fa0050] rounded-t-full"
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
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#fa0050] transition-colors"
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
                                        ? 'bg-[#fa0050] text-white rounded-full'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    TODOS
                                </button>
                                {categorias.map((categoria) => (
                                    <button
                                        key={categoria.id}
                                        onClick={() => {
                                            onSelectCategory(categoria.id);
                                            setShowMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors uppercase text-sm ${selectedCategoryId === categoria.id
                                            ? 'bg-[#fa0050] text-white rounded-full'
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
