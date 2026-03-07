'use client';

// ============================================================================
// FoodFast Pro - Menu Display Component
// ============================================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/menu/ProductCard';
import { CategoryFilter } from '@/components/menu/CategoryFilter';
import { Loader2, UtensilsCrossed } from 'lucide-react';

interface MenuDisplayProps {
    businessmanId: string;
    businessmanSlug?: string;
    initialCategories?: Category[];
    initialProducts?: Product[];
    compactMode?: boolean;
}

export function MenuDisplay({
    businessmanId,
    initialCategories = [],
    initialProducts = [],
    compactMode = false
}: MenuDisplayProps) {
    const [productos, setProductos] = useState<Product[]>(initialProducts);
    const [categorias, setCategorias] = useState<Category[]>(initialCategories);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
    const [loading, setLoading] = useState(initialProducts.length === 0);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchMenuData() {
            if (initialProducts.length > 0 && initialCategories.length > 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch categories
                const { data: categoriasData, error: categoriasError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('businessman_id', businessmanId)
                    .eq('is_active', true)
                    .order('order', { ascending: true });

                if (categoriasError) throw categoriasError;

                // Fetch products with modifiers
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select(`
            *,
            category:categories(id, name),
            product_modifiers(
              id,
              is_required,
              modifier:modifiers(*)
            )
          `)
                    .eq('businessman_id', businessmanId)
                    .eq('is_available', true)
                    .is('deleted_at', null)
                    .order('order', { ascending: true });

                if (productsError) throw productsError;

                setCategorias(categoriasData || []);
                setProductos(productsData || []);
            } catch (err) {
                console.error('Error fetching menu data:', err);
                setError('Error al cargar el menú. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        }

        fetchMenuData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessmanId, initialProducts.length, initialCategories.length]);

    // Filter products by selected category
    const filteredProductos = selectedCategoryId
        ? productos.filter((p) => p.category_id === selectedCategoryId)
        : productos;

    // Group products by category for display
    const productosPorCategoria = categorias.map((categoria) => ({
        categoria,
        productos: filteredProductos.filter((p) => p.category_id === categoria.id),
    }));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#fa0050] mb-4" />
                <p className="text-gray-600 font-medium">Cargando menú...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar</h3>
                <p className="text-red-500 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#fa0050] text-white rounded-lg hover:bg-[#d4003e] transition-colors font-medium"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (productos.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <UtensilsCrossed className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
                <p className="text-gray-600">Vuelve pronto para ver nuestro menú actualizado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            {categorias.length > 0 && (
                <CategoryFilter
                    categorias={categorias}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                />
            )}

            {/* Products Grid */}
            <div className="pt-6">
                <AnimatePresence mode="wait">
                    {selectedCategoryId ? (
                        // Show only selected category
                        <motion.div
                            key={selectedCategoryId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {productosPorCategoria
                                .filter((group) => group.productos.length > 0)
                                .map((group) => (
                                    <div key={group.categoria.id}>
                                        <motion.h2
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className={`text-lg md:text-xl font-bold mb-6 text-gray-900 ${compactMode ? '' : 'pb-2 border-b-2 border-gray-800'
                                                }`}
                                        >
                                            {group.categoria.name}
                                        </motion.h2>
                                        <div className={`grid grid-cols-1 ${compactMode ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                                            {group.productos.map((producto, index) => (
                                                <motion.div
                                                    key={producto.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                        delay: 0.1 + index * 0.05,
                                                        duration: 0.3
                                                    }}
                                                >
                                                    <ProductCard product={producto} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </motion.div>
                    ) : (
                        // Show all categories
                        <motion.div
                            key="all-categories"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-12"
                        >
                            {productosPorCategoria
                                .filter((group) => group.productos.length > 0)
                                .map((group, groupIndex) => (
                                    <motion.div
                                        key={group.categoria.id}
                                        id={`categoria-${group.categoria.id}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: groupIndex * 0.1,
                                            duration: 0.4
                                        }}
                                    >
                                        <div className="mb-6">
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                                {group.categoria.name}
                                            </h2>
                                            {group.categoria.description && (
                                                <p className="text-gray-600">{group.categoria.description}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {group.productos.map((producto, index) => (
                                                <motion.div
                                                    key={producto.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        delay: groupIndex * 0.1 + index * 0.03,
                                                        duration: 0.3
                                                    }}
                                                >
                                                    <ProductCard product={producto} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
