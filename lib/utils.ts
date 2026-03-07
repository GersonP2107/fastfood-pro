// ============================================================================
// FoodFast Pro - Utility Functions
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Businessman } from '@/lib/types';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency (Colombian Peso)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +57 XXX XXX XXXX for Colombian numbers
    if (cleaned.startsWith('57') && cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }

    return phone;
}

/**
 * Validate Colombian phone number
 */
export function isValidColombianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Colombian mobile numbers: +57 3XX XXX XXXX (12 digits total)
    return /^57[3][0-9]{9}$/.test(cleaned) || /^3[0-9]{9}$/.test(cleaned);
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get image URL with fallback
 */
export function getImageUrl(url?: string | null, fallback: string = '/images/placeholder.jpg'): string {
    return url || fallback;
}

/**
 * Calculate order total
 */
export function calculateOrderTotal(
    subtotal: number,
    costoEnvio: number = 0,
    descuento: number = 0
): number {
    return subtotal + costoEnvio - descuento;
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pendiente: 'Pendiente',
        confirmado: 'Confirmado',
        preparando: 'Preparando',
        en_camino: 'En Camino',
        entregado: 'Entregado',
        cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
        pendiente: 'bg-yellow-500',
        confirmado: 'bg-blue-500',
        preparando: 'bg-orange-500',
        en_camino: 'bg-purple-500',
        entregado: 'bg-green-500',
        cancelado: 'bg-red-500',
    };
    return colorMap[status] || 'bg-gray-500';
}

/**
 * Generate formatted WhatsApp message for order
 */
export function createWhatsAppMessage(
    orderItems: Array<{
        quantity: number;
        product: { name: string };
        modifiers_selected?: Array<{ name: string }>;
    }>,
    subtotal: number,
    total: number,
    customerData: { name: string; phone: string; address?: string },
    paymentMethod: { type: string; name?: string },
    serviceType: 'takeout' | 'delivery' | 'dine_in',
    businessName: string,
    notes?: string
): string {
    const line = '--------------------------------';

    // Header
    let message = `Hola *${businessName}*, soy *${customerData.name}*!\n`;
    message += `Quiero realizar el siguiente pedido:\n\n`;
    message += `${line}\n`;

    // Items
    orderItems.forEach((item) => {
        message += `*${item.quantity}x ${item.product.name}*\n`;

        // Modifiers
        if (item.modifiers_selected && item.modifiers_selected.length > 0) {
            const mods = item.modifiers_selected.map((m: { name: string }) => m.name).join(', ');
            message += `   + ${mods}\n`;
        }

        // Item Subtotal (Optional, keeps it cleaner to just show total at end, but user might prefer per item)
        // message += `   $${formatCurrency(item.subtotal)}\n`; 
    });

    message += `${line}\n`;

    // Totals
    message += `*Total: ${formatCurrency(total)}*\n\n`;

    // Delivery Info
    if (serviceType === 'delivery') {
        message += `📍 *Para Domicilio*\n`;
        message += `Dirección: ${customerData.address || 'No especificada'}\n`;
    } else if (serviceType === 'dine_in') {
        message += `🍽️ *Para Comer Aquí (Mesa)*\n`;
    } else {
        message += `🛍️ *Para Llevar (Recoger)*\n`;
    }

    // Customer Info
    message += `📱 Teléfono: ${customerData.phone}\n`;

    // Payment Method
    message += `\n💳 *Método de Pago*: ${paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1)}`;
    if (paymentMethod.name && paymentMethod.type !== 'efectivo') {
        message += ` (${paymentMethod.name})`;
    }

    // Notes
    if (notes) {
        message += `\n\n📝 *Notas*: ${notes}`;
    }

    return encodeURIComponent(message);
}

/**
 * Check if the business is currently open based on its schedule
 */
export function checkBusinessStatus(businessman: Pick<Businessman, 'accept_orders' | 'operating_schedule'>): {
    isOpen: boolean;
    message: string;
    nextOpenTime?: string;
} {
    // 1. Master switch check
    if (businessman.accept_orders === false) {
        return {
            isOpen: false,
            message: 'El negocio no está aceptando pedidos en este momento.'
        };
    }

    // 2. Schedule check
    // If no schedule is defined, assume open (or rely on master switch)
    if (!businessman.operating_schedule || businessman.operating_schedule.length === 0) {
        return {
            isOpen: true,
            message: 'Abierto'
        };
    }

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = days[now.getDay()];

    const todaySchedule = businessman.operating_schedule.find(s => s.day === currentDayName);

    // If no schedule for today or marked as inactive (closed all day)
    if (!todaySchedule || !todaySchedule.isActive) {
        return {
            isOpen: false,
            message: 'Cerrado hoy'
        };
    }

    // Parse times
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = todaySchedule.close.split(':').map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    if (currentTime >= openTime && currentTime <= closeTime) {
        return {
            isOpen: true,
            message: `Abierto hasta las ${todaySchedule.close}`
        };
    }

    if (currentTime < openTime) {
        return {
            isOpen: false,
            message: `Cerrado. Abre a las ${todaySchedule.open}`,
            nextOpenTime: todaySchedule.open
        };
    }

    return {
        isOpen: false,
        message: 'Cerrado por hoy'
    };
}
