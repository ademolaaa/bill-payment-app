import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import {
  verifyWebhookSignature,
  parseUserIdFromOrderId,
  isSuccessfulStatus,
  isTerminalStatus,
  PAYMENT_STATUS,
} from '../../../../lib/nowpayments';
import { isIpnSecretConfigured, isSandboxMode } from '../../../../lib/env';

export async function POST(request: Request) {
  // ── 0. Pre-flight: IPN secret must be configured ─────────────────────────
  if (!isIpnSecretConfigured()) {
    console.error('[NOWPayments IPN] NOWPAYMENTS_IPN_SECRET is not configured.');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // ── 1. Read raw body and signature header ────────────────────────────────
  const receivedSignature = request.headers.get('x-nowpayments-sig');
  if (!receivedSignature) {
    console.warn('[NOWPayments IPN] Missing x-nowpayments-sig header.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await request.text();

  // ── 2. Verify HMAC-SHA512 signature ──────────────────────────────────────
  let isSignatureValid = verifyWebhookSignature(rawBody, receivedSignature);

  // Sandbox bypass: ONLY in development/test mode, allow test signatures
  if (!isSignatureValid && isSandboxMode()) {
    const testSignatures = ['sandbox-test-signature', 'mock-sig'];
    if (testSignatures.includes(receivedSignature)) {
      console.log('[NOWPayments IPN] Sandbox signature bypass active (dev/test only).');
      isSignatureValid = true;
    }
  }

  if (!isSignatureValid) {
    console.warn('[NOWPayments IPN] Signature verification failed.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── 3. Parse and validate payload ────────────────────────────────────────
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[NOWPayments IPN] Failed to parse request body as JSON.');
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const {
    payment_id,
    payment_status,
    order_id,
    price_amount,
    price_currency,
    actually_paid,
    pay_currency,
    pay_address,
  } = payload;

  if (!order_id || !payment_status) {
    console.error('[NOWPayments IPN] Missing required fields: order_id or payment_status.');
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  // ── 4. Parse userId from order_id ────────────────────────────────────────
  // CRITICAL FIX: UUIDs contain hyphens. Previous code used split('-')[2]
  // which only captured the first UUID segment. Now using a robust parser.
  const userId = parseUserIdFromOrderId(order_id);

  if (!userId) {
    console.error('[NOWPayments IPN] Could not parse userId from order_id:', order_id);
    return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
  }

  console.log(`[NOWPayments IPN] Received: order=${order_id} status=${payment_status} payment_id=${payment_id} user=${userId}`);

  const supabase = createClient();

  try {
    // ── 5. Idempotency check ─────────────────────────────────────────────────
    const { data: existingDeposit } = await supabase
      .from('crypto_deposits')
      .select('status, credited_at')
      .eq('order_id', order_id)
      .maybeSingle();

    // If already credited (finished/confirmed with credited_at), return early
    if (existingDeposit && isSuccessfulStatus(existingDeposit.status) && existingDeposit.credited_at) {
      console.log(`[NOWPayments IPN] Duplicate webhook for order_id ${order_id}. Already credited at ${existingDeposit.credited_at}.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    // ── 6. Non-terminal status: just update deposit record ───────────────────
    if (!isSuccessfulStatus(payment_status)) {
      const { error: upsertError } = await supabase.from('crypto_deposits').upsert(
        {
          order_id,
          user_id: userId,
          payment_id: payment_id?.toString() || null,
          status: payment_status,
          fiat_amount: Number(price_amount) || 0,
          fiat_currency: price_currency || 'usd',
          crypto_amount: Number(actually_paid || price_amount) || 0,
          crypto_currency: pay_currency || 'usdttrc20',
          pay_address: pay_address || null,
          metadata: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'order_id' }
      );

      if (upsertError) {
        console.error('[NOWPayments IPN] Upsert error for non-terminal status:', upsertError);
      }

      console.log(`[NOWPayments IPN] Updated deposit status to '${payment_status}' for order ${order_id}.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── 7. Successful payment: update deposit record ─────────────────────────
    const { error: upsertError } = await supabase.from('crypto_deposits').upsert(
      {
        order_id,
        user_id: userId,
        payment_id: payment_id?.toString() || null,
        status: payment_status,
        fiat_amount: Number(price_amount) || 0,
        fiat_currency: price_currency || 'usd',
        crypto_amount: Number(actually_paid || price_amount) || 0,
        crypto_currency: pay_currency || 'usdttrc20',
        pay_address: pay_address || null,
        metadata: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'order_id' }
    );

    if (upsertError) {
      console.error('[NOWPayments IPN] Upsert error for successful status:', upsertError);
    }

    // ── 8. Atomic balance credit via RPC ─────────────────────────────────────
    // Uses the credit_usdt_deposit function which:
    // - Locks the deposit row (prevents double-credit)
    // - Locks the profile row (prevents race conditions)
    // - Only credits if not already credited
    const creditAmount = Number(price_amount) || 0;
    if (creditAmount <= 0) {
      console.error('[NOWPayments IPN] Invalid credit amount:', creditAmount);
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const { data: newBalance, error: rpcError } = await supabase.rpc('credit_usdt_deposit', {
      p_user_id: userId,
      p_order_id: order_id,
      p_amount: creditAmount,
      p_payment_id: payment_id?.toString() || null,
    });

    if (rpcError) {
      console.error('[NOWPayments IPN] RPC credit_usdt_deposit failed:', rpcError);
      
      // Fallback: manual update if RPC doesn't exist yet (migration not applied)
      console.log('[NOWPayments IPN] Attempting manual balance update fallback...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance_usdt')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('[NOWPayments IPN] User profile not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentUsdt = Number(profile.balance_usdt) || 0;
      const updatedUsdt = currentUsdt + creditAmount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance_usdt: updatedUsdt, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('[NOWPayments IPN] Manual balance update failed:', updateError);
        return NextResponse.json({ error: 'Balance update failed' }, { status: 500 });
      }

      // Mark as credited in deposits table
      await supabase.from('crypto_deposits').update({
        credited_at: new Date().toISOString(),
        status: 'finished',
      }).eq('order_id', order_id);
    }

    // ── 9. Create transaction log entry ──────────────────────────────────────
    const txRef = `kyvatron-crypto-deposit-${order_id}-${Date.now()}`;
    const { error: txInsertError } = await supabase.from('transactions').insert({
      user_id: userId,
      tx_ref: txRef,
      type: 'deposit',
      amount: creditAmount,
      currency: 'USDT',
      status: 'successful',
      description: `USDT Deposit via NOWPayments (${pay_currency?.toUpperCase() || 'USDTTRC20'})`,
      metadata: {
        payment_id,
        order_id,
        actually_paid: actually_paid || price_amount,
        pay_currency,
        source: 'nowpayments_ipn',
      },
    });

    if (txInsertError) {
      // tx_ref unique constraint may fire if webhook retries — this is safe to ignore
      console.warn('[NOWPayments IPN] Transaction insert warning:', txInsertError.message);
    }

    console.log(`[NOWPayments IPN] ✅ Successfully credited +${creditAmount} USDT to user ${userId}. Order: ${order_id}`);
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[NOWPayments IPN] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
