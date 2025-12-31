'use client';

// ============================================================================
// FoodFast Pro - Checkout Summary Component
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, ChevronUp, User, Phone, Lock } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency, createWhatsAppMessage } from '@/lib/utils';
import { Businessman, PaymentMethod } from '@/lib/types';
import { createOrder } from '@/app/actions/create-order';

interface CheckoutSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    customerPhone: string;
    serviceType: 'takeout' | 'delivery';
    deliveryAddress: string;
    businessman: Businessman;
    onEditCustomerInfo: () => void;
}

export function CheckoutSummary({
    isOpen,
    onClose,
    customerName,
    customerPhone,
    serviceType,
    deliveryAddress,
    businessman,
    onEditCustomerInfo
}: CheckoutSummaryProps) {
    const { items, getTotal, getItemCount } = useCartStore();
    const [showCustomerData, setShowCustomerData] = useState(false);
    const [comment, setComment] = useState('');
    const [coupon, setCoupon] = useState('');
    const [tip, setTip] = useState<number>(0);
    const [customTip, setCustomTip] = useState('');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get available payment methods from businessman or use defaults
    const paymentMethods: PaymentMethod[] = businessman.payment_methods || [
        { type: 'efectivo', name: 'Efectivo', is_active: true, instructions: 'Paga al momento de recibir.' },
        { type: 'otros', name: 'Transferencia Bancaria', number: '01726001987', is_active: true, instructions: 'Nequi / DaviPlata / Bancolombia' }
    ];

    const activePaymentMethods = paymentMethods.filter(pm => pm.is_active);
    const selectedPaymentMethod = activePaymentMethods.find(pm => pm.name === selectedPaymentMethodId) || null;

    const itemCount = getItemCount();
    const subtotal = getTotal();
    const total = subtotal + tip;

    const handleSubmitOrder = async () => {
        if (!selectedPaymentMethod) return;

        setIsSubmitting(true);

        const customerData = {
            name: customerName,
            phone: customerPhone,
            address: deliveryAddress
        };

        const paymentInfo = {
            type: selectedPaymentMethod.type,
            name: selectedPaymentMethod.name
        };

        // 1. Persist Order to Database
        try {
            const result = await createOrder({
                businessman_id: businessman.id,
                client_name: customerName,
                client_phone: customerPhone,
                delivery_type: serviceType === 'takeout' ? 'pickup' : 'delivery',
                delivery_address: deliveryAddress,
                delivery_notes: comment + (cashAmount ? ` (Paga con: ${formatCurrency(parseInt(cashAmount) || 0)})` : ''),
                payment_method: selectedPaymentMethod.type === 'efectivo'
                    ? `Efectivo ${cashAmount ? `(Paga con: ${formatCurrency(parseInt(cashAmount) || 0)})` : ''}`
                    : selectedPaymentMethod.instructions || selectedPaymentMethod.name,
                subtotal: subtotal,
                shipping_cost: 0,
                discount: 0,
                total: total,
                items: items.map(item => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    product_description: item.product.description || '',
                    unit_price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    modifiers: item.modifiers_selected.map(mod => ({
                        modifier_id: mod.id,
                        modifier_name: mod.name,
                        additional_price: mod.additional_price
                    }))
                }))
            });

            if (result.error) {
                console.error('Order creation error:', result.error);
                alert('Hubo un error al crear tu pedido. Por favor intenta de nuevo.');
                setIsSubmitting(false);
                return; // Stop execution if DB save fails
            }

            console.log('Order created successfully:', result.data);

            // 2. Create WhatsApp Message (Only if DB success)
            const message = createWhatsAppMessage(
                items,
                subtotal,
                total,
                customerData,
                paymentInfo,
                serviceType,
                businessman.business_name,
                comment + (coupon ? ` (Cupón: ${coupon})` : '') + (cashAmount ? `\n\n💵 Paga con: ${formatCurrency(parseInt(cashAmount) || 0)}` : '')
            );

            // 3. Open WhatsApp
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessman.whatsapp_number}&text=${message}`;
            window.open(whatsappUrl, '_blank');

            // Close modal and clear cart after successful order
            // clearCart(); // Uncomment if you want to clear cart
            onClose();

        } catch (error) {
            console.error('Failed to persist order:', error);
            alert('Ocurrió un error inesperado via de red. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
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
                                            <button
                                                onClick={onEditCustomerInfo}
                                                className="text-sm text-blue-500 font-medium"
                                            >
                                                @Cambiar
                                            </button>
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
                                <div className="flex gap-2 flex-wrap">
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
                                    {/* Default Tip Options */}
                                    {[1000, 2000, 3000].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                setTip(value);
                                                setCustomTip('');
                                            }}
                                            className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-colors whitespace-nowrap ${tip === value
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            ${value.toLocaleString('es-CO')}
                                        </button>
                                    ))}
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
                                <p className="text-xs text-gray-500 mb-3">Selecciona cómo deseas pagar</p>
                                <select
                                    value={selectedPaymentMethodId}
                                    onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white"
                                >
                                    <option value="">Seleccione un método</option>
                                    {activePaymentMethods.map((pm, index) => (
                                        <option key={index} value={pm.name}>
                                            {pm.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Payment Instructions */}
                                <AnimatePresence>
                                    {selectedPaymentMethod && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 overflow-hidden"
                                        >
                                            <p className="text-sm font-semibold text-blue-900 mb-1">
                                                Instrucciones:
                                            </p>
                                            <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                                                {selectedPaymentMethod.instructions}
                                            </p>

                                            {selectedPaymentMethod.number && (
                                                <div className="mt-2 flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                                                    <span className="text-xs font-bold text-blue-900 uppercase">Cuenta:</span>
                                                    <code className="text-sm font-mono text-blue-800">{selectedPaymentMethod.number}</code>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Cash Amount Input (Only if cash is selected) */}
                                <AnimatePresence>
                                    {selectedPaymentMethod?.type === 'efectivo' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3"
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                $ ¿Con cuánto vas a pagar?
                                            </label>
                                            <input
                                                type="number"
                                                value={cashAmount}
                                                placeholder="Ej: 50000"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                                onChange={(e) => setCashAmount(e.target.value)}
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
                                disabled={!selectedPaymentMethod || isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${selectedPaymentMethod && !isSubmitting
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? 'Procesando...' : `Pedir (${formatCurrency(total)})`}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
