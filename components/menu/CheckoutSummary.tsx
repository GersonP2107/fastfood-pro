'use client';

// ============================================================================
// FoodFast Pro - Checkout Summary Component
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, ChevronUp, User, Phone, Lock } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';

interface CheckoutSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    customerPhone: string;
    serviceType: 'takeout' | 'delivery';
}

export function CheckoutSummary({
    isOpen,
    onClose,
    customerName,
    customerPhone,
    serviceType
}: CheckoutSummaryProps) {
    const { items, getTotal, getItemCount } = useCartStore();
    const [showCustomerData, setShowCustomerData] = useState(false);
    const [comment, setComment] = useState('');
    const [coupon, setCoupon] = useState('');
    const [tip, setTip] = useState<number>(0);
    const [customTip, setCustomTip] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const itemCount = getItemCount();
    const subtotal = getTotal();
    const total = subtotal + tip;

    const handleSubmitOrder = () => {
        // TODO: Process order
        console.log({
            customerName,
            customerPhone,
            serviceType,
            items,
            comment,
            coupon,
            tip,
            paymentMethod,
            total
        });
        // Here you would send the order to your backend
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Checkout Modal */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                <h2 className="text-lg font-bold">
                                    {serviceType === 'takeout' ? 'Para llevar' : 'A domicilio'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 space-y-4">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Resumen de cuenta</p>
                                    <p className="text-xs text-gray-500">
                                        {itemCount} producto{itemCount !== 1 ? 's' : ''} · {formatCurrency(subtotal)}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Customer Data */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setShowCustomerData(!showCustomerData)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">Mis datos</span>
                                    {showCustomerData ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showCustomerData && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-200 p-4 space-y-3"
                                        >
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">Nombre: {customerName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">Teléfono: {customerPhone}</span>
                                            </div>
                                            <button className="text-sm text-blue-500 font-medium">
                                                @Cambiar
                                            </button>
                                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                                <Lock className="w-3 h-3" />
                                                Por seguridad, ocultamos parte de tus datos
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Comment */}
                            <div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Agregar comentario (opcional)"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Coupon */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Cupón</span>
                                    <button className="text-sm text-blue-500 font-medium">
                                        Ver detalles
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                    placeholder="Ingresar cupón"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                                />
                            </div>

                            {/* Tip */}
                            <div>
                                <span className="font-semibold text-gray-900 block mb-3">Propina</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setTip(0);
                                            setCustomTip('');
                                        }}
                                        className={`flex-1 py-2 px-3 rounded-lg border-2 font-medium text-sm transition-colors ${tip === 0 && !customTip
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        No, gracias
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTip(0);
                                            setCustomTip('0');
                                        }}
                                        className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors ${customTip === '0'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        $ 0
                                    </button>
                                    <input
                                        type="number"
                                        value={customTip}
                                        onChange={(e) => {
                                            setCustomTip(e.target.value);
                                            setTip(parseInt(e.target.value) || 0);
                                        }}
                                        placeholder="$ Otro"
                                        className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <span className="font-semibold text-gray-900 block mb-2">Método de pago</span>
                                <p className="text-xs text-gray-500 mb-3">El pago se coordina luego</p>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white"
                                >
                                    <option value="">Seleccione</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="daviplata">DaviPlata</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="transfer">Transferencia</option>
                                </select>

                                {/* Payment Instructions for Transfer/DaviPlata/Nequi */}
                                <AnimatePresence>
                                    {(paymentMethod === 'transfer' || paymentMethod === 'daviplata' || paymentMethod === 'nequi') && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4"
                                        >
                                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                                Instrucción de pago
                                            </p>
                                            <p className="text-sm text-blue-800 leading-relaxed">
                                                Nuestra cuenta corriente es <span className="font-bold">01726001987</span>, no olvides enviarnos tu comprobante a pago para empezar con la preparación de tu pedido
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Cash Amount Input */}
                                <AnimatePresence>
                                    {paymentMethod === 'cash' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3"
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                $ Monto con el que va a pagar
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Ingrese el monto"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer - Submit Button */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                            <motion.button
                                onClick={handleSubmitOrder}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!paymentMethod}
                                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${paymentMethod
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Pedir ({formatCurrency(total)})
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
