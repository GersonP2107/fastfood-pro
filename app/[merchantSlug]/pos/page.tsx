/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { POSMenuClient } from '@/components/menu/POSMenuClient';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        merchantSlug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { merchantSlug } = await params;
    return {
        title: `POS - ${merchantSlug} | FoodFast Pro`,
        description: 'Punto de venta para meseros',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function POSPage({ params }: PageProps) {
    const { merchantSlug } = await params;
    const supabase = await createClient();

    // 1. Fetch Businessman (Critical) - Decoupled from relationships
    const { data: businessmanData, error: businessmanError } = await supabase
        .from('businessmans' as any)
        .select('*')
        .eq('slug', merchantSlug)
        .single();

    if (businessmanError || !businessmanData) {
        console.error('Error fetching businessman:', businessmanError);
        notFound();
    }

    const businessman = businessmanData as any;

    // Plan & Subscription Validation
    // 1. Limit access to POS for 'essential' plan
    if (businessman.plan_type === 'essential') {
        // Redirect to billing or show upgrade message
        // Since POS is for staff, they check this.
        console.log(`[POS Restriction] Blocking access for plan: ${businessman.plan_type}`);
        // If user is not logged in (public access to POS link), dashboard redirect might be confusing but requested.
        redirect('/dashboard/billing?upgrade=true&feature=pos');
    }

    // 2. Check Subscription Status
    // "No permitiendo el uso del menu hasta que ya el pago alla sido renovado"
    const allowedStatuses = ['active', 'trialing'];
    if (businessman.subscription_status && !allowedStatuses.includes(businessman.subscription_status)) {
        console.log(`[POS Restriction] Blocking access for subscription status: ${businessman.subscription_status}`);
        redirect('/dashboard/billing?renew=true');
    }

    // 2. Fetch Zones manually
    const { data: zonesData } = await supabase
        .from('restaurant_zones' as any)
        .select('*')
        .eq('businessman_id', businessman.id)
        .eq('is_active', true); // Temporarily commented out for debugging

    // Debug: Check legacy 'zones' table
    const { data: legacyZones } = await supabase
        .from('zones' as any)
        .select('*')
        .eq('businessman_id', businessman.id);
    console.log(`[POS Debug] Legacy 'zones' table content:`, legacyZones);

    const zones = legacyZones && legacyZones.length > 0 ? legacyZones : (zonesData || []);

    // 3. Fetch Tables manually
    let tables: any[] = [];
    if (zones.length > 0) {
        const zoneIds = zones.map((z: any) => z.id);

        // Try fetching from legacy 'tables' first if we are using legacy zones
        let tablesData, tablesError;

        if (legacyZones && legacyZones.length > 0) {
            const result = await supabase
                .from('tables' as any)
                .select('*')
                .in('zone_id', zoneIds)
                .eq('is_active', true);
            tablesData = result.data;
            tablesError = result.error;
            console.log(`[POS Debug] Legacy 'tables' fetch result:`, tablesData, tablesError);
        }

        if (!tablesData || tablesData.length === 0) {
            const result = await supabase
                .from('restaurant_tables' as any)
                .select('*')
                .in('zone_id', zoneIds)
                .eq('is_active', true);
            tablesData = result.data;
            tablesError = result.error;
        }

        tables = tablesData || [];
    }

    // Attach tables to zones manually to reconstruct structure
    const zonesWithTables = zones.map((zone: any) => ({
        ...zone,
        tables: tables.filter((t: any) => t.zone_id === zone.id)
    }));

    // Attach reconstructed zones to businessman
    businessman.zones = zonesWithTables;

    // 4. Fetch Categories, Products, and Delivery Zones in Parallel
    const [
        { data: categories },
        { data: products },
        { data: deliveryZones }
    ] = await Promise.all([
        supabase
            .from('categories')
            .select('*')
            .eq('businessman_id', businessman.id)
            .eq('is_active', true)
            .order('order', { ascending: true }),
        
        supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name),
                product_modifiers(
                    id,
                    is_required,
                    modifier:modifiers(*)
                )
            `)
            .eq('businessman_id', businessman.id)
            .eq('is_available', true)
            .is('deleted_at', null)
            .order('order', { ascending: true }),
            
        supabase
            .from('delivery_zones' as any)
            .select('*')
            .eq('businessman_id', businessman.id)
            .eq('is_active', true)
    ]);

    return (
        <POSMenuClient
            businessman={businessman}
            categories={(categories as any) || []}
            products={(products as any) || []}
            deliveryZones={(deliveryZones as any) || []}
        />
    );
}
