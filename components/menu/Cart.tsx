'use client';

// ============================================================================
// FoodFast Pro - Cart Component with Animations
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency, checkBusinessStatus } from '@/lib/utils';
import Link from 'next/link';
import { CheckoutSummary } from '@/components/menu/CheckoutSummary';
import { Businessman, DeliveryZone, Product } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { AddressForm } from '@/components/menu/AddressForm';

interface CartProps {
    businessman: Businessman;
    deliveryZones: DeliveryZone[];
    tableNumber?: string;
    isPOS?: boolean;
    zoneName?: string;
}

import { createOrder } from '@/app/actions/create-order';
import { POSConfirmationModal } from './POSConfirmationModal';
import { POSSuccessModal } from './POSSuccessModal';

export function Cart({ businessman, deliveryZones, tableNumber, isPOS = false, zoneName }: CartProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [serviceType, setServiceType] = useState<'takeout' | 'delivery' | 'dine_in'>(
        tableNumber || isPOS ? 'dine_in' : 'takeout'
    );
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [showPOSConfirm, setShowPOSConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmittingPOS, setIsSubmittingPOS] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart, addItem } = useCartStore();

    const itemCount = getItemCount();
    const total = getTotal();

    // Load saved customer info
    useEffect(() => {
        const savedData = localStorage.getItem('foodfast_user_data');
        if (savedData) {
            try {
                const { name, phone } = JSON.parse(savedData);
                if (name) setCustomerName(name);
                if (phone) setCustomerPhone(phone);
            } catch (e) {
                console.error('Error loading saved user data', e);
            }
        }
    }, []);

    // Fetch suggested products
    useEffect(() => {
        if (isOpen && items.length > 0 && suggestedProducts.length === 0) {
            const fetchSuggestions = async () => {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories(id, name)')
                    .eq('businessman_id', businessman.id)
                    .eq('is_available', true)
                    .is('deleted_at', null)
                    .limit(50);

                if (data && !error) {
                    const cartItemIds = items.map(item => item.product.id);
                    const availableItems = data.filter(p => !cartItemIds.includes(p.id));

                    // Priority: Drinks/Beverages
                    const beverages = availableItems.filter(p =>
                        p.category?.name?.toLowerCase().includes('bebida') ||
                        p.category?.name?.toLowerCase().includes('adicional') ||
                        p.name.toLowerCase().includes('limonada') ||
                        p.name.toLowerCase().includes('gaseosa') ||
                        p.name.toLowerCase().includes('coca') ||
                        p.name.toLowerCase().includes('jugo') ||
                        p.name.toLowerCase().includes('agua') ||
                        p.name.toLowerCase().includes('postre')
                    );

                    let finalSuggestions = beverages;
                    if (finalSuggestions.length < 3) {
                        const others = availableItems.filter(p => !finalSuggestions.find(b => b.id === p.id));
                        finalSuggestions = [...finalSuggestions, ...others].slice(0, 5);
                    } else {
                        finalSuggestions = finalSuggestions.slice(0, 5);
                    }
                    setSuggestedProducts(finalSuggestions);
                }
            };
            fetchSuggestions();
        }
    }, [isOpen, items.length, businessman.id, suggestedProducts.length]);

    // Lock body scroll when any modal/drawer is open
    useEffect(() => {
        if (isOpen || showCustomerForm || showAddressForm || showCheckoutSummary || showPOSConfirm || showSuccessModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, showCustomerForm, showAddressForm, showCheckoutSummary, showPOSConfirm, showSuccessModal]);

    // Check business status
    const { isOpen: isBusinessOpen, message: businessStatusMessage } = checkBusinessStatus(businessman);

    const handleCheckout = (type: 'takeout' | 'delivery' | 'dine_in') => {
        setServiceType(type);
        if (type === 'dine_in') {
            if (isPOS && !tableNumber) {
                // Show error/alert if no table is selected in POS mode
                alert("⚠️ Por favor selecciona una MESA y ZONA antes de continuar.");
                return;
            }
            // For POS/Table orders, show simplified confirmation
            setShowPOSConfirm(true);
        } else {
            if (type !== 'delivery') {
                setShippingCost(0);
            }
            // Standard flow
            setShowCustomerForm(true);
        }
    };

    const handlePOSSubmit = async () => {
        if (!tableNumber) {
            alert('Por favor selecciona una mesa primero.');
            return;
        }
        setIsSubmittingPOS(true);

        try {
            const result = await createOrder({
                businessman_id: businessman.id,
                source: 'pos', // Mark as POS order for validation
                client_name: `Mesa ${tableNumber}`,
                client_phone: '0000000000', // Default placeholder for POS
                delivery_type: 'dine_in',
                delivery_address: `Zona: ${zoneName || 'General'}, Mesa: ${tableNumber}`,
                table_number: tableNumber,
                delivery_notes: 'Pedido realizado desde POS',
                payment_method: 'Pendiente (POS)', // Or 'Efectivo' default? Pending logic.
                subtotal: getTotal(),
                shipping_cost: 0,
                discount: 0,
                tip: 0,
                total: getTotal(),
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
                alert('Error al crear el pedido: ' + result.error);
            } else {
                // Success: Clear cart and maybe show success message
                setShowPOSConfirm(false);
                setShowSuccessModal(true);
                setIsOpen(false); // Close cart sidebar (optional, but cleaner)
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al enviar el pedido.');
        } finally {
            setIsSubmittingPOS(false);
        }
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

        // Validate terms
        if (!acceptedTerms) {
            setTermsError('Debes aceptar los términos y la política de datos');
            isValid = false;
        } else {
            setTermsError('');
        }

        return isValid;
    };

    const handleSubmitCustomerInfo = () => {
        if (validateForm()) {
            setShowCustomerForm(false);
            setIsOpen(false);

            // Save to localStorage
            localStorage.setItem('foodfast_user_data', JSON.stringify({
                name: customerName,
                phone: customerPhone
            }));

            // If delivery, show address form first
            if (serviceType === 'delivery') {
                setShowAddressForm(true);
            } else {
                setShowCheckoutSummary(true);
            }
        }
    };

    const handleAddressConfirm = (address: string, zoneCost: number) => {
        setDeliveryAddress(address);
        // Cost already includes multiplier from AddressForm
        setShippingCost(zoneCost);
        setShowAddressForm(false);
        setShowCheckoutSummary(true);
    };


    return (
        <>
            {/* Modern Fixed Bottom Cart Bar (Didi Style) */}
            <AnimatePresence>
                {itemCount > 0 && (
                    <motion.div
                        initial={{ y: 150 }}
                        animate={{ y: 0 }}
                        exit={{ y: 150 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-[32px] pt-4 pb-5 px-5 sm:px-6 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]"
                    >
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                            {/* Left side - Price & count */}
                            <div className="flex flex-col">
                                <motion.span
                                    key={total}
                                    initial={{ scale: 1.1, color: '#fa0050' }}
                                    animate={{ scale: 1, color: '#111827' }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-[26px] sm:text-[28px] font-black tracking-tight leading-none"
                                >
                                    {formatCurrency(total)}
                                </motion.span>
                                <motion.span
                                    key={itemCount}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[#fa0050] text-[13px] font-bold mt-1 tracking-tight"
                                >
                                    Ver desglose ^
                                </motion.span>
                            </div>

                            {/* Right side - Action Button */}
                            <motion.button
                                onClick={() => setIsOpen(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-2 bg-[#fa0050] hover:bg-[#d4003e] active:bg-[#9e002f] text-white py-3.5 px-6 rounded-[20px] font-bold text-lg transition-all"
                            >
                                <span className="pr-1">Siguiente</span>
                                <div className="bg-white text-[#fa0050] w-6 h-6 flex items-center justify-center rounded-full text-[13px] font-black">
                                    {itemCount}
                                </div>
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
                            className="fixed inset-0 bg-gray-50 backdrop-blur-sm z-50"
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
                            <header className="pt-4 pb-2 px-2 shrink-0 bg-white z-10">
                                <div className="bg-white p-4 flex items-center justify-between shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-full mx-[10px]">
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        <ShoppingBag className="w-5 h-5 text-gray-800" />
                                        <h4 className="text-xl font-bold ">Tu Pedido</h4>
                                    </motion.div>
                                    <motion.button
                                        onClick={() => setIsOpen(false)}
                                        whileHover={{ rotate: 90, scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </motion.button>
                                </div>
                            </header>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
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
                                                    className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 rounded-[24px]"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3 flex-1 pr-4">
                                                            {item.product.image_url ? (
                                                                <img
                                                                    src={item.product.image_url}
                                                                    alt={item.product.name}
                                                                    className="w-[52px] h-[52px] rounded-[14px] object-cover bg-gray-50 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-[52px] h-[52px] rounded-[14px] bg-gray-50 flex items-center justify-center shrink-0">
                                                                    <span className="text-xl">🍲</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-semibold text-[15px] text-gray-900 leading-snug">{item.product.name}</h4>
                                                                <p className="text-[14px] text-gray-500 font-semibold mt-0.5">
                                                                    {formatCurrency(item.product.discount_price || item.product.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => removeItem(item.product.id)}
                                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
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
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="font-bold text-gray-900 text-sm">
                                                            Sub: {formatCurrency(item.subtotal)}
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-[#f8f9fa] rounded-full p-1">
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </motion.button>
                                                            <motion.span
                                                                key={item.quantity}
                                                                initial={{ scale: 1.5, color: '#fa0050' }}
                                                                animate={{ scale: 1, color: '#111827' }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                                className="font-bold text-[15px] w-4 text-center"
                                                            >
                                                                {item.quantity}
                                                            </motion.span>
                                                            <motion.button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-[#fa0050] transition-colors"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Comprado habitualmente con / Suggested Products */}
                                        {suggestedProducts.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-8 mb-4 pt-6"
                                            >
                                                <h3 className="font-extrabold text-gray-900 text-[17px] leading-none mb-1">Comprado habitualmente con:</h3>
                                                <p className="text-sm text-gray-500 mb-5 font-medium">Llévate algo más</p>

                                                {/* Horizontal Scroll Area */}
                                                <div className="flex overflow-x-auto gap-4 pb-6 pt-2 -mx-4 px-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                    {suggestedProducts.map((product) => (
                                                        <div key={product.id} className="min-w-[130px] w-[130px] snap-start flex flex-col group cursor-pointer" onClick={() => addItem(product, [])}>
                                                            <div className="relative aspect-square mb-2.5 bg-gray-50 rounded-[20px] overflow-hidden transition-all duration-300">
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-3xl">🥤</div>
                                                                )}
                                                                {/* Plus Button - Didi Style */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); addItem(product, []); }}
                                                                    className="absolute bottom-2 right-2 w-[34px] h-[34px] bg-[#fa0050] text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(250,0,80,0.4)] hover:scale-105 active:scale-95 transition-all"
                                                                >
                                                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                                                </button>
                                                            </div>
                                                            <h4 className="font-bold text-[13px] text-gray-800 line-clamp-2 leading-snug flex-1 mb-1">{product.name}</h4>
                                                            <p className="font-black text-[14px] text-gray-900">{formatCurrency(product.discount_price || product.price)}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <style jsx>{`
                                                    .hide-scrollbar::-webkit-scrollbar {
                                                        display: none;
                                                    }
                                                `}</style>
                                            </motion.div>
                                        )}
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
                                        className="p-4 bg-white space-y-4 bottom-0 z-10 shadow-[0_-5px_30px_rgba(0,0,0,0.06)] rounded-t-[32px] shrink-0"
                                    >
                                        <div className="flex items-center justify-between text-lg font-bold px-1">
                                            <span className="text-gray-800">Total a pagar:</span>
                                            <motion.span
                                                key={total}
                                                initial={{ scale: 1.3, color: '#fa0050' }}
                                                animate={{ scale: 1, color: '#111827' }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className="text-2xl font-black tracking-tight"
                                            >
                                                {formatCurrency(total)}
                                            </motion.span>
                                        </div>

                                        {/* Service Type Selection */}
                                        <div className="space-y-2">
                                            <p className="text-center text-xs text-gray-600 font-medium">
                                                Selecciona el tipo de servicio:
                                            </p>

                                            <div className={`grid ${tableNumber || isPOS ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                                                {isBusinessOpen ? (
                                                    <>
                                                        {/* POS Mode: ONLY Show Dine-in */}
                                                        {(tableNumber || isPOS) ? (
                                                            <button
                                                                onClick={() => handleCheckout('dine_in')}
                                                                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-[20px] font-bold text-[12px] hover:bg-[#d4003e] transition-all duration-300 shadow-[0_4px_15px_rgba(250,0,80,0.3)] bg-[#fa0050] text-white cursor-pointer`}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                                </svg>
                                                                <span>{tableNumber ? `Confirmar Mesa ${tableNumber}` : 'Seleccionar Mesa'}</span>
                                                            </button>
                                                        ) : (
                                                            /* Public/Standard Mode: Show ONLY Takeout & Delivery */
                                                            <>
                                                                {/* Para llevar button */}
                                                                <button
                                                                    onClick={() => handleCheckout('takeout')}
                                                                    className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-[20px] font-bold text-[13px] transition-all bg-[#fa0050] text-white hover:bg-[#d4003e] shadow-[0_4px_15px_rgba(250,0,80,0.3)] shadow-[#fa0050]/30 border border-transparent"
                                                                >
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                                                    <span>Para llevar</span>
                                                                </button>

                                                                {/* A domicilio button */}
                                                                <button
                                                                    onClick={() => handleCheckout('delivery')}
                                                                    className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-[20px] font-bold text-[13px] transition-all bg-[#fa0050] text-white hover:bg-[#d4003e] shadow-[0_4px_15px_rgba(250,0,80,0.3)] shadow-[#fa0050]/30 border border-transparent"
                                                                >
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                                        <path d="M10 17h4V5H2v12h3" />
                                                                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                                                                        <path d="M14 17h1" />
                                                                        <circle cx="7.5" cy="17.5" r="2.5" />
                                                                        <circle cx="17.5" cy="17.5" r="2.5" />
                                                                    </svg>
                                                                    <span>A domicilio</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                                        <p className="text-red-600 font-bold mb-1">
                                                            🚫 {businessStatusMessage}
                                                        </p>
                                                        <p className="text-xs text-red-500">
                                                            No se pueden realizar pedidos en este momento.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {isBusinessOpen && (
                                                <p className="text-[10px] text-center text-gray-500 mt-1.5 leading-tight">
                                                    Al hacer clic en un servicio aceptas los{' '}
                                                    <span className="underline">Términos de uso</span> y{' '}
                                                    <span className="underline">Política de privacidad</span>
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence >
            {/* POS Confirmation Modal */}
            < POSConfirmationModal
                isOpen={showPOSConfirm}
                onClose={() => setShowPOSConfirm(false)}
                onConfirm={handlePOSSubmit}
                isSubmitting={isSubmittingPOS}
                zoneName={zoneName}
                tableNumber={tableNumber}
                total={total}
            />

            {/* Customer Information Form Modal */}
            {/* Customer Information Form Modal */}
            <AnimatePresence>
                {showCustomerForm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-50 backdrop-blur-sm z-50"
                            onClick={() => setShowCustomerForm(false)}
                        />

                        {/* Form Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[24px] shadow-2xl z-50 p-6"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <button
                                    onClick={() => setShowCustomerForm(false)}
                                    className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                                <h2 className="text-xl font-extrabold text-gray-900">Tus datos personales</h2>
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
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${nameError
                                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                                : 'border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] focus:border-transparent focus:ring-2 focus:ring-black/5 bg-gray-50/50 focus:bg-white'
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
                                        <select className="w-24 px-3 py-3 bg-[#f8f9fa] border border-transparent rounded-[16px] focus:outline-none focus:border-[#fa0050] transition-colors font-semibold text-gray-700">
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
                                                className={`w-full px-4 py-3 bg-[#f8f9fa] border rounded-[16px] focus:outline-none transition-colors ${phoneError
                                                    ? 'border-red-500 focus:border-red-500 text-red-900'
                                                    : 'border-transparent focus:border-[#fa0050]'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                    {phoneError && (
                                        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                                    )}
                                </div>

                                {/* Terms & Privacy Checkbox */}
                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={acceptedTerms}
                                                onChange={(e) => {
                                                    setAcceptedTerms(e.target.checked);
                                                    if (termsError) setTermsError('');
                                                }}
                                            />
                                            <motion.div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${acceptedTerms ? 'bg-[#fa0050] border-[#fa0050]' : 'bg-white border-gray-200 group-hover:border-[#fa0050]'
                                                    }`}
                                                whileTap={{ scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <AnimatePresence>
                                                    {acceptedTerms && (
                                                        <motion.svg
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            className="w-3.5 h-3.5 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={3}
                                                        >
                                                            <motion.path
                                                                d="M5 13l4 4L19 7"
                                                                initial={{ pathLength: 0 }}
                                                                animate={{ pathLength: 1 }}
                                                                transition={{ duration: 0.2 }}
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </motion.svg>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </div>
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                            Acepto la <span className="font-semibold text-black hover:underline cursor-pointer">Política de Tratamiento de Datos</span> de acuerdo con la Ley 1581 de 2012 y los <span className="font-semibold text-black hover:underline cursor-pointer">Términos y Condiciones</span>. Entiendo que este software es un intermediario tecnológico y la responsabilidad del servicio recae en el comercio.
                                        </div>
                                    </label>
                                    {termsError && (
                                        <p className="text-xs text-red-500 mt-2 pl-8 font-medium animate-pulse">{termsError}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    onClick={handleSubmitCustomerInfo}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-[#fa0050] hover:bg-[#d4003e] text-white py-4 rounded-[20px] font-bold text-base transition-all duration-300 shadow-[0_4px_15px_rgba(250,0,80,0.3)] shadow-[#fa0050]/30 mt-6"
                                >
                                    Siguiente
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
                deliverySurgeMultiplier={businessman.delivery_surge_multiplier}
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
                tableNumber={tableNumber}
                onEditCustomerInfo={() => {
                    setShowCheckoutSummary(false);
                    setShowCustomerForm(true);
                }}
                shippingCost={shippingCost}
            />

            <POSSuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    clearCart(); // Clear cart only after user acknowledges success
                }}
            />
        </>
    );
}
