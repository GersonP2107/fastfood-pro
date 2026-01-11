'use client';

// ============================================================================
// FoodFast Pro - Address Form Component
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronUp, ChevronDown, User, Phone, Lock, Plus } from 'lucide-react';
import { DeliveryZone } from '@/lib/types';

interface AddressFormProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string, zoneCost: number) => void;
    customerName: string;
    customerPhone: string;
    onEditCustomerInfo: () => void;
    deliveryZones: DeliveryZone[];
    deliverySurgeMultiplier?: number;
}

export function AddressForm({
    isOpen,
    onClose,
    onConfirm,
    customerName,
    customerPhone,
    onEditCustomerInfo,
    deliveryZones,
    deliverySurgeMultiplier = 1
}: AddressFormProps) {
    const [showCustomerData, setShowCustomerData] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [showAddressForm, setShowAddressForm] = useState(false);

    // New address form fields
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [references, setReferences] = useState('');

    const handleConfirm = () => {
        // Find zone cost
        let zoneCost = 0;
        if (neighborhood) {
            const zone = deliveryZones.find(z => z.zone_name === neighborhood);
            if (zone) {
                // Apply multiplier to final cost
                zoneCost = Math.round(zone.delivery_cost * deliverySurgeMultiplier);
            }
        }

        // Build complete address from form fields
        if (street && number && neighborhood) {
            const fullAddress = `${street} ${number}, ${neighborhood}${references ? `, ${references}` : ''}`;
            onConfirm(fullAddress, zoneCost);
        } else if (selectedAddress) {
            onConfirm(selectedAddress, 0);
        }
    };

    // Check if form is valid
    const isFormValid = (street && number && neighborhood) || selectedAddress;

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

                    {/* Address Form Modal */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-gray-900">Agrega tu dirección</h2>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Customer Data - Collapsible */}
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

                            {/* Delivery Address Section */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Dirección de entrega</h3>

                                {/* Add New Address Button */}
                                <motion.button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Nueva dirección
                                </motion.button>

                                {/* Address Form */}
                                <AnimatePresence>
                                    {showAddressForm && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 space-y-4"
                                        >
                                            {/* Calle/Avenida */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Calle/Avenida
                                                </label>
                                                <input
                                                    type="text"
                                                    value={street}
                                                    onChange={(e) => setStreet(e.target.value)}
                                                    placeholder="Escribe aquí"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                                />
                                            </div>

                                            {/* Número */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Número
                                                </label>
                                                <input
                                                    type="text"
                                                    value={number}
                                                    onChange={(e) => setNumber(e.target.value)}
                                                    placeholder="Escribe aquí"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                                />
                                            </div>

                                            {/* Barrio Selector */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Barrio
                                                </label>
                                                <select
                                                    value={neighborhood}
                                                    onChange={(e) => setNeighborhood(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                                                >
                                                    <option value="">Selecciona tu barrio</option>
                                                    {deliveryZones.map((zone) => (
                                                        <option key={zone.id} value={zone.zone_name}>
                                                            {zone.zone_name} ($ {(Math.round(zone.delivery_cost * deliverySurgeMultiplier)).toLocaleString()})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Referencias adicionales (opcional) */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={references}
                                                    onChange={(e) => setReferences(e.target.value)}
                                                    placeholder="Referencias adicionales (opcional)"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Saved Addresses List (if any) */}
                                {/* You can add saved addresses here later */}
                            </div>
                        </div>

                        {/* Footer - Confirm Button */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                            <motion.button
                                onClick={handleConfirm}
                                whileHover={isFormValid ? { scale: 1.02 } : {}}
                                whileTap={isFormValid ? { scale: 0.98 } : {}}
                                disabled={!isFormValid}
                                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${isFormValid
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Confirmar dirección
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
