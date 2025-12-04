'use client';

// ============================================================================
// FoodFast Pro - Modifier Modal Component
// ============================================================================

import { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import type { Product, Modifier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ModifierModalProps {
    producto: Product;
    onClose: () => void;
    onConfirm: (modificadores: Modifier[]) => void;
}

export function ModifierModal({ producto, onClose, onConfirm }: ModifierModalProps) {
    const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

    const modificadores = producto.product_modifiers?.map((pm) => pm.modifier).filter(Boolean) as Modifier[] || [];

    const toggleModifier = (modifierId: string) => {
        setSelectedModifiers((prev) =>
            prev.includes(modifierId)
                ? prev.filter((id) => id !== modifierId)
                : [...prev, modifierId]
        );
    };

    const handleConfirm = () => {
        const selected = modificadores.filter((mod) => selectedModifiers.includes(mod.id));
        onConfirm(selected);
    };

    const totalAdicional = modificadores
        .filter((mod) => selectedModifiers.includes(mod.id))
        .reduce((sum, mod) => sum + mod.additional_price, 0);

    const precioFinal = (producto.discount_price || producto.price) + totalAdicional;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold pr-12">{producto.name}</h2>
                    {producto.description && (
                        <p className="text-white/90 text-sm mt-2">{producto.description}</p>
                    )}
                    <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold">
                            Precio base: {formatCurrency(producto.discount_price || producto.price)}
                        </span>
                    </div>
                </div>

                {/* Modifiers List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Personaliza tu pedido
                        </h3>
                        <span className="text-sm text-gray-500">
                            {selectedModifiers.length} seleccionado{selectedModifiers.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {modificadores.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay modificadores disponibles</p>
                        </div>
                    ) : (
                        modificadores.map((modificador) => {
                            const isSelected = selectedModifiers.includes(modificador.id);
                            return (
                                <button
                                    key={modificador.id}
                                    onClick={() => toggleModifier(modificador.id)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                }`}
                                        >
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">{modificador.name}</p>
                                            {modificador.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{modificador.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    {modificador.additional_price > 0 && (
                                        <span className="text-blue-600 font-bold text-sm">
                                            +{formatCurrency(modificador.additional_price)}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {totalAdicional > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">Extras seleccionados:</span>
                                <span className="font-semibold text-blue-600">
                                    +{formatCurrency(totalAdicional)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="text-3xl font-bold text-gray-900">
                            {formatCurrency(precioFinal)}
                        </span>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    );
}
