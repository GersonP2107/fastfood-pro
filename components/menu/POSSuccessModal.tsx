'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface POSSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function POSSuccessModal({ isOpen, onClose }: POSSuccessModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <span className="text-4xl">👨‍🍳</span>
                        </motion.div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Pedido Enviado!
                        </h3>

                        <p className="text-gray-500 mb-8">
                            El pedido ha sido enviado a cocina correctamente.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-black text-white hover:bg-blue-500 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Aceptar
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
