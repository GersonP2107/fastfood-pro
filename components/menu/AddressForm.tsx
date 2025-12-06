'use client';

// ============================================================================
// FoodFast Pro - Address Form Component
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronUp, ChevronDown, User, Phone, Lock, Plus } from 'lucide-react';

interface AddressFormProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string) => void;
    customerName: string;
    customerPhone: string;
}

export function AddressForm({
    isOpen,
    onClose,
    onConfirm,
    customerName,
    customerPhone
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
        // Build complete address from form fields
        if (street && number && neighborhood) {
            const fullAddress = `${street} ${number}, ${neighborhood}${references ? `, ${references}` : ''}`;
            onConfirm(fullAddress);
        } else if (selectedAddress) {
            onConfirm(selectedAddress);
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
                                                    {[
                                                        { name: 'ALAMEDA', cost: 7000 },
                                                        { name: 'ANTONIO NARIÑO', cost: 5000 },
                                                        { name: 'BATALLON', cost: 5000 },
                                                        { name: 'BELALCAZAR', cost: 5000 },
                                                        { name: 'BOCHALEMA', cost: 4000 },
                                                        { name: 'CALICANTO', cost: 3000 },
                                                        { name: 'CAMINO REAL', cost: 5000 },
                                                        { name: 'CANEY', cost: 4000 },
                                                        { name: 'CAÑAS GORDAS', cost: 6000 },
                                                        { name: 'CAÑAVERALES', cost: 5000 },
                                                        { name: 'CAPRI', cost: 4000 },
                                                        { name: 'CHAMPAGNAT', cost: 4000 },
                                                        { name: 'CIUDAD 2000', cost: 5000 },
                                                        { name: 'CIUDAD CORDOBA', cost: 5000 },
                                                        { name: 'CIUDAD JARDIN', cost: 6000 },
                                                        { name: 'CIUDAD MELENDEZ', cost: 5000 },
                                                        { name: 'CIUDAD PACIFICA', cost: 5000 },
                                                        { name: 'CIUDADELA COMFANDI', cost: 5000 },
                                                        { name: 'COLSEGUROS', cost: 4000 },
                                                        { name: 'CRISTOBAL COLON', cost: 5000 },
                                                        { name: 'CUARTO DE LEGUA', cost: 5000 },
                                                        { name: 'DEPARTAMENTAL', cost: 4000 },
                                                        { name: 'EL DIAMANTE', cost: 5000 },
                                                        { name: 'EL DORADO', cost: 6000 },
                                                        { name: 'EL REFUGIO', cost: 5000 },
                                                        { name: 'GUABAL', cost: 5000 },
                                                        { name: 'GUADUALES', cost: 4000 },
                                                        { name: 'GUAYAQUIL', cost: 5000 },
                                                        { name: 'HACIENDA KACHIPAY', cost: 6000 },
                                                        { name: 'INGENIO', cost: 6000 },
                                                        { name: 'JARDIN', cost: 5000 },
                                                        { name: 'JUNIN', cost: 5000 },
                                                        { name: 'LA HACIENDA', cost: 7000 },
                                                        { name: 'LA INDEPENDENCIA', cost: 5000 },
                                                        { name: 'LA SELVA', cost: 6000 },
                                                        { name: 'LAS VEGAS', cost: 5000 },
                                                        { name: 'LIDO', cost: 5000 },
                                                        { name: 'LIMONAR', cost: 6000 },
                                                        { name: 'LLANO VERDE', cost: 4000 },
                                                        { name: 'LOS CAMBULOS', cost: 5000 },
                                                        { name: 'MARIANO RAMOS', cost: 4000 },
                                                        { name: 'MELENDEZ', cost: 5000 },
                                                        { name: 'MORICHAL', cost: 5000 },
                                                        { name: 'NAPOLES', cost: 4000 },
                                                        { name: 'PAMPALINDA', cost: 5000 },
                                                        { name: 'PANCE', cost: 6000 },
                                                        { name: 'PASO ANCHO', cost: 6000 },
                                                        { name: 'PRADOS DEL LIMONAR', cost: 5000 },
                                                        { name: 'PRIMERA DE MAYO', cost: 5000 },
                                                        { name: 'PUERTO RELLENA', cost: 4000 },
                                                        { name: 'REPUBLICA DE ISRAEL', cost: 5000 },
                                                        { name: 'SAN FERNANDO', cost: 5000 },
                                                        { name: 'SAN JUDAS', cost: 5000 },
                                                        { name: 'SAN NICOLAS', cost: 5000 },
                                                        { name: 'SANTA ANITA', cost: 5000 },
                                                        { name: 'SANTA HELENA', cost: 4000 },
                                                        { name: 'SANTA LIBRADA', cost: 5000 },
                                                        { name: 'SAUCES', cost: 5000 },
                                                        { name: 'TEQUENDAMA', cost: 7000 },
                                                        { name: 'UNION', cost: 4000 },
                                                        { name: 'VALLADO', cost: 4000 },
                                                        { name: 'VALLE DEL LILI', cost: 4000 },
                                                        { name: 'VAYADO', cost: 5000 },
                                                        { name: 'VEGAS DE COMFANDI', cost: 6000 },
                                                    ].map((zone) => (
                                                        <option key={zone.name} value={zone.name}>
                                                            {zone.name} ($ {zone.cost.toLocaleString()})
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
            )}
        </AnimatePresence>
    );
}
