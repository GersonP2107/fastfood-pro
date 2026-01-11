import { MerchantMenuClient } from '@/components/menu/MerchantMenuClient';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Businessman } from '@/lib/types';

interface PageProps {
    params: Promise<{ merchantSlug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MerchantPage(props: PageProps) {
    const params = await props.params;
    const supabase = await createClient();

    // Fetch the merchant by slug
    const { data: businessman, error } = await supabase
        .from('businessmans')
        .select('*')
        .eq('slug', params.merchantSlug)
        .eq('is_active', true)
        .single() as { data: Businessman | null; error: any };

    if (error || !businessman) {
        notFound();
    }

    // Fetch delivery zones for this businessman
    // Casting to any to avoid "No overload matches this call" due to missing type definition for delivery_zones in generated types
    const { data: deliveryZones } = await (supabase as any)
        .from('delivery_zones')
        .select('*')
        .eq('businessman_id', businessman.id)
        .eq('is_active', true)
        .order('delivery_cost', { ascending: true });

    // Fetch payment methods from the new table
    const { data: paymentMethodsData } = await (supabase as any)
        .from('payment_methods')
        .select('*')
        .eq('businessman_id', businessman.id)
        .eq('is_active', true);

    // Map the new table data to the simplified structure expected by the frontend
    if (paymentMethodsData && paymentMethodsData.length > 0) {
        businessman.payment_methods = paymentMethodsData.map((pm: any) => ({
            ...pm,
            number: pm.account_number || pm.number // Map account_number to number for frontend compatibility
        }));
    }

    return <MerchantMenuClient businessman={businessman} deliveryZones={deliveryZones as any[] || []} />;
}

// Note: generateStaticParams removed to avoid cookies error in development
// The page will use dynamic rendering instead, which is fine for this use case

