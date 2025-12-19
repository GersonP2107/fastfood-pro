'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { MenuDisplay } from '@/components/menu/MenuDisplay';
import { Cart } from '@/components/menu/Cart';
import { BusinessInfoModal } from '@/components/menu/BusinessInfoModal';
import { MapPin, Clock, Phone, MessageCircle, Info } from 'lucide-react';
import Image from 'next/image';

interface MerchantMenuClientProps {
    businessman: {
        id: string;
        business_name: string;
        description?: string;
        logo_url?: string;
        phone?: string;
        whatsapp_number: string;
        address?: string;
        opening_hours?: string;
        closing_hours?: string;
        accept_orders: boolean;
    };
}

export function MerchantMenuClient({ businessman }: MerchantMenuClientProps) {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const { items, clearCart } = useCartStore();

    // Clear cart if it contains items from a different merchant
    useEffect(() => {
        if (items.length > 0 && items[0].product.businessman_id !== businessman.id) {
            clearCart();
        }
    }, [businessman.id, items, clearCart]);


    // Default values to ensure good UX even with missing data
    const businessInfo = {
        name: businessman.business_name || "Mi Negocio",
        description: businessman.description || "Deliciosa comida preparada con amor",
        logo: businessman.logo_url || "https://d2nagnwby8accc.cloudfront.net/companies/logos/390bd37b-e06e-4f35-aadc-051b1db18bbf.webp",
        phone: businessman.phone || "316 638 5652",
        whatsapp: businessman.whatsapp_number || "573166385652",
        address: businessman.address || "Cali, Colombia",
        openingHours: businessman.opening_hours || "09:00",
        closingHours: businessman.closing_hours || "21:00",
        acceptOrders: businessman.accept_orders ?? true,
    };

    // Format WhatsApp link
    const whatsappLink = `https://api.whatsapp.com/send?phone=${businessInfo.whatsapp}&text=👋 Hola, vengo de tu menú digital. Deseo realizar un pedido.`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modern Header with Banner */}
            <header className="bg-white shadow-md rounded-2xl">{/* Removed sticky positioning */}
                {/* Banner Image with Logo */}
                <div className="relative h-32 md:h-40 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 overflow-hidden ">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 10px,
                                rgba(255,255,255,0.1) 10px,
                                rgba(255,255,255,0.1) 20px
                            )`
                        }} />
                    </div>

                    {/* Status Badge - Top Left */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg ${businessInfo.acceptOrders
                            ? 'bg-white text-green-600'
                            : 'bg-white text-red-600'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${businessInfo.acceptOrders ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            <span className="font-bold text-sm">
                                {businessInfo.acceptOrders ? 'Abierto' : 'Cerrado'}
                            </span>
                        </div>
                    </div>

                    {/* Contact Info - Top Right */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">{businessInfo.phone}</span>
                            </div>
                        </div>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-colors"
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium">WhatsApp</span>
                            </div>
                        </a>
                    </div>

                    {/* Logo - Centered at bottom, overlapping */}
                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-50">
                        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-black shadow-2xl border-4 border-white">
                            <Image
                                src={businessInfo.logo}
                                alt={businessInfo.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Info Section */}
                <div className="p-5">
                    <div className="container mx-auto max-w-2xl">
                        {/* Business Name */}
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                            {businessInfo.name}
                        </h1>

                        {/* Address */}
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{businessInfo.address}</span>
                        </div>

                        {/* Delivery Time */}
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Entrega 30 - 60min.
                            </span>
                        </div>

                        {/* Info Button */}
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors font-medium border border-gray-200"
                        >
                            <Info className="w-5 h-5" />
                            <span>Información</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <MenuDisplay businessmanId={businessman.id} />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-20 bottom-0">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-500">
                        Powered by <span className="font-semibold text-blue-600">FoodFast Pro</span>
                    </div>
                </div>
            </footer>

            {/* Floating Cart */}
            <Cart />

            {/* Business Info Modal */}
            <BusinessInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                businessInfo={businessInfo}
            />
        </div>
    );
}
