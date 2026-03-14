'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { MenuDisplay } from '@/components/menu/MenuDisplay';
import { Cart } from '@/components/menu/Cart';
import { BusinessInfoModal } from '@/components/menu/BusinessInfoModal';
import { MapPin, Clock, Phone, MessageCircle, Info } from 'lucide-react';
import Image from 'next/image';

import { Businessman, DeliveryZone, ScheduleItem } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { checkBusinessStatus } from '@/lib/utils';

interface MerchantMenuClientProps {
    businessman: {
        id: string;
        business_name: string;
        description?: string;
        logo_url?: string;
        banner_url?: string;
        phone?: string;
        whatsapp_number: string;
        department?: string;
        city?: string;
        address?: string;
        opening_hours?: string;
        closing_hours?: string;
        accept_orders: boolean;
        operating_schedule?: ScheduleItem[];
        delivery_surge_multiplier?: number;
        delivery_time_estimate?: string;
    };
    deliveryZones: DeliveryZone[];
}

export function MerchantMenuClient({ businessman, deliveryZones }: MerchantMenuClientProps) {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const { items, clearCart } = useCartStore();
    const searchParams = useSearchParams();
    const tableNumber = searchParams.get('table');

    // Clear cart if it contains items from a different merchant
    useEffect(() => {
        if (items.length > 0 && items[0].product.businessman_id !== businessman.id) {
            clearCart();
        }
    }, [businessman.id, items, clearCart]);

    // Calculate if currently open using shared utility
    const { isOpen: isOpenNow, message: statusMessage } = checkBusinessStatus(
        businessman as Pick<typeof businessman, 'accept_orders' | 'operating_schedule'>
    );

    // Default values to ensure good UX even with missing data
    const businessInfo = {
        name: businessman.business_name || "Mi Negocio",
        description: businessman.description || "Deliciosa comida preparada con amor",
        logo: businessman.logo_url || "https://placehold.net/main.svg",
        banner: businessman.banner_url || null,
        phone: businessman.phone || "",
        whatsapp: businessman.whatsapp_number || "",
        department: businessman.department || "",
        city: businessman.city || "",
        address: businessman.address || "",
        openingHours: businessman.opening_hours || "09:00",
        closingHours: businessman.closing_hours || "21:00",
        acceptOrders: isOpenNow,
        operatingSchedule: businessman.operating_schedule || [],
        deliverySurgeMultiplier: businessman.delivery_surge_multiplier || 1,
        deliveryTime: businessman.delivery_time_estimate || "",
    };

    // Format WhatsApp link
    const whatsappLink = `https://api.whatsapp.com/send?phone=${businessInfo.whatsapp}&text=👋 Hola, vengo de tu menú digital. Deseo realizar un pedido.`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Modern Top Banner Section */}
            <div className="relative h-52 md:h-80 lg:h-96 bg-gray-100 overflow-hidden">
                {businessInfo.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={businessInfo.banner}
                        alt="Banner"
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-r from-[#fa0050] via-[#ff3375] to-[#fa0050]">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
                        }} />
                    </div>
                )}

                {/* Gradient overlay for contrast */}
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />
                {/* Bottom gradient for smoother card blend */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white/20 to-transparent" />

                {/* Status Badge - Top Left */}
                <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md backdrop-blur-md border border-white/20 ${businessInfo.acceptOrders
                        ? 'bg-black/40 text-white'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${businessInfo.acceptOrders ? 'bg-green-400 animate-pulse' : 'bg-red-300'}`} />
                        <span className="font-bold text-sm tracking-wide">
                            {businessInfo.acceptOrders ? 'Abierto' : 'Cerrado'}
                        </span>
                        {!businessInfo.acceptOrders && (
                            <span className="text-xs ml-1 font-medium text-red-100 truncate max-w-[120px]">
                                {statusMessage.replace('Cerrado. ', '')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Overlapping Card */}
            <div className="relative z-20 -mt-8 md:-mt-12 bg-white rounded-t-[32px] md:rounded-[40px] pt-6 pb-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto max-w-4xl px-5 md:px-10">

                    {/* Header Row: Logo & Name */}
                    <div className="flex items-end md:items-center gap-4 md:gap-6 mb-6">
                        {/* Logo */}
                        <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 shrink-0 rounded-[20px] md:rounded-[24px] shadow-lg overflow-hidden bg-white ring-4 ring-white">
                            <Image
                                src={businessInfo.logo}
                                alt={businessInfo.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Name, Description & Address */}
                        <div className="flex-1 pb-1 min-w-0">
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                {businessInfo.name}
                            </h1>

                            {/* Description — visible en md+, texto más cálido y legible */}
                            {businessInfo.description && (
                                <p className="hidden md:block text-[14px] md:text-[15px] text-gray-600 mt-2 leading-relaxed line-clamp-2 font-normal italic border-l-2 border-[#fa0050]/30 pl-3">
                                    {businessInfo.description}
                                </p>
                            )}

                            {/* Address — pill separado visualmente */}
                            <div className="inline-flex items-center gap-1.5 mt-3 bg-gray-100 rounded-full px-3 py-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#fa0050]" />
                                <span className="text-xs text-gray-500 font-medium leading-none truncate">
                                    {[businessInfo.address, businessInfo.city, businessInfo.department].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block border-t border-gray-100 mb-5" />

                    {/* Delivery & Action Pills Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Delivery Time (Prominent Pill) */}
                        <div className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors rounded-[20px] p-4 flex items-center justify-between cursor-default">
                            <div className="flex items-center gap-3 text-gray-900 font-bold text-base">
                                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <Clock className="w-4 h-4 text-[#fa0050]" />
                                </span>
                                <div>
                                    <span className="block text-sm font-extrabold pb-0.5">Entrega a domicilio</span>
                                    <span className="block text-xs font-medium text-gray-500 leading-none">{businessInfo.deliveryTime || '30-45 min'} aprox.</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 md:px-6 rounded-[20px] transition-colors py-3 group min-w-[52px]"
                            >
                                <MessageCircle className="w-5 h-5 shrink-0" />
                                <span className="hidden md:inline text-sm">WhatsApp</span>
                            </a>
                            <a
                                href={`tel:${businessInfo.phone}`}
                                className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 md:px-5 rounded-[20px] transition-colors py-3 group min-w-[52px]"
                            >
                                <Phone className="w-5 h-5 shrink-0" />
                                <span className="hidden md:inline text-sm">Llamar</span>
                            </a>
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 md:px-5 rounded-[20px] transition-colors py-3 group min-w-[52px]"
                            >
                                <Info className="w-5 h-5 shrink-0" />
                                <span className="hidden md:inline text-sm">Info</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            < main className="container mx-auto px-4 py-8 grow" >
                <MenuDisplay businessmanId={businessman.id} />
            </main >

            {/* Footer */}
            < footer className="bg-white border-t border-gray-200 mt-auto" >
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-500">
                        Powered by <span className="font-semibold text-[#fa0050]">FoodFast Pro</span>
                    </div>
                </div>
            </footer >

            {/* Floating Cart */}
            {/* Type assertion needed because businessman from DB might not strictly match the detailed interface yet if DB migration isn't fully reflected in types at runtime, but types.ts is updated so it should be fine. Casting to any or specific type if needed. 
               The 'businessman' prop here comes from the page props which uses the Businessman type. 
            */}
            <Cart
                businessman={businessman as unknown as Businessman}
                deliveryZones={deliveryZones}
                tableNumber={tableNumber || undefined}
            />

            {/* Business Info Modal */}
            <BusinessInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                businessInfo={businessInfo}
                deliveryZones={deliveryZones}
            />
        </div >
    );
}
