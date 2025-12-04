import { MerchantMenuClient } from '@/components/menu/MerchantMenuClient';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface Businessman {
  id: string;
  user_id?: string;
  business_name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp_number: string;
  whatsapp_api_token?: string;
  is_active: boolean;
  accept_orders: boolean;
  opening_hours?: string;
  closing_hours?: string;
  created_at: string;
  updated_at: string;
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch the first active merchant to display on the home page
  const { data: businessman, error } = await supabase
    .from('businessmans')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single() as { data: Businessman | null; error: any };

  if (error || !businessman) {
    notFound();
  }

  return <MerchantMenuClient businessman={businessman} />;
}
