'use server';

import { createClient } from '@/lib/supabase/server';
import { CreateOrderPayload, ApiResponse } from '@/lib/types';

export async function createOrder(payload: CreateOrderPayload): Promise<ApiResponse<{ orderId: string; orderNumber: string }>> {
    const supabase = await createClient();

    try {
        // 0. Validate Plan and Subscription
        const { data: rawBusinessman, error: bizError } = await supabase
            .from('businessmans')
            .select('plan_type, subscription_status')
            .eq('id', payload.businessman_id)
            .single();

        const businessman = rawBusinessman as any;

        if (bizError || !businessman) {
            return { error: 'No se pudo verificar la información del negocio.' };
        }

        // Check Subscription (Global Block)
        const allowedStatuses = ['active', 'trialing'];
        // Strict check: if status exists but not allowed -> Block
        // If status is null (legacy/free?), allow? Assuming paid plans have status.
        if (businessman.subscription_status && !allowedStatuses.includes(businessman.subscription_status)) {
            return { error: 'El servicio está suspendido por falta de pago.' };
        }

        // Check POS Restriction (Specific Block)
        if (payload.source === 'pos' && businessman.plan_type === 'essential') {
            return { error: 'El sistema POS no está disponible en su plan actual (Esencial).' };
        }

        // 1. Create the Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                businessman_id: payload.businessman_id,
                customer_name: payload.client_name,
                customer_phone: payload.client_phone,
                customer_email: payload.client_email,
                delivery_type: payload.delivery_type,
                delivery_address: payload.delivery_address,
                table_number: payload.table_number,
                delivery_notes: payload.delivery_notes,
                payment_method: (function (method) {
                    // Map frontend values (efectivo, otros, nequi, etc) to DB constraint allowed values (cash, transfer, card)
                    const normalized = method.toLowerCase();
                    if (normalized.includes('efectivo')) return 'cash';
                    if (normalized.includes('tarjeta')) return 'card';
                    // Default to transfer for Nequi/Daviplata/Bancolombia/etc as 'transfer' covers 'otros'
                    return 'transfer';
                })(payload.payment_method),
                subtotal: payload.subtotal,
                shipping_cost: payload.shipping_cost,
                discount: payload.discount,
                tip: payload.tip,
                total: payload.total,
                status: 'pending',
                notification_sent: false
            } as any)
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return { error: 'Error al crear la orden principal.' };
        }

        if (!order) {
            return { error: 'No se pudo crear la orden.' };
        }

        // 2. Create Order Items
        const orderItemsToInsert = payload.items.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_description: item.product_description,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal
        }));

        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert as any)
            .select();

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Ideally we would rollback here, but for MVP we log and might have inconsistent state
            // A better approach later is a Database Function (RPC) for transaction
            return { error: 'Error al guardar los productos de la orden.' };
        }

        // 3. Create Order Item Modifiers
        // We need to map the created items back to the input payload to associate modifiers
        // This relies on the order of insertion matching, or we need to match by product_id if unique in list
        // A safer way is to insert items one by one or trust the return order matches input order (usually true in PG)

        let hasModifierErrors = false;

        // Interactive insert for modifiers to ensure correct ID mapping
        // (Optimized approach: we know which item corresponds to which because we can assume index matching for this batch)
        if (orderItems && payload.items.length === orderItems.length) {
            const modifiersToInsert: any[] = [];

            payload.items.forEach((item, index) => {
                const createdItem = orderItems[index]; // Assuming same order

                if (item.modifiers && item.modifiers.length > 0) {
                    item.modifiers.forEach((mod) => {
                        modifiersToInsert.push({
                            order_item_id: createdItem.id,
                            modifier_id: mod.modifier_id,
                            modifier_name: mod.modifier_name,
                            additional_price: mod.additional_price || 0
                        });
                    });
                }
            });

            if (modifiersToInsert.length > 0) {
                const { error: modsError } = await supabase
                    .from('order_item_modifiers')
                    .insert(modifiersToInsert as any);

                if (modsError) {
                    console.error('Error creating modifiers:', modsError);
                    hasModifierErrors = true;
                }
            }
        }

        return {
            data: {
                orderId: order.id,
                orderNumber: order.order_number
            },
            error: hasModifierErrors ? 'Orden creada pero hubo detalles con los modificadores.' : undefined
        };

    } catch (e) {
        console.error('Unexpected error in createOrder:', e);
        return { error: 'Error inesperado del servidor.' };
    }
}
