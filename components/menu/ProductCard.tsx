'use client';

// ============================================================================
// FoodFast Pro - Product Card Component (Modern UI Style)
// ============================================================================

import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { Plus, Sparkles, Check } from 'lucide-react';
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
            <div className="group bg-white rounded-[24px] shadow-sm transition-all duration-300 p-3 sm:p-4 flex gap-4 items-center relative overflow-hidden">

                {/* Left Side - Product Image (Square Rounded) */}
                <div className="relative w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] shrink-0 rounded-[20px] overflow-hidden bg-gray-50 flex-none shadow-sm">
                    <Image
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 110px, 130px"
                    />

                    {/* Offer Badge overlapping image */}
                    {tieneDescuento && (
                        <div className="absolute top-0 right-0 bg-[#fa0050] text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-bl-xl shadow-sm">
                            ¡Oferta!
                        </div>
                    )}
                </div>

                {/* Right Side - Product Info */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0 min-h-[110px] sm:min-h-[130px]">
                    <div>
                        {/* Tags / Badges */}
                        {product.featured && (
                            <div className="mb-1">
                                <span className="inline-flex items-center gap-1 text-[#fa0050] bg-rose-50 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-[#fa0050]/20">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Destacado
                                </span>
                            </div>
                        )}

                        {/* Product Name */}
                        <h4 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight mb-1 truncate">
                            {product.name}
                        </h4>

                        {/* Description */}
                        {product.description && (
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-snug">
                                {product.description}
                            </p>
                        )}

                        {/* Stock Warning */}
                        {product.limited_stock && product.stock_quantity !== null && product.stock_quantity < 10 && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                ⏳ Solo quedan {product.stock_quantity}
                            </span>
                        )}
                    </div>

                    {/* Bottom Row - Price & Action */}
                    <div className="flex items-end justify-between mt-auto pt-2">
                        {/* Price */}
                        <div className="flex flex-col">
                            {tieneDescuento && (
                                <span className="text-xs text-gray-400 line-through font-medium mb-0.5">
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                            <span className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                                {formatCurrency(precioFinal)}
                            </span>
                        </div>

                        {/* Add Button - Pure Circle */}
                        <div className="relative shrink-0">
                            {/* Particles effect */}
                            {showParticles && (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                            animate={{
                                                opacity: 0,
                                                scale: 0.95,
                                                x: Math.cos((i * 60) * Math.PI / 180) * 40,
                                                y: Math.sin((i * 60) * Math.PI / 180) * 40
                                            }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#fa0050] rounded-full z-20"
                                            style={{ transform: 'translate(-50%, -50%)' }}
                                        />
                                    ))}
                                </>
                            )}

                            <motion.button
                                onClick={handleClick}
                                animate={controls}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-10 ${isAdding ? 'bg-green-500 shadow-green-500/30' : 'bg-[#fa0050] hover:bg-[#d4003e] shadow-rose-500/20'
                                    } text-white`}
                                aria-label="Agregar al carrito"
                            >
                                {/* Ripple effect */}
                                {isAdding && (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0 bg-white rounded-full"
                                    />
                                )}

                                <motion.div animate={isAdding ? { rotate: 360, scale: [1, 0, 1] } : {}} transition={{ duration: 0.4 }}>
                                    {isAdding ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
                                </motion.div>
                            </motion.button>
                        </div>
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
