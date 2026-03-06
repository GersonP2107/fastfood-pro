'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RestaurantZone, RestaurantTable } from '@/lib/types';
import { ChevronRight, Users } from 'lucide-react';

interface ZoneSelectorProps {
    zones: RestaurantZone[];
    onTableSelect: (tableName: string, zoneName: string) => void;
    selectedTable?: string;
    selectedZoneName?: string;
}

export function ZoneSelector({ zones, onTableSelect, selectedTable, selectedZoneName }: ZoneSelectorProps) {
    // Find initial zone ID based on name or default to first zone
    const getInitialZoneId = () => {
        if (selectedZoneName) {
            const found = zones.find(z => z.name === selectedZoneName);
            if (found) return found.id;
        }
        return zones.length > 0 ? zones[0].id : null;
    };

    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(getInitialZoneId());

    // Sync with prop changes
    useEffect(() => {
        if (selectedZoneName) {
            const found = zones.find(z => z.name === selectedZoneName);
            if (found) setSelectedZoneId(found.id);
        }
    }, [selectedZoneName, zones]);

    const activeZone = zones.find(z => z.id === selectedZoneId);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <h3 className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-3 border-b border-gray-100">
                Ubicación
            </h3>

            {/* Zones Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
                {zones.map((zone) => (
                    <button
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors relative ${selectedZoneId === zone.id
                            ? 'text-[#fa0050]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {zone.name}
                        {selectedZoneId === zone.id && (
                            <motion.div
                                layoutId="activeZoneTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fa0050]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tables Grid */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedZoneId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                    >
                        {activeZone?.tables?.map((table) => {
                            const isSelected = selectedTable === table.name;
                            return (
                                <button
                                    key={table.id}
                                    onClick={() => activeZone && onTableSelect(table.name, activeZone.name)}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${isSelected
                                        ? 'border-[#fa0050] bg-rose-50 text-[#fa0050] shadow-md transform scale-105'
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/50 hover:shadow-sm'
                                        }`}
                                >
                                    <span className="text-lg font-bold mb-1">{table.name}</span>
                                    {table.capacity && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Users className="w-3 h-3" />
                                            <span>{table.capacity}</span>
                                        </div>
                                    )}

                                    {isSelected && (
                                        <motion.div
                                            layoutId="selectedTableCheck"
                                            className="absolute -top-2 -right-2 bg-[#fa0050] text-white rounded-full p-0.5 shadow-sm"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                        {(!activeZone?.tables || activeZone.tables.length === 0) && (
                            <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                                No hay mesas configuradas en esta zona.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
