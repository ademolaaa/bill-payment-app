import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { flutterwave } from '../../../../lib/flutterwave';

export async function POST(request: Request) {
  const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

  // 1. Validate the webhook signature from Flutterwave
  const receivedHash = request.headers.get('verif-hash');
  if (!receivedHash || receivedHash !== webhookSecret) {
    console.warn('Flutterwave webhook: invalid signature received.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const { event, data } = payload;

    // 2. Only process completed charge events
    if (event !== 'charge.completed' || data.status !== 'successful') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 3. Re-verify with Flutterwave server to confirm payload authenticity
    let verification;
    try {
      verification = await flutterwave.verifyTransaction(String(data.id));
    } catch (err: any) {
      console.error('Flutterwave webhook: failed to verify transaction on provider server:', err);
      return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 502 });
    }

    const verificationData = verification?.data;
    if (
      !verificationData ||
      verificationData.status !== 'successful' ||
      verificationData.tx_ref !== data.tx_ref
    ) {
      console.warn('Flutterwave webhook: verification mismatch for tx_ref', data.tx_ref);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // 4. Validate Currency matches NGN
    const gatewayCurrency = verificationData.currency || 'NGN';
    if (gatewayCurrency !== 'NGN') {
      console.warn(`Flutterwave webhook: unsupported currency ${gatewayCurrency} for reference ${data.tx_ref}`);
      return NextResponse.json({ received: true }, { status: 200 }); // acknowledge but ignore
    }

    const isDeposit = data.tx_ref.startsWith('kyvatron-deposit');
    let userId = null;

    if (isDeposit) {
      const suffix = data.tx_ref.slice('kyvatron-deposit-'.length);
      const lastHyphenIndex = suffix.lastIndexOf('-');
      userId = lastHyphenIndex !== -1 ? suffix.slice(0, lastHyphenIndex) : suffix;
    }

    // Secondary fallback to metadata
    if (!userId && verificationData.meta?.user_id) {
      userId = verificationData.meta.user_id;
    }

    if (!userId) {
      console.warn('Flutterwave webhook: could not resolve user ID for reference', data.tx_ref);
      return NextResponse.json({ error: 'Unable to resolve user mapping' }, { status: 400 });
    }

    const amount = Number(verificationData.amount);
    if (isNaN(amount) || amount <= 0) {
      console.warn('Flutterwave webhook: invalid amount value', verificationData.amount);
      return NextResponse.json({ error: 'Invalid transaction amount' }, { status: 400 });
    }

    const supabase = createClient();

    // 5. Idempotent & Race-Safe wallet crediting via database RPC
    const { error: rpcError } = await supabase.rpc('confirm_deposit', {
      p_user_id: userId,
      p_flw_transaction_id: Number(verificationData.id),
      p_tx_ref: data.tx_ref,
      p_amount: amount,
      p_currency: 'NGN',
      p_metadata: verificationData,
      p_auth_secret: webhookSecret
    });

    if (rpcError) {
      console.error('Flutterwave webhook: RPC confirm_deposit failed:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Database mutation failed' }, { status: 500 });
    }

    console.log(`Webhook successfully processed and credited/synced transaction: ${data.tx_ref}`);
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Flutterwave webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
