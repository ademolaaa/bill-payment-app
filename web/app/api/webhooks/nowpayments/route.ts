import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  // 1. Validate the HMAC-SHA512 signature from NOWPayments
  const receivedSignature = request.headers.get('x-nowpayments-sig');
  const rawBody = await request.text();

  if (!receivedSignature || !ipnSecret) {
    console.warn('NOWPayments IPN: missing signature or IPN secret.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const expectedSignature = crypto
    .createHmac('sha512', ipnSecret)
    .update(
      // NOWPayments requires the payload to be sorted by key
      JSON.stringify(JSON.parse(rawBody), Object.keys(JSON.parse(rawBody)).sort())
    )
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.warn('NOWPayments IPN: signature mismatch.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const { payment_status, order_id, price_amount, price_currency, actually_paid, pay_currency } = payload;

    // Only process confirmed or finished payments
    if (!['confirmed', 'finished'].includes(payment_status)) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 2. Update the transaction record in Supabase
    const supabase = createClient();
    const { error } = await supabase.from('crypto_deposits').upsert(
      {
        order_id,
        status: payment_status,
        fiat_amount: price_amount,
        fiat_currency: price_currency,
        crypto_amount: actually_paid,
        crypto_currency: pay_currency,
        metadata: payload,
      },
      { onConflict: 'order_id' }
    );

    if (error) {
      console.error('NOWPayments IPN DB upsert error:', error);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('NOWPayments IPN processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
