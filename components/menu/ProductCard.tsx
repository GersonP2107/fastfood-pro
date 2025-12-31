'use client';

// ============================================================================
// FoodFast Pro - Product Card Component (Horizontal Layout)
// ============================================================================

import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { Plus, Tag, Sparkles, Check } from 'lucide-react';
import type { Product, Modifier } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { ModifierModal } from '@/components/menu/ModifierModal';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [showModifierModal, setShowModifierModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const controls = useAnimation();

    const hasModifiers = product.product_modifiers && product.product_modifiers.length > 0;
    const precioFinal = product.discount_price || product.price;
    const tieneDescuento = product.discount_price && product.discount_price < product.price;

    const handleAddToCart = async (modificadores: Modifier[] = []) => {
        addItem(product, modificadores);
        setShowModifierModal(false);

        // Trigger animation
        setIsAdding(true);
        setShowParticles(true);

        // Button animation sequence
        await controls.start({
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, -10, 10, -5, 0],
            transition: { duration: 0.6, ease: "easeInOut" }
        });

        setTimeout(() => {
            setIsAdding(false);
            setShowParticles(false);
        }, 600);
    };

    const handleClick = () => {
        if (hasModifiers) {
            setShowModifierModal(true);
        } else {
            handleAddToCart();
        }
    };

    return (
        <>
            {/* Horizontal Card Layout */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex items-stretch md:h-40">
                {/* Left Side - Product Info */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    {/* Product Name */}
                    <div className="mb-2">
                        <h4 className="md:text-sm text-[16px] font-bold text-gray-900 mb-1">
                            {product.name}
                        </h4>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {product.featured && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    <Sparkles className="w-3 h-3" />
                                    Destacado
                                </span>
                            )}
                            {tieneDescuento && (
                                <span className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    ¡Oferta!
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-[14px] text-gray-600 line-clamp-2">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Bottom Section - Price */}
                    <div className="flex items-center gap-3 mt-auto pt-3">
                        {/* Price */}
                        <div className="flex flex-col">
                            {tieneDescuento && (
                                <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(precioFinal)}
                            </span>
                        </div>
                    </div>

                    {/* Stock Warning */}
                    {product.limited_stock && product.stock_quantity !== null && product.stock_quantity < 10 && (
                        <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                            <p className="text-xs text-orange-700 font-medium">
                                ⚡ Solo quedan {product.stock_quantity}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Side - Product Image */}
                <div className="relative w-40 sm:w-40 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 128px, 160px"
                    />

                    {/* Overlay gradient for better image blend */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />

                    {/* Add Button - Positioned over image with animations */}
                    <div className="absolute bottom-2 right-2 z-10">
                        {/* Particles effect */}
                        {showParticles && (
                            <>
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            opacity: 1,
                                            scale: 1,
                                            x: 0,
                                            y: 0
                                        }}
                                        animate={{
                                            opacity: 0,
                                            scale: 0,
                                            x: Math.cos((i * 60) * Math.PI / 180) * 40,
                                            y: Math.sin((i * 60) * Math.PI / 180) * 40
                                        }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                                        style={{
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                ))}
                            </>
                        )}

                        {/* Animated Button */}
                        <motion.button
                            onClick={handleClick}
                            animate={controls}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative overflow-hidden p-2.5 rounded-lg shadow-lg transition-all duration-300 ${isAdding
                                ? 'bg-green-500'
                                : 'bg-black hover:bg-blue-500 '
                                } text-white`}
                            aria-label="Agregar al carrito"
                        >
                            {/* Ripple effect */}
                            {isAdding && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0 bg-white rounded-lg"
                                />
                            )}

                            {/* Icon with transition */}
                            <motion.div
                                animate={isAdding ? { rotate: 360, scale: [1, 0, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {isAdding ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                            </motion.div>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Modifier Modal */}
            {showModifierModal && hasModifiers && (
                <ModifierModal
                    producto={product}
                    onClose={() => setShowModifierModal(false)}
                    onConfirm={handleAddToCart}
                />
            )}
        </>
    );
}
