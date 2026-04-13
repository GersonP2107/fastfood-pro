'use server';

// ============================================================================
// Wompi Integration - Server Actions (Digital Menu)
// ============================================================================
// These actions run server-side to keep secrets safe.
// They are called by the public-facing digital menu components.

import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * Generate a unique payment reference for Wompi transactions.
 * Format: FF-{businessmanId_short}-{timestamp}-{random}
 */
function generatePaymentReference(businessmanId: string): string {
    const shortId = businessmanId.slice(0, 8);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `FF-${shortId}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get the Wompi public key for a given businessman.
 * This is safe to expose to the client since public keys are designed
 * to be embedded in frontend code.
 */
export async function getWompiPublicKey(businessmanId: string): Promise<{
    publicKey: string | null;
    environment: 'sandbox' | 'production' | null;
    error?: string;
}> {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('wompi_credentials')
        .select('public_key, environment, is_active')
        .eq('businessman_id', businessmanId)
        .single();

    if (error || !data) {
        return { publicKey: null, environment: null, error: 'Credenciales no encontradas' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds = data as any;

    if (!creds.is_active) {
        return { publicKey: null, environment: null, error: 'Credenciales inactivas' };
    }

    return {
        publicKey: creds.public_key,
        environment: creds.environment as 'sandbox' | 'production',
    };
}

/**
 * Prepare a Wompi payment session.
 * - Generates a unique reference
 * - Computes the SHA256 integrity signature server-side
 * - Returns everything the frontend needs to open the widget
 * 
 * NEVER returns the integrity_secret itself.
 */
export async function prepareWompiPayment(
    businessmanId: string,
    amountInCents: number,
    orderId: string,
    currency: string = 'COP'
): Promise<{
    success: boolean;
    data?: {
        publicKey: string;
        reference: string;
        amountInCents: number;
        currency: string;
        signature: string;
        environment: 'sandbox' | 'production';
    };
    error?: string;
}> {
    if (amountInCents <= 0) {
        return { success: false, error: 'El monto debe ser mayor a 0' };
    }

    const supabase = await createClient();

    // Fetch the business's Wompi credentials
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: credentials, error } = await (supabase as any)
        .from('wompi_credentials')
        .select('public_key, integrity_secret, environment, is_active')
        .eq('businessman_id', businessmanId)
        .single();

    if (error || !credentials) {
        return { success: false, error: 'Credenciales de Wompi no encontradas' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds = credentials as any;

    if (!creds.is_active) {
        return { success: false, error: 'Las credenciales de Wompi están inactivas' };
    }

    // Generate unique reference
    const reference = generatePaymentReference(businessmanId);

    // Save reference to the order immediately so Webhooks can find it
    // even if the user closes the window before completing checkout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('orders')
        .update({ wompi_reference: reference })
        .eq('id', orderId);

    if (updateError) {
        console.error('Failed to save Wompi reference to order:', updateError);
        return { success: false, error: 'Error al inicializar la transacción' };
    }

    // Generate integrity signature:
    // SHA256(reference + amountInCents + currency + integritySecret)
    const signatureInput = `${reference}${amountInCents}${currency}${creds.integrity_secret}`;
    const signature = crypto
        .createHash('sha256')
        .update(signatureInput)
        .digest('hex');

    return {
        success: true,
        data: {
            publicKey: creds.public_key,
            reference,
            amountInCents,
            currency,
            signature,
            environment: creds.environment as 'sandbox' | 'production',
        },
    };
}

/**
 * Save the Wompi transaction result to the order.
 * Called after the Wompi widget returns a transaction result.
 */
export async function saveWompiTransaction(
    orderId: string,
    transactionId: string,
    reference: string,
    status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Map Wompi status to our payment_status
    const statusMap: Record<string, string> = {
        APPROVED: 'approved',
        DECLINED: 'declined',
        VOIDED: 'voided',
        ERROR: 'error',
        PENDING: 'pending',
    };
    
    const paymentStatus = statusMap[status] || 'pending';
    
    // Automatically cancel the whole order if payment failed/was declined permanently
    const shouldCancelOrder = ['declined', 'voided', 'error'].includes(paymentStatus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('orders')
        .update({
            wompi_transaction_id: transactionId,
            wompi_reference: reference,
            payment_status: paymentStatus,
            ...(shouldCancelOrder ? { status: 'cancelado' } : {}), // Update global status if failed
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) {
        console.error('Error saving Wompi transaction:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
