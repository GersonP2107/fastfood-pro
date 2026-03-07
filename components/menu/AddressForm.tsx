'use client';

// ============================================================================
// FoodFast Pro - Address Form with Saved Addresses
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeliveryZone } from '@/lib/types';
import { ChevronLeft, ChevronUp, ChevronDown, User, Phone, Plus, Trash2, Check, Pencil } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedAddress {
    id: string;
    label: string;          // e.g. "🏠 Casa", "💼 Trabajo"
    street: string;
    number: string;
    neighborhood: string;
    zoneCost: number;
    references: string;
}

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

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'foodfast_saved_addresses';
const LABEL_SUGGESTIONS = ['🏠 Casa', '💼 Trabajo', '❤️ Pareja', '👨‍👩‍👧 Familia', '🏫 Estudio', '📍 Otro'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadAddresses = (): SavedAddress[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveAddresses = (addresses: SavedAddress[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

// ─── View states ─────────────────────────────────────────────────────────────
type View = 'list' | 'new';

// ─── Component ────────────────────────────────────────────────────────────────
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
    const [view, setView] = useState<View>('list');
    const [showCustomerData, setShowCustomerData] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => loadAddresses());
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // New address form
    const [label, setLabel] = useState('');
    const [customLabel, setCustomLabel] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [references, setReferences] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset state when drawer opens — reads latest addresses from localStorage
    useEffect(() => {
        if (isOpen) {
            const addresses = loadAddresses();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSavedAddresses(addresses);
            setView(addresses.length === 0 ? 'new' : 'list');
            setSelectedId(null);
        }
    }, [isOpen]);

    // ── Derived ────────────────────────────────────────────────────────────────
    const selectedZone = deliveryZones.find(z => z.zone_name === neighborhood);
    const computedZoneCost = selectedZone
        ? Math.round(selectedZone.delivery_cost * deliverySurgeMultiplier)
        : 0;

    const finalLabel = label === 'Otro' ? customLabel : label;
    const isNewFormValid = finalLabel.trim() && street.trim() && number.trim() && neighborhood;

    // ── Actions ────────────────────────────────────────────────────────────────
    const resetNewForm = () => {
        setLabel('');
        setCustomLabel('');
        setStreet('');
        setNumber('');
        setNeighborhood('');
        setReferences('');
        setErrors({});
    };

    const handleSaveNew = () => {
        const newErrors: Record<string, string> = {};
        if (!finalLabel.trim()) newErrors.label = 'Ponle un nombre a esta dirección';
        if (!street.trim()) newErrors.street = 'Ingresa la calle o avenida';
        if (!number.trim()) newErrors.number = 'Ingresa el número';
        if (!neighborhood) newErrors.neighborhood = 'Selecciona tu barrio';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const newAddr: SavedAddress = {
            id: crypto.randomUUID(),
            label: finalLabel.trim(),
            street: street.trim(),
            number: number.trim(),
            neighborhood,
            zoneCost: computedZoneCost,
            references: references.trim(),
        };

        const updated = [newAddr, ...savedAddresses].slice(0, 8);
        setSavedAddresses(updated);
        saveAddresses(updated);
        resetNewForm();

        // Auto-select the newly saved address and confirm
        const fullAddress = `${newAddr.street} ${newAddr.number}, ${newAddr.neighborhood}${newAddr.references ? `, ${newAddr.references}` : ''}`;
        onConfirm(fullAddress, newAddr.zoneCost);
    };

    const handleConfirmSelected = () => {
        const addr = savedAddresses.find(a => a.id === selectedId);
        if (!addr) return;
        const fullAddress = `${addr.street} ${addr.number}, ${addr.neighborhood}${addr.references ? `, ${addr.references}` : ''}`;
        onConfirm(fullAddress, addr.zoneCost);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedAddresses.filter(a => a.id !== id);
        setSavedAddresses(updated);
        saveAddresses(updated);
        if (selectedId === id) setSelectedId(null);
        if (updated.length === 0) setView('new');
    };

    // ── Render ─────────────────────────────────────────────────────────────────
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

                    {/* Main Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* ── Header ───────────────────────────────────────── */}
                        <div className="bg-white p-4 flex items-center gap-3 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.06)]">
                            <button
                                onClick={() => {
                                    if (view === 'new' && savedAddresses.length > 0) {
                                        resetNewForm();
                                        setView('list');
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <h3 className="text-lg font-bold text-gray-900">
                                {view === 'list' ? 'Mis direcciones' : 'Nueva dirección'}
                            </h3>

                            {/* Add new button (shown in list view) */}
                            {view === 'list' && (
                                <motion.button
                                    onClick={() => { resetNewForm(); setView('new'); }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="ml-auto flex items-center gap-1.5 bg-[#fa0050] text-white text-sm font-bold px-3 py-1.5 rounded-full"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar
                                </motion.button>
                            )}
                        </div>

                        {/* ── Content ──────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">

                            {/* ── Customer Info Accordion ─────────────────── */}
                            <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setShowCustomerData(!showCustomerData)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900 text-sm">Mis datos personales</span>
                                    </div>
                                    {showCustomerData
                                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>

                                <AnimatePresence>
                                    {showCustomerData && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2"
                                        >
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-gray-700">{customerName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-gray-700">{customerPhone}</span>
                                            </div>
                                            <button
                                                onClick={onEditCustomerInfo}
                                                className="text-sm text-[#fa0050] font-semibold mt-1 flex items-center gap-1"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Cambiar datos
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ════════════════════════════════════════════════
                                VIEW: LIST
                            ════════════════════════════════════════════════ */}
                            <AnimatePresence mode="wait">
                                {view === 'list' && (
                                    <motion.div
                                        key="list"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-3"
                                    >
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                                            Selecciona una dirección
                                        </p>

                                        {savedAddresses.map((addr) => {
                                            const isSelected = selectedId === addr.id;
                                            return (
                                                <motion.div
                                                    key={addr.id}
                                                    onClick={() => setSelectedId(addr.id)}
                                                    whileTap={{ scale: 0.99 }}
                                                    className={`bg-white rounded-[20px] p-4 cursor-pointer transition-all shadow-sm border-2 ${isSelected
                                                        ? 'border-[#fa0050] shadow-[0_4px_20px_rgba(250,0,80,0.1)]'
                                                        : 'border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Selection indicator */}
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                            ? 'bg-[#fa0050] border-[#fa0050]'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white stroke-3" />}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 text-[15px] leading-tight">{addr.label}</p>
                                                            <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                                                                {addr.street} {addr.number}, {addr.neighborhood}
                                                            </p>
                                                            {addr.references && (
                                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{addr.references}</p>
                                                            )}
                                                            {addr.zoneCost > 0 && (
                                                                <p className="text-xs font-bold text-[#fa0050] mt-1.5">
                                                                    Envío: ${addr.zoneCost.toLocaleString('es-CO')}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={(e) => handleDelete(addr.id, e)}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {/* ════════════════════════════════════════════
                                    VIEW: NEW ADDRESS FORM
                                ════════════════════════════════════════════ */}
                                {view === 'new' && (
                                    <motion.div
                                        key="new"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        {/* Label / Nickname Picker */}
                                        <div className="bg-white rounded-[20px] p-4 shadow-sm space-y-3">
                                            <label className="block text-sm font-bold text-gray-900">
                                                ¿Cómo quieres llamar esta dirección?
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {LABEL_SUGGESTIONS.map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setLabel(s === label ? '' : s)}
                                                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all border ${label === s
                                                            ? 'bg-[#fa0050] text-white border-[#fa0050]'
                                                            : 'bg-[#f8f9fa] text-gray-700 border-transparent hover:border-gray-200'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                            {label === '📍 Otro' && (
                                                <input
                                                    type="text"
                                                    value={customLabel}
                                                    onChange={e => setCustomLabel(e.target.value)}
                                                    placeholder="Escribe el nombre de esta dirección"
                                                    className="w-full px-4 py-3 bg-[#f8f9fa] border border-transparent rounded-[14px] focus:outline-none focus:border-[#fa0050] text-sm transition-colors"
                                                    autoFocus
                                                />
                                            )}
                                            {errors.label && <p className="text-xs text-red-500">{errors.label}</p>}
                                        </div>

                                        {/* Address fields */}
                                        <div className="bg-white rounded-[20px] p-4 shadow-sm space-y-3">
                                            <label className="block text-sm font-bold text-gray-900 mb-1">Dirección</label>

                                            {/* Street */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={street}
                                                    onChange={e => { setStreet(e.target.value); setErrors(p => ({ ...p, street: '' })); }}
                                                    placeholder="Calle / Carrera / Avenida"
                                                    className={`w-full px-4 py-3 bg-[#f8f9fa] border rounded-[14px] focus:outline-none focus:border-[#fa0050] text-sm transition-colors ${errors.street ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                                />
                                                {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                                            </div>

                                            {/* Number */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={number}
                                                    onChange={e => { setNumber(e.target.value); setErrors(p => ({ ...p, number: '' })); }}
                                                    placeholder="Número (ej: # 26-28)"
                                                    className={`w-full px-4 py-3 bg-[#f8f9fa] border rounded-[14px] focus:outline-none focus:border-[#fa0050] text-sm transition-colors ${errors.number ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                                />
                                                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                                            </div>

                                            {/* Neighborhood / Zone */}
                                            <div>
                                                <select
                                                    value={neighborhood}
                                                    onChange={e => { setNeighborhood(e.target.value); setErrors(p => ({ ...p, neighborhood: '' })); }}
                                                    className={`w-full px-4 py-3 bg-[#f8f9fa] border rounded-[14px] focus:outline-none focus:border-[#fa0050] appearance-none text-sm transition-colors ${errors.neighborhood ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                                >
                                                    <option value="">Selecciona tu barrio / zona</option>
                                                    {deliveryZones.map((zone) => (
                                                        <option key={zone.id} value={zone.zone_name}>
                                                            {zone.zone_name} — ${(Math.round(zone.delivery_cost * deliverySurgeMultiplier)).toLocaleString('es-CO')} envío
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood}</p>}
                                            </div>

                                            {/* References (optional) */}
                                            <input
                                                type="text"
                                                value={references}
                                                onChange={e => setReferences(e.target.value)}
                                                placeholder="Referencias adicionales (opcional)"
                                                className="w-full px-4 py-3 bg-[#f8f9fa] border border-transparent rounded-[14px] focus:outline-none focus:border-[#fa0050] text-sm transition-colors"
                                            />

                                            {/* Delivery cost preview */}
                                            {neighborhood && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="flex items-center justify-between bg-rose-50 rounded-[14px] px-4 py-3 mt-1"
                                                >
                                                    <span className="text-sm font-semibold text-gray-700">Costo de envío estimado</span>
                                                    <span className="text-sm font-black text-[#fa0050]">
                                                        ${computedZoneCost.toLocaleString('es-CO')}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Footer ───────────────────────────────────────── */}
                        <div className="shrink-0 bg-white p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.06)] rounded-t-[28px]">
                            {view === 'list' ? (
                                <motion.button
                                    onClick={handleConfirmSelected}
                                    disabled={!selectedId}
                                    whileHover={selectedId ? { scale: 1.02 } : {}}
                                    whileTap={selectedId ? { scale: 0.98 } : {}}
                                    className={`w-full py-4 rounded-[20px] font-bold text-base transition-all duration-300 ${selectedId
                                        ? 'bg-[#fa0050] hover:bg-[#d4003e] text-white shadow-[0_4px_15px_rgba(250,0,80,0.3)]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Usar esta dirección
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleSaveNew}
                                    disabled={!isNewFormValid}
                                    whileHover={isNewFormValid ? { scale: 1.02 } : {}}
                                    whileTap={isNewFormValid ? { scale: 0.98 } : {}}
                                    className={`w-full py-4 rounded-[20px] font-bold text-base transition-all duration-300 ${isNewFormValid
                                        ? 'bg-[#fa0050] hover:bg-[#d4003e] text-white shadow-[0_4px_15px_rgba(250,0,80,0.3)]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Guardar y continuar
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
