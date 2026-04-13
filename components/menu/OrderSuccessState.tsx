'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface OrderSuccessStateProps {
    orderNumber?: string;
    totalAmount: number;
    paymentMethod: string;
    onClose: () => void;
}

// Confetti-like floating particles
function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
    const [color] = useState(() => ['#fa0050', '#10b981', '#f59e0b', '#6366f1', '#ec4899'][Math.floor(Math.random() * 5)]);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 100, x, scale: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                y: [100, -20, -80, -150],
                scale: [0, 1, 0.8, 0],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: 2.5,
                delay,
                ease: 'easeOut',
            }}
            className="absolute pointer-events-none"
            style={{
                width: size,
                height: size,
                borderRadius: size > 6 ? '3px' : '50%',
                background: color,
            }}
        />
    );
}

export function OrderSuccessState({
    orderNumber,
    totalAmount,
    paymentMethod,
    onClose
}: OrderSuccessStateProps) {
    const clearCart = useCartStore(state => state.clearCart);

    const handleClose = () => {
        clearCart();
        onClose();
    };

    const [particles] = useState(() => Array.from({ length: 16 }, (_, i) => ({
        delay: 0.3 + i * 0.08,
        x: (Math.random() - 0.5) * 250,
        size: 4 + Math.random() * 6,
    })));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 text-center min-h-[70vh] relative overflow-hidden"
        >
            {/* Particle burst */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map((p, i) => (
                    <FloatingParticle key={i} {...p} />
                ))}
            </div>

            {/* Pulsing glow ring */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.05 }}
                className="relative mb-8"
            >
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.08, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-4 rounded-full bg-emerald-400"
                />
                <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.25 }}
                    >
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </motion.div>
                </div>
            </motion.div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Confirmado</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
                    ¡Pago Exitoso!
                </h2>
                <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    Tu pedido fue recibido y pagado correctamente. La cocina ya está siendo notificada.
                </p>
            </motion.div>

            {/* Receipt card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="mt-8 w-full max-w-[320px]"
            >
                {/* Ticket top cutout */}
                <div className="flex justify-between px-3 -mb-px relative z-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-[#f8f9fa]" />
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                    {/* Header stripe */}
                    <div className="h-1.5 bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-500" />

                    <div className="p-5 space-y-4">
                        {orderNumber && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Orden</span>
                                <span className="font-black text-gray-900 text-lg tracking-tight">#{orderNumber}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-3 border-y border-dashed border-gray-200">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Método</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-linear-to-br from-[#fa0050] to-[#ff3375] flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">{paymentMethod}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pagado</span>
                            <span className="text-2xl font-black text-emerald-600 tracking-tight">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ticket bottom cutout */}
                <div className="flex justify-between px-3 -mt-px relative z-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-[#f8f9fa]" />
                    ))}
                </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClose}
                className="mt-8 flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-[15px] transition-colors shadow-lg shadow-gray-900/10"
            >
                Seguir viendo el menú
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
    );
}
