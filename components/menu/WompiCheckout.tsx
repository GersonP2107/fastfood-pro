'use client';

// ============================================================================
// FoodFast Pro - Wompi Checkout Component
// ============================================================================
// Renders the Wompi widget checkout flow. This component:
// 1. Prepares the payment session server-side (getting signature + reference)
// 2. Creates the order in DB with status 'pending' and gateway 'wompi'
// 3. Opens the Wompi widget
// 4. Handles the callback and updates the order status

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Loader2, AlertCircle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { prepareWompiPayment, saveWompiTransaction } from '@/app/actions/wompi';

// ─── Wompi Widget Script Loader ──────────────────────────────────
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WidgetCheckout: any;
    }
}

function loadWompiScript(environment: 'sandbox' | 'production'): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.WidgetCheckout) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = environment === 'production'
            ? 'https://checkout.wompi.co/widget.js'
            : 'https://checkout.wompi.co/widget.js'; // Same URL for both — the public key determines the environment
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Wompi widget'));
        document.head.appendChild(script);
    });
}

// ─── Types ───────────────────────────────────────────────────────
interface WompiCheckoutProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orderId: string;
    businessmanId: string;
    amountInCents: number;
    customerEmail?: string;
    customerName: string;
    businessName: string;
}

type PaymentState = 'idle' | 'preparing' | 'ready' | 'processing' | 'success' | 'error' | 'declined';

// ─── Component ───────────────────────────────────────────────────
export function WompiCheckout({
    isOpen,
    onClose,
    onSuccess,
    orderId,
    businessmanId,
    amountInCents,
    customerEmail,
    customerName,
    businessName,
}: WompiCheckoutProps) {
    const [state, setState] = useState<PaymentState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // ─── Prepare payment when modal opens ────────────────────────
    const initializePayment = useCallback(async () => {
        if (!isOpen || state !== 'idle') return;

        setState('preparing');
        setErrorMessage('');

        try {
            // 1. Get payment session data from server (signature, reference, etc.)
            const result = await prepareWompiPayment(businessmanId, amountInCents, orderId);

            if (!result.success || !result.data) {
                setState('error');
                setErrorMessage(result.error || 'Error al preparar el pago');
                return;
            }

            const { publicKey, reference, signature, currency, environment } = result.data;

            // 2. Load the Wompi widget script
            await loadWompiScript(environment);

            setState('ready');

            // 3. Open the widget
            setState('processing');

            // Optional customer data properly formatted (Wompi might throw on 'undefined')
            const customerData: Record<string, string> = {};
            if (customerEmail) customerData.email = customerEmail;
            if (customerName) customerData.fullName = customerName;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const checkoutConfig: any = {
                currency: currency,
                amountInCents: amountInCents,
                reference: reference,
                publicKey: publicKey,
                signature: {
                    integrity: signature,
                }
            };

            if (Object.keys(customerData).length > 0) {
                checkoutConfig.customerData = customerData;
            }

            const checkout = new window.WidgetCheckout(checkoutConfig);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            checkout.open(async (result: any) => {
                const transaction = result?.transaction;

                if (!transaction) {
                    setState('error');
                    setErrorMessage('No se recibió respuesta de Wompi');
                    return;
                }

                const txId = transaction.id;
                const txStatus = transaction.status?.toUpperCase();
                setTransactionId(txId);

                // 4. Save the transaction result to the order in DB
                await saveWompiTransaction(orderId, txId, reference, txStatus);

                // 5. Update local state based on result
                if (txStatus === 'APPROVED') {
                    setState('success');
                    // Wait a bit then close
                    setTimeout(() => {
                        onSuccess();
                    }, 2500);
                } else if (txStatus === 'DECLINED') {
                    setState('declined');
                    setErrorMessage('El pago fue rechazado. Intenta con otro método.');
                } else if (txStatus === 'VOIDED') {
                    setState('declined');
                    setErrorMessage('El pago fue cancelado.');
                } else {
                    // PENDING or ERROR
                    setState('error');
                    setErrorMessage('El pago está pendiente o hubo un error. Si se completó, tu pedido se actualizará automáticamente.');
                }
            });
        } catch (err) {
            console.error('Wompi checkout error:', err);
            setState('error');
            setErrorMessage('Error al conectar con la pasarela de pagos. Intenta de nuevo.');
        }
    }, [isOpen, state, businessmanId, amountInCents, customerEmail, customerName, orderId, onSuccess]);

    useEffect(() => {
        if (isOpen && state === 'idle') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            initializePayment();
        }
    }, [isOpen, state, initializePayment]);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState('idle');
            setErrorMessage('');
            setTransactionId(null);
        }
    }, [isOpen]);

    // ─── Render ──────────────────────────────────────────────────
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                        onClick={state !== 'processing' ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-[28px] shadow-2xl z-61 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-linear-to-r from-[#fa0050] to-[#ff3375] p-5 pb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-white/80" />
                                    <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                                        Pago seguro
                                    </span>
                                </div>
                                {state !== 'processing' && (
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white rotate-90" />
                                    </button>
                                )}
                            </div>
                            <p className="text-white/70 text-sm font-medium">
                                {businessName}
                            </p>
                            <p className="text-white text-3xl font-black mt-1">
                                {formatCurrency(amountInCents / 100)}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {/* Preparing */}
                                {(state === 'preparing' || state === 'ready') && (
                                    <motion.div
                                        key="preparing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-8"
                                    >
                                        <Loader2 className="w-10 h-10 text-[#fa0050] animate-spin mb-4" />
                                        <p className="text-gray-700 font-semibold">Preparando pago...</p>
                                        <p className="text-gray-400 text-sm mt-1">Conectando con Wompi</p>
                                    </motion.div>
                                )}

                                {/* Processing */}
                                {state === 'processing' && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-8"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#fa0050]/10 flex items-center justify-center mb-4">
                                            <Zap className="w-6 h-6 text-[#fa0050]" />
                                        </div>
                                        <p className="text-gray-700 font-semibold">Completa tu pago</p>
                                        <p className="text-gray-400 text-sm mt-1 text-center">
                                            Se abrió la ventana de Wompi.<br />
                                            Sigue las instrucciones para completar tu pago.
                                        </p>
                                    </motion.div>
                                )}

                                {/* Success */}
                                {state === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.1 }}
                                            className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
                                        >
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                        </motion.div>
                                        <p className="text-gray-900 font-bold text-lg">¡Pago exitoso!</p>
                                        <p className="text-gray-500 text-sm mt-1 text-center">
                                            Tu pedido ha sido confirmado y se está preparando.
                                        </p>
                                        {transactionId && (
                                            <p className="text-gray-400 text-[10px] font-mono mt-3">
                                                ID: {transactionId}
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Declined */}
                                {state === 'declined' && (
                                    <motion.div
                                        key="declined"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-8"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                            <XCircle className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <p className="text-gray-900 font-bold text-lg">Pago rechazado</p>
                                        <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
                                            {errorMessage}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setState('idle');
                                                initializePayment();
                                            }}
                                            className="mt-5 px-6 py-2.5 bg-[#fa0050] text-white rounded-full font-bold text-sm hover:bg-[#d4003e] transition-colors"
                                        >
                                            Reintentar
                                        </button>
                                    </motion.div>
                                )}

                                {/* Error */}
                                {state === 'error' && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-8"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <p className="text-gray-900 font-bold text-lg">Error de pago</p>
                                        <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
                                            {errorMessage}
                                        </p>
                                        <div className="flex gap-3 mt-5">
                                            <button
                                                onClick={onClose}
                                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setState('idle');
                                                }}
                                                className="px-5 py-2.5 bg-[#fa0050] text-white rounded-full font-bold text-sm hover:bg-[#d4003e] transition-colors"
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer - Powered by */}
                        <div className="border-t border-gray-100 p-3 flex items-center justify-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] text-gray-400 font-medium">
                                Procesado por <strong className="text-gray-600">Wompi</strong> · Conexión segura
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
