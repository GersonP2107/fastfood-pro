import { MerchantMenuClient } from '@/components/menu/MerchantMenuClient';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Businessman } from '@/lib/types';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ merchantSlug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Favicon y metadata estáticos de la plataforma (fallback)
const PLATFORM_FAVICON = '/favicon.svg';
const PLATFORM_TITLE = 'FoodFast Pro - Menú Digital';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createClient();

    const { data: businessman } = await supabase
        .from('businessmans')
        .select('business_name, logo_url, favicon_url')
        .eq('slug', params.merchantSlug)
        .single();

    const businessName = businessman?.business_name;
    const logoUrl = businessman?.logo_url;
    // Si el negocio tiene favicon propio se usa, sino el de la plataforma
    const faviconSrc = businessman?.favicon_url ?? PLATFORM_FAVICON;

    return {
        title: businessName ? `${businessName} - Menú Digital` : PLATFORM_TITLE,

        icons: {
            icon: [{ url: faviconSrc, sizes: 'any' }],
            shortcut: faviconSrc,
            apple: [{ url: faviconSrc }],
        },

        // OpenGraph: cuando comparten el link por WhatsApp/redes, sale info del negocio
        openGraph: businessName ? {
            title: `${businessName} - Menú Digital`,
            description: `Explora el menú digital de ${businessName} y realiza tu pedido en línea.`,
            images: logoUrl ? [{ url: logoUrl, width: 512, height: 512, alt: `Logo de ${businessName}` }] : [],
            locale: 'es_CO',
            type: 'website',
        } : undefined,
    };
}

export default async function MerchantPage(props: PageProps) {
    const params = await props.params;
    const supabase = await createClient();

    // Fetch the merchant by slug
    const { data: businessman, error } = await supabase
        .from('businessmans')
        .select('*')
        .eq('slug', params.merchantSlug)
        .eq('is_active', true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: Businessman | null; error: any };

    if (error || !businessman) {
        notFound();
    }

    // Subscription Verification
    // "No permitiendo el uso del menu hasta que ya el pago alla sido renovado"
    const allowedStatuses = ['active', 'trialing'];
    let isSuspended = false;

    if (businessman.subscription_status === 'past_due' || businessman.subscription_status === 'canceled') {
        const trialActive = businessman.trial_ends_at && new Date(businessman.trial_ends_at) > new Date();
        if (!trialActive) {
            isSuspended = true;
        }
    } else if (businessman.subscription_status && !allowedStatuses.includes(businessman.subscription_status)) {
        isSuspended = true;
    }

    if (isSuspended) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-red-600">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Menú No Disponible</h1>
                    <p className="text-gray-500 mb-6">
                        El menú digital para <strong>{businessman.business_name}</strong> no se encuentra disponible en este momento.
                    </p>
                    <p className="text-sm text-gray-400">
                        Si eres el propietario de este negocio, por favor ingresa a tu panel de administración en FoodFast Pro para regularizar el estado de tu pago y reactivar tu menú digital.
                    </p>
                    <div className="mt-6">
                        <a href="https://app.foodfastpro.com/login" className="text-[#fa0050] hover:text-[#d4003e] font-medium text-sm">
                            Ir al Panel de Control &rarr;
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch delivery zones for this businessman
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: deliveryZones } = await (supabase as any)
        .from('delivery_zones')
        .select('*')
        .eq('businessman_id', businessman.id)
        .eq('is_active', true)
        .order('delivery_cost', { ascending: true });

    // Fetch payment methods from the new table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: paymentMethodsData } = await (supabase as any)
        .from('payment_methods')
        .select('*')
        .eq('businessman_id', businessman.id)
        .eq('is_active', true);

    // Map the new table data to the simplified structure expected by the frontend
    if (paymentMethodsData && paymentMethodsData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        businessman.payment_methods = paymentMethodsData.map((pm: any) => ({
            ...pm,
            number: pm.account_number || pm.number
        }));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <MerchantMenuClient businessman={businessman} deliveryZones={deliveryZones as any[] || []} />;
}

// Note: generateStaticParams removed to avoid cookies error in development
// The page will use dynamic rendering instead, which is fine for this use case

