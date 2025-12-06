'use client';

// ============================================================================
// FoodFast Pro - Business Info Modal Component
// ============================================================================

import { X, MapPin, Clock, Phone, MessageCircle, Instagram, Share2 } from 'lucide-react';

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
        openingHours: string;
        closingHours: string;
        acceptOrders: boolean;
    };
}

export function BusinessInfoModal({ isOpen, onClose, businessInfo }: BusinessInfoModalProps) {
    if (!isOpen) return null;

    const whatsappLink = `https://api.whatsapp.com/send?phone=${businessInfo.whatsapp}&text=👋 Hola, vengo de tu menú digital.`;

    const handleShare = async () => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-slide-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Información</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${businessInfo.acceptOrders ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-semibold text-gray-900">
                            {businessInfo.acceptOrders ? 'Abierto' : 'Cerrado'}
                        </span>
                    </div>

                    {/* Business Name and Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shadow-md flex-shrink-0">
                            <img
                                src={businessInfo.logo}
                                alt={businessInfo.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{businessInfo.name}</h3>
                            <p className="text-gray-600 mt-1">{businessInfo.description}</p>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            title="WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5 text-gray-700" />
                        </a>
                        <a
                            href="#"
                            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            title="Instagram"
                        >
                            <Instagram className="w-5 h-5 text-gray-700" />
                        </a>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            title="Compartir"
                        >
                            <Share2 className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Address */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Dirección</h4>
                        <div className="flex items-start gap-3 text-gray-700">
                            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p>{businessInfo.address}</p>
                        </div>
                    </div>

                    {/* Delivery Type */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Tipos de servicio</h4>

                        {/* Delivery */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">A domicilio</p>
                                    <p className="text-sm text-gray-600">Tiempo de entrega a domicilio 30 - 60min.</p>
                                </div>
                            </div>
                            <div className="text-green-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Pickup */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Para llevar</p>
                                </div>
                            </div>
                            <div className="text-green-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Coverage */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Cobertura de entrega</h4>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                            <p className="text-xs text-gray-600 mb-3">
                                Zonas disponibles para domicilio:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                {[
                                    'LA HACIENDA', 'TEQUENDAMA', 'LIMONAR', 'EL DORADO', 'CIUDAD JARDIN',
                                    'VEGAS DE COMFANDI', 'REPUBLICA DE ISRAEL', 'BELALCAZAR', 'ALAMEDA',
                                    'PUERTO RELLENA', 'LLANO VERDE', 'CHAMPAGNAT', 'CALICANTO', 'VALLADO',
                                    'VALLE DEL LILI', 'SANTA HELENA', 'COLSEGUROS', 'UNION', 'CANEY',
                                    'CAPRI', 'DEPARTAMENTAL', 'MARIANO RAMOS', 'GUADUALES', 'NAPOLES',
                                    'BOCHALEMA', 'CRISTOBAL COLON', 'CIUDADELA COMFANDI', 'CAMINO REAL',
                                    'SAUCES', 'CIUDAD MELENDEZ', 'LAS VEGAS', 'PRIMERA DE MAYO',
                                    'EL REFUGIO', 'CIUDAD PACIFICA', 'SAN JUDAS', 'CUARTO DE LEGUA',
                                    'CIUDAD CORDOBA', 'GUAYAQUIL', 'JUNIN', 'LOS CAMBULOS', 'CAÑAVERALES',
                                    'VAYADO', 'SANTA ANITA', 'SAN NICOLAS', 'JARDIN', 'MORICHAL',
                                    'PAMPALINDA', 'SANTA LIBRADA', 'LA INDEPENDENCIA', 'LIDO',
                                    'PRADOS DEL LIMONAR', 'CIUDAD 2000', 'EL DIAMANTE', 'GUABAL',
                                    'BATALLON', 'ANTONIO NARIÑO', 'HACIENDA KACHIPAY', 'LA SELVA',
                                    'INGENIO', 'PASO ANCHO', 'PANCE', 'CAÑAS GORDAS', 'Meléndez',
                                    'SAN FERNANDO'
                                ].map((zone) => (
                                    <div key={zone} className="flex items-center gap-1">
                                        <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                                        <span className="text-gray-700">{zone}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Horarios de atención</h4>
                        <div className="space-y-2">
                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, index) => (
                                <div key={day} className="flex items-center justify-between py-2">
                                    <span className="text-gray-700">{day}</span>
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {businessInfo.openingHours} - {businessInfo.closingHours}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors font-medium"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contactar por WhatsApp
                        </a>
                        <a
                            href={`tel:${businessInfo.phone}`}
                            className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors font-medium"
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
