'use client';

// ============================================================================
// FoodFast Pro - Checkout Summary Component
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp, User, Phone } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency, createWhatsAppMessage } from '@/lib/utils';
import { Businessman, PaymentMethod } from '@/lib/types';
import { createOrder } from '@/app/actions/create-order';

interface CheckoutSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    customerPhone: string;
    serviceType: 'takeout' | 'delivery' | 'dine_in';
    deliveryAddress: string;
    businessman: Businessman;
    tableNumber?: string;
    onEditCustomerInfo: () => void;
    shippingCost: number;
}

export function CheckoutSummary({
    isOpen,
    onClose,
    customerName,
    customerPhone,
    serviceType,
    deliveryAddress,
    businessman,
    tableNumber,
    onEditCustomerInfo,
    shippingCost
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
    // Get available payment methods from businessman
    const paymentMethods: PaymentMethod[] = businessman.payment_methods || [];

    const activePaymentMethods = paymentMethods.filter(pm => pm.is_active);
    const selectedPaymentMethod = activePaymentMethods.find(pm => pm.name === selectedPaymentMethodId) || null;

    const itemCount = getItemCount();
    const subtotal = getTotal();
    const total = subtotal + tip + shippingCost;

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
                delivery_type: serviceType === 'takeout' ? 'pickup' : (serviceType === 'dine_in' ? 'dine_in' : 'delivery'),
                delivery_address: deliveryAddress,
                table_number: tableNumber,
                delivery_notes: comment + (cashAmount ? ` (Paga con: ${formatCurrency(parseInt(cashAmount) || 0)})` : ''),
                payment_method: selectedPaymentMethod.type === 'efectivo'
                    ? `Efectivo ${cashAmount ? `(Paga con: ${formatCurrency(parseInt(cashAmount) || 0)})` : ''}`
                    : selectedPaymentMethod.name,
                subtotal: subtotal,
                shipping_cost: shippingCost,
                discount: 0,
                tip: tip,
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
                comment + (coupon ? ` (Cupón: ${coupon})` : '') + (tableNumber ? `\n\n🍽️ Mesa: ${tableNumber}` : '') + (cashAmount ? `\n\n💵 Paga con: ${formatCurrency(parseInt(cashAmount) || 0)}` : '')
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
                        className="fixed inset-0 bg-gray-50 backdrop-blur-sm z-50"
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
                        <div className="sticky top-0 bg-white p-4 flex items-center gap-3 z-10">
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>
                            <h2 className="text-xl font-extrabold text-[#111827]">
                                {serviceType === 'takeout' ? 'Para llevar' : (serviceType === 'dine_in' ? `Mesa ${tableNumber || ''}` : 'Enviar pedido')}
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 space-y-4 bg-[#f8f9fa]">
                            {/* Address Row */}
                            <div className="flex items-start bg-white p-4 shadow-sm rounded-[24px] cursor-pointer hover:bg-gray-50 transition-colors" onClick={onEditCustomerInfo}>
                                <div className="mt-0.5 w-6 h-6 mr-3 text-gray-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 leading-tight mb-0.5">{deliveryAddress || 'Datos del cliente'}</h4>
                                    <p className="text-sm text-gray-500 leading-tight line-clamp-2">{customerName} {customerPhone}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
                            </div>

                            {/* Service Type Row */}
                            <div className="flex items-start bg-white p-4 shadow-sm rounded-[24px]">
                                <div className="mt-0.5 w-6 h-6 mr-3 text-gray-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 leading-tight mb-0.5">
                                        {serviceType === 'takeout' ? 'Recoger en local' : (serviceType === 'dine_in' ? 'Servicio a Mesa' : 'Entrega a domicilio')}
                                    </h4>
                                    <p className="text-sm text-gray-400">{(businessman as any).deliveryTime || 'Aprox 30-45 min'}</p>
                                </div>
                            </div>

                            {/* Merchant & Items Details */}
                            <div className="flex items-start bg-white p-4 shadow-sm rounded-[24px]">
                                <div className="mt-0.5 w-6 h-6 mr-3 text-gray-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 leading-tight mb-1">{businessman.business_name}</h4>
                                    <p className="text-sm text-gray-500 leading-tight">{itemCount} artículos separados</p>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="p-4 bg-white shadow-sm rounded-full flex items-center">
                                <div className="w-6 h-6 mr-3 flex items-center text-gray-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Agregar notas para la entrega o preparación"
                                    className="flex-1 border-none bg-transparent focus:outline-none focus:border-[#fa0050] resize-none text-sm text-gray-800 placeholder:text-gray-400"
                                    rows={1}
                                />
                            </div>

                            {/* Tip section */}
                            <div className="py-6 border-b border-gray-100">
                                <div className="flex items-center gap-1 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">Propina</h3>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Puedes agradecer al usuario repartidor con una propina.</p>

                                <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-hide py-1 ">
                                    {/* Default Tip Options */}
                                    {[1000, 2000, 3000, 5000].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                setTip(value);
                                            }}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm bg-white transition-colors focus:bg-[#fa0050] focus:text-white whitespace-nowrap flex-none ${tip === value
                                                ? 'bg-orange-50/70 text-[#fa0050]'
                                                : 'bg-[#f8f9fa] text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            ${value.toLocaleString('es-CO')}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setTip(0); }}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap focus:bg-[#fa0050] focus:text-white bg-white flex-none ${tip === 0
                                            ? 'bg-orange-50/70 text-[#fa0050]'
                                            : 'bg-[#f8f9fa] text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >Ninguna</button>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="py-4">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 mr-3 text-gray-800 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                    </div>
                                    <select
                                        value={selectedPaymentMethodId}
                                        onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                                        className="flex-1 bg-transparent font-semibold text-gray-900 leading-tight focus:outline-none appearance-none"
                                    >
                                        <option value="" disabled>Seleccionar pago</option>
                                        {activePaymentMethods.map((pm, index) => (
                                            <option key={index} value={pm.name}>
                                                {pm.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronRight className="w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Payment Instructions */}
                                <AnimatePresence>
                                    {selectedPaymentMethod && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 bg-orange-50/50 rounded-xl p-4 overflow-hidden ml-9"
                                        >
                                            <p className="text-sm text-[#fa0050] leading-relaxed whitespace-pre-wrap">
                                                {selectedPaymentMethod.instructions}
                                            </p>

                                            {selectedPaymentMethod.number && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Cuenta:</span>
                                                    <code className="text-sm font-bold text-gray-900">{selectedPaymentMethod.number}</code>
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
                                            className="mt-3 ml-9"
                                        >
                                            <input
                                                type="number"
                                                value={cashAmount}
                                                placeholder="$ ¿Con cuánto vas a pagar?"
                                                className="w-full p-3 bg-[#f8f9fa] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fa0050] transition-colors text-sm font-medium"
                                                onChange={(e) => setCashAmount(e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Totals Summary */}
                            <div className="pt-2 pb-8 space-y-2 ml-9">
                                <div className="flex justify-between items-center text-[15px] font-bold text-gray-900">
                                    <span>Tarifa art.</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[14px] text-gray-500">
                                    <span>Costo envío</span>
                                    <span>{formatCurrency(shippingCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[14px] text-gray-500">
                                    <span>Propina</span>
                                    <span>{formatCurrency(tip)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Real Checkout Bar */}
                        <div className="sticky bottom-0 bg-white pt-4 pb-5 px-4 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-20 rounded-t-[32px]">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[24px] sm:text-[26px] font-black tracking-tight leading-none text-[#111827]">
                                        {formatCurrency(total)}
                                    </span>
                                    <span className="text-[#fa0050] text-[12px] font-bold mt-1">
                                        Total a pagar
                                    </span>
                                </div>
                                <motion.button
                                    onClick={handleSubmitOrder}
                                    disabled={!selectedPaymentMethod || isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-3.5 px-10 rounded-[20px] font-bold text-lg transition-all ${(!selectedPaymentMethod || isSubmitting)
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#fa0050] hover:bg-[#d4003e] text-white shadow-[0_4px_15px_rgba(250,0,80,0.3)] shadow-[#fa0050]/30'
                                        }`}
                                >
                                    {isSubmitting ? 'Procesando...' : 'Pagar'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
