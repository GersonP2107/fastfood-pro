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
import { CheckoutSummary } from '@/components/menu/CheckoutSummary';
import { Businessman, DeliveryZone } from '@/lib/types';
import { AddressForm } from '@/components/menu/AddressForm';

interface CartProps {
    businessman: Businessman;
    deliveryZones: DeliveryZone[];
}

export function Cart({ businessman, deliveryZones }: CartProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [serviceType, setServiceType] = useState<'takeout' | 'delivery'>('takeout');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCartStore();

    const itemCount = getItemCount();
    const total = getTotal();

    const handleCheckout = (type: 'takeout' | 'delivery') => {
        setServiceType(type);
        setShowCustomerForm(true);
    };

    const validateForm = () => {
        let isValid = true;

        // Validate name
        if (!customerName.trim()) {
            setNameError('Su nombre es requerido');
            isValid = false;
        } else {
            setNameError('');
        }

        // Validate phone
        if (!customerPhone.trim()) {
            setPhoneError('Su número es requerido');
            isValid = false;
        } else if (customerPhone.length < 7) {
            setPhoneError('Número de teléfono inválido');
            isValid = false;
        } else {
            setPhoneError('');
        }

        return isValid;
    };

    const handleSubmitCustomerInfo = () => {
        if (validateForm()) {
            setShowCustomerForm(false);
            setIsOpen(false);

            // If delivery, show address form first
            if (serviceType === 'delivery') {
                setShowAddressForm(true);
            } else {
                setShowCheckoutSummary(true);
            }
        }
    };

    const handleAddressConfirm = (address: string) => {
        setDeliveryAddress(address);
        setShowAddressForm(false);
        setShowCheckoutSummary(true);
    };


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
                                    <h3 className="text-xl font-bold">Tu Pedido</h3>
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
                                                    className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-sm text-gray-800">{item.product.name}</h3>
                                                            <p className="text-xs text-primary font-semibold mt-0.5">
                                                                {formatCurrency(item.product.discount_price || item.product.price)}
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => removeItem(item.product.id)}
                                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                                                        <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-gray-200">
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md transition"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </motion.button>
                                                            <motion.span
                                                                key={item.quantity}
                                                                initial={{ scale: 1.5, color: '#3b82f6' }}
                                                                animate={{ scale: 1, color: '#1f2937' }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                                className="font-semibold text-sm w-6 text-center"
                                                            >
                                                                {item.quantity}
                                                            </motion.span>
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md transition"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </motion.button>
                                                        </div>
                                                        <motion.span
                                                            key={item.subtotal}
                                                            initial={{ scale: 1.2 }}
                                                            animate={{ scale: 1 }}
                                                            className="text-sm font-bold text-gray-800"
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
                                        className="border-t border-gray-200 p-4 bg-gray-50 space-y-3 bottom-0"
                                    >
                                        <div className="flex items-center justify-between text-lg font-bold">
                                            <span className="text-gray-700">Total:</span>
                                            <motion.span
                                                key={total}
                                                initial={{ scale: 1.3, color: '#3b82f6' }}
                                                animate={{ scale: 1, color: 'currentColor' }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className="text-primary text-2xl"
                                            >
                                                {formatCurrency(total)}
                                            </motion.span>
                                        </div>

                                        {/* Service Type Selection */}
                                        <div className="space-y-2">
                                            <p className="text-center text-xs text-gray-600 font-medium">
                                                Selecciona el tipo de servicio:
                                            </p>

                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Para llevar button */}
                                                <motion.button
                                                    onClick={() => handleCheckout('takeout')}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex flex-col items-center justify-center gap-1.5 bg-black hover:bg-gray-800 hover:text-black text-white py-3 px-3 rounded-lg font-semibold text-xs transition-all duration-300 shadow-lg"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>Para llevar</span>
                                                </motion.button>

                                                {/* A domicilio button */}
                                                <motion.button
                                                    onClick={() => handleCheckout('delivery')}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex flex-col items-center justify-center gap-1.5 bg-black hover:bg-gray-800 hover:text-black text-white py-3 px-3 rounded-lg font-semibold text-xs transition-all duration-300 shadow-lg"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                    <span>A domicilio</span>
                                                </motion.button>
                                            </div>

                                            <p className="text-[10px] text-center text-gray-500 mt-1.5 leading-tight">
                                                Al hacer clic en un servicio aceptas los{' '}
                                                <span className="underline">Términos de uso</span> y{' '}
                                                <span className="underline">Política de privacidad</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Customer Information Form Modal */}
            <AnimatePresence>
                {showCustomerForm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowCustomerForm(false)}
                        />

                        {/* Form Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <button
                                    onClick={() => setShowCustomerForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-lg font-bold text-gray-900">Agrega tu nombre y teléfono</h2>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Nombre:
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => {
                                                setCustomerName(e.target.value);
                                                if (nameError) setNameError('');
                                            }}
                                            placeholder="Ingresa tu nombre completo"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${nameError
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-gray-200 focus:border-black'
                                                }`}
                                        />
                                    </div>
                                    {nameError && (
                                        <p className="text-xs text-red-500 mt-1">{nameError}</p>
                                    )}
                                </div>

                                {/* Phone Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="flex gap-2">
                                        {/* Country Selector */}
                                        <select className="w-24 px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors">
                                            <option value="+57">🇨🇴 +57</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+52">🇲🇽 +52</option>
                                            <option value="+34">🇪🇸 +34</option>
                                        </select>

                                        {/* Phone Number */}
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => {
                                                    setCustomerPhone(e.target.value);
                                                    if (phoneError) setPhoneError('');
                                                }}
                                                placeholder="Número de teléfono"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${phoneError
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-gray-200 focus:border-black'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                    {phoneError && (
                                        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    onClick={handleSubmitCustomerInfo}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-black hover:bg-gray-800 hover:text-black text-white py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg mt-6"
                                >
                                    Continuar
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Address Form (for delivery) */}
            <AddressForm
                isOpen={showAddressForm}
                onClose={() => setShowAddressForm(false)}
                onConfirm={handleAddressConfirm}
                customerName={customerName}
                customerPhone={customerPhone}
                onEditCustomerInfo={() => {
                    setShowAddressForm(false);
                    setShowCustomerForm(true);
                }}
                deliveryZones={deliveryZones}
            />

            {/* Checkout Summary */}
            <CheckoutSummary
                isOpen={showCheckoutSummary}
                onClose={() => setShowCheckoutSummary(false)}
                customerName={customerName}
                customerPhone={customerPhone}
                serviceType={serviceType}
                deliveryAddress={deliveryAddress}
                businessman={businessman}
                onEditCustomerInfo={() => {
                    setShowCheckoutSummary(false);
                    setShowCustomerForm(true);
                }}
            />
        </>
    );
}
