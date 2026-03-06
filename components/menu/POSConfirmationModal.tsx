'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface POSConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    zoneName?: string;
    tableNumber?: string;
    total: number;
}

export function POSConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    zoneName,
    tableNumber,
    total
}: POSConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-rose-100 text-[#fa0050] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Pedido</h3>
                            <p className="text-gray-500 text-sm">Verifica la ubicación antes de enviar a cocina.</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                <span className="text-gray-600 text-sm">Zona:</span>
                                <span className="font-bold text-gray-900">{zoneName || 'Sin zona'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                <span className="text-gray-600 text-sm">Mesa:</span>
                                <span className="font-bold text-gray-900 text-lg">#{tableNumber}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-600 text-sm">Total:</span>
                                <span className="font-bold text-[#fa0050] text-lg">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-xl font-semibold hover:text-red-600 text-gray-700 hover:bg-gray-100 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isSubmitting}
                                className="px-4 py-3 bg-black text-white hover:bg-[#fa0050] rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Enviar</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
