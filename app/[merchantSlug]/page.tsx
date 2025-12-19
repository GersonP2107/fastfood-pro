import { MerchantMenuClient } from '@/components/menu/MerchantMenuClient';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Businessman } from '@/lib/types';

interface PageProps {
    params: Promise<{ merchantSlug: string }>;
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
        .single() as { data: Businessman | null; error: any };

    if (error || !businessman) {
        notFound();
    }

    return <MerchantMenuClient businessman={businessman} />;
}

// Note: generateStaticParams removed to avoid cookies error in development
// The page will use dynamic rendering instead, which is fine for this use case

