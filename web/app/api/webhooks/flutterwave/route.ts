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

    // 3. Re-verify with Flutterwave server (do not trust the webhook payload alone)
    const verification = await flutterwave.verifyTransaction(String(data.id));
    if (
      verification?.data?.status !== 'successful' ||
      verification?.data?.tx_ref !== data.tx_ref
    ) {
      console.warn('Flutterwave webhook: verification mismatch for tx_ref', data.tx_ref);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // 4. Update the transaction record in Supabase
    const supabase = createClient();
    const { error } = await supabase
      .from('transactions')
      .upsert(
        {
          tx_ref: data.tx_ref,
          flw_transaction_id: data.id,
          amount: data.amount,
          currency: data.currency,
          status: 'successful',
          type: 'bill_payment',
          metadata: data,
        },
        { onConflict: 'tx_ref' }
      );

    if (error) {
      console.error('Webhook DB upsert error:', error);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Flutterwave webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
