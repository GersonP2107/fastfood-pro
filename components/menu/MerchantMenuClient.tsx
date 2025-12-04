'use client';

import { useState } from 'react';
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
            {/* Modern Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo and Business Name */}
                        <div className="flex items-center gap-2">
                            <div className="relative size-[80px] rounded-xl overflow-hidden bg-gray-100 shadow-2xl border-3 border-white ">
                                <Image
                                    src={businessInfo.logo}
                                    alt={businessInfo.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="text-sm md:text-2xl font-semibold text-gray-900">
                                    {businessInfo.name}
                                </h2>
                                <button
                                    onClick={() => setShowInfoModal(true)}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>{businessInfo.address}</span>
                                </button>
                            </div>
                        </div>

                        {/* Info Button - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                            >
                                <Info className="w-5 h-5" />
                                Información
                            </button>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp
                            </a>
                        </div>

                        {/* Info Button - Mobile */}
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Status Banner */}
            <div className={`${businessInfo.acceptOrders ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-b`}>
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Status Info */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${businessInfo.acceptOrders ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`font-medium ${businessInfo.acceptOrders ? 'text-green-700' : 'text-red-700'}`}>
                                {businessInfo.acceptOrders ? 'Abierto ahora' : 'Cerrado'}
                            </span>
                            <span className="text-gray-600">•</span>
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">
                                {businessInfo.openingHours} - {businessInfo.closingHours}
                            </span>
                        </div>

                        {/* WhatsApp Button - Always visible */}
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>

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
