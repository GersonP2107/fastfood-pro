'use client';

// ============================================================================
// FoodFast Pro - Business Info Modal Component
// ============================================================================

import { X, MapPin, Clock, Phone, MessageCircle, Instagram, Share2 } from 'lucide-react';
import { DeliveryZone, ScheduleItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

// Helper to format time (e.g. "08:00" -> "8:00 AM")
const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${suffix}`;
};

interface BusinessInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessInfo: {
        name: string;
        description: string;
        logo: string;
        phone: string;
        whatsapp: string;
        address: string;
        city?: string;
        department?: string;
        openingHours: string;
        closingHours: string;
        acceptOrders: boolean;
        operatingSchedule: ScheduleItem[];
        deliverySurgeMultiplier?: number;
        deliveryTime?: string;
    };
    deliveryZones: DeliveryZone[];
}

export function BusinessInfoModal({ isOpen, onClose, businessInfo, deliveryZones }: BusinessInfoModalProps) {
    if (!isOpen) return null;

    const whatsappLink = `https://api.whatsapp.com/send?phone=${businessInfo.whatsapp}&text=👋 Hola, vengo de tu menú digital.`;

    const handleShare = async () => {
        // ... (existing share logic)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: businessInfo.name,
                    text: businessInfo.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    // Ordered days for display
    const orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const daysMap: Record<string, string> = {
        'monday': 'Lunes',
        'tuesday': 'Martes',
        'wednesday': 'Miércoles',
        'thursday': 'Jueves',
        'friday': 'Viernes',
        'saturday': 'Sábado',
        'sunday': 'Domingo'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-[24px] shadow-2xl max-w-2xl w-full my-8 animate-slide-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Información del negocio</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2 w-fit px-3 py-1.5 rounded-full bg-[#f8f9fa] shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100">
                        <div className={`w-2.5 h-2.5 rounded-full ${businessInfo.acceptOrders ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                        <span className="font-bold text-[13px] text-gray-900 leading-none mt-0.5">
                            {businessInfo.acceptOrders ? 'Abierto ahora' : 'Cerrado temporalmente'}
                        </span>
                    </div>

                    {/* Business Name and Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-gray-50 shrink-0 relative">
                            <Image
                                src={businessInfo.logo}
                                alt={businessInfo.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">{businessInfo.name}</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1 leading-snug">{businessInfo.description}</p>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#f8f9fa] hover:bg-green-50 rounded-full transition-colors group flex items-center justify-center border border-gray-100"
                            title="WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-green-500 transition-colors" />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#f8f9fa] hover:bg-pink-50 rounded-full transition-colors group flex items-center justify-center border border-gray-100"
                            title="Instagram"
                        >
                            <Instagram className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
                        </a>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-[#f8f9fa] hover:bg-gray-100 rounded-full transition-colors group flex items-center justify-center border border-gray-100"
                            title="Compartir"
                        >
                            <Share2 className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                        </button>
                    </div>

                    {/* Address */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3 text-[15px]">Dirección</h4>
                        <div className="flex items-start gap-3 bg-[#f8f9fa] p-4 rounded-[24px] shadow-sm border border-white">
                            <MapPin className="w-5 h-5 text-[#fa0050] shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">{businessInfo.address}</p>
                                {(businessInfo.city || businessInfo.department) && (
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        {[businessInfo.city, businessInfo.department].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Type */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3 text-[15px]">Tipos de servicio</h4>

                        {/* Delivery */}
                        <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-[24px] mb-3 shadow-sm border border-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-full shadow-sm">
                                    <svg className="w-5 h-5 text-[#fa0050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 17h4V5H2v12h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        <path d="M14 17h1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        <circle cx="7.5" cy="17.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                        <circle cx="17.5" cy="17.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">A domicilio</p>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">Te lo llevamos en {businessInfo.deliveryTime}.</p>
                                </div>
                            </div>
                            <div className="text-green-500 bg-green-50 p-1 rounded-full">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Pickup */}
                        <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-[24px] shadow-sm border border-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-full shadow-sm">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#fa0050]"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Para llevar</p>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">Recoge en el local</p>
                                </div>
                            </div>
                            <div className="text-green-500 bg-green-50 p-1 rounded-full">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Coverage */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3 text-[15px]">Cobertura de entrega</h4>
                        <div className="bg-[#f8f9fa] rounded-[24px] p-4 max-h-60 overflow-y-auto shadow-sm border border-white">
                            <p className="text-sm font-medium text-gray-600 mb-4">
                                Zonas disponibles para domicilio:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                {deliveryZones.length > 0 ? (
                                    deliveryZones.map((zone) => (
                                        <div key={zone.id} className="flex items-center gap-1.5 p-2 bg-white rounded-[12px] shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                                            <span className="text-gray-800 font-semibold truncate leading-tight flex-1">
                                                {zone.zone_name}
                                                <span className="text-gray-400 font-medium block mt-0.5">
                                                    ({formatCurrency(Math.round(zone.delivery_cost * (businessInfo.deliverySurgeMultiplier || 1)))})
                                                </span>
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-3 text-gray-500 italic">
                                        No hay zonas de cobertura registradas.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4 text-[15px]">Horarios de atención</h4>
                        <div className="space-y-1 bg-[#f8f9fa] rounded-[24px] p-2 shadow-sm border border-white">
                            {orderedDays.map((dayKey) => {
                                const schedule = businessInfo.operatingSchedule.find(s => s.day === dayKey);
                                const isToday = dayKey === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

                                return (
                                    <div key={dayKey} className={`flex items-center justify-between py-2.5 px-3 ${isToday ? 'bg-white shadow-sm rounded-[14px]' : 'rounded-[14px] hover:bg-gray-100/50 transition-colors'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isToday ? 'font-bold text-[#fa0050]' : 'font-semibold text-gray-700'}`}>
                                                {daysMap[dayKey]}
                                            </span>
                                            {isToday && <span className="text-[10px] bg-rose-100 text-[#fa0050] px-2 py-0.5 rounded-full font-bold">HOY</span>}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className={`w-3.5 h-3.5 ${isToday ? 'text-[#fa0050]' : 'text-gray-400'}`} />
                                            {schedule && schedule.isActive ? (
                                                <span className={`text-sm tracking-tight ${isToday ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {formatTime12h(schedule.open)} - {formatTime12h(schedule.close)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 font-semibold text-sm">Cerrado</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 px-4 rounded-[20px] transition-all font-bold border border-transparent hover:border-green-100"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Escribir por WhatsApp
                        </a>
                        <a
                            href={`tel:${businessInfo.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#fa0050] hover:bg-[#d4003e] text-white py-3.5 px-4 rounded-[20px] shadow-[0_4px_15px_rgba(250,0,80,0.3)] transition-all font-bold"
                        >
                            <Phone className="w-5 h-5" />
                            Llamar ahora
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
