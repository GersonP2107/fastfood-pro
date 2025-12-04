'use client';

// ============================================================================
// FoodFast Pro - Cart Component with Animations
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export function Cart() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCartStore();

    const itemCount = getItemCount();
    const total = getTotal();

    return (
        <>
            {/* Fixed Bottom Cart Bar - Only show when there are items */}
            <AnimatePresence>
                {itemCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                            {/* Left side - Item count and total */}
                            <div className="flex flex-col">
                                <motion.span
                                    key={itemCount}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className="text-sm text-gray-600"
                                >
                                    {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                                </motion.span>
                                <motion.span
                                    key={total}
                                    initial={{ scale: 1.3, color: '#3b82f6' }}
                                    animate={{ scale: 1, color: '#000' }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-xl font-bold"
                                >
                                    {formatCurrency(total)}
                                </motion.span>
                            </div>

                            {/* Right side - View cart button */}
                            <motion.button
                                onClick={() => setIsOpen(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 max-w-md bg-black hover:bg-gray-800 hover:text-black text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base transition-all duration-300 shadow-lg"
                            >
                                Ver mi pedido
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop with fade animation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer with slide animation */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-primary/80 text-black p-6 flex items-center justify-between">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3"
                                >
                                    <ShoppingBag className="w-6 h-6" />
                                    <h2 className="text-2xl font-bold">Tu Pedido</h2>
                                </motion.div>
                                <motion.button
                                    onClick={() => setIsOpen(false)}
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 hover:bg-white/20 rounded-full transition"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {items.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center h-full text-gray-400"
                                    >
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <ShoppingCart className="w-20 h-20 mb-4" />
                                        </motion.div>
                                        <p className="text-lg font-semibold">Tu carrito está vacío</p>
                                        <p className="text-sm mt-2">Agrega productos para comenzar</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {items.map((item, index) => (
                                                <motion.div
                                                    key={`${item.product.id}-${index}`}
                                                    layout
                                                    initial={{ opacity: 0, x: -50 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: 100,
                                                        height: 0,
                                                        marginBottom: 0,
                                                        transition: { duration: 0.3 }
                                                    }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-800">{item.product.name}</h3>
                                                            <p className="text-sm text-primary font-semibold mt-1">
                                                                {formatCurrency(item.product.discount_price || item.product.price)}
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => removeItem(item.product.id)}
                                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>

                                                    {/* Modifiers */}
                                                    {item.modifiers_selected.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mb-3 space-y-1"
                                                        >
                                                            {item.modifiers_selected.map((mod) => (
                                                                <p key={mod.id} className="text-xs text-gray-600 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                                    {mod.name}
                                                                    {mod.additional_price > 0 && (
                                                                        <span className="text-primary font-semibold">
                                                                            +{formatCurrency(mod.additional_price)}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            ))}
                                                        </motion.div>
                                                    )}

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 bg-white rounded-xl p-1 border border-gray-200">
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.span
                                                                key={item.quantity}
                                                                initial={{ scale: 1.5, color: '#3b82f6' }}
                                                                animate={{ scale: 1, color: '#1f2937' }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                                className="font-bold w-8 text-center"
                                                            >
                                                                {item.quantity}
                                                            </motion.span>
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                        <motion.span
                                                            key={item.subtotal}
                                                            initial={{ scale: 1.2 }}
                                                            animate={{ scale: 1 }}
                                                            className="text-lg font-bold text-gray-800"
                                                        >
                                                            {formatCurrency(item.subtotal)}
                                                        </motion.span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <AnimatePresence>
                                {items.length > 0 && (
                                    <motion.div
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 25 }}
                                        className="border-t border-gray-200 p-6 bg-gray-50 space-y-4"
                                    >
                                        <div className="flex items-center justify-between text-xl font-bold">
                                            <span className="text-gray-700">Total:</span>
                                            <motion.span
                                                key={total}
                                                initial={{ scale: 1.3, color: '#3b82f6' }}
                                                animate={{ scale: 1, color: 'currentColor' }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className="text-primary text-3xl"
                                            >
                                                {formatCurrency(total)}
                                            </motion.span>
                                        </div>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Link
                                                href="/checkout"
                                                onClick={() => setIsOpen(false)}
                                                className="block w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-black py-4 rounded-xl font-bold text-lg text-center shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Continuar al Pago
                                            </Link>
                                        </motion.div>

                                        <motion.button
                                            onClick={clearCart}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold transition"
                                        >
                                            Vaciar Carrito
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
