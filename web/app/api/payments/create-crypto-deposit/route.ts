import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import {
  nowPayments,
  generateOrderId,
  createMockPayment,
  PAYMENT_STATUS,
  type PaymentResponse,
} from '../../../../lib/nowpayments';
import { isNowPaymentsConfigured } from '../../../../lib/env';

export async function POST(request: Request) {
  try {
    // ── 1. Authenticate user ─────────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse and validate request body ───────────────────────────────────
    const body = await request.json();
    const { amount } = body;
    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }

    if (numericAmount < 5) {
      return NextResponse.json({ error: 'Minimum deposit is 5.00 USDT' }, { status: 400 });
    }

    // ── 3. Generate unique order ID ──────────────────────────────────────────
    const orderId = generateOrderId(user.id);
    const payCurrency = 'usdttrc20';

    // Build the dynamic callback URL
    const host = request.headers.get('host') || 'kyvatron.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/webhooks/nowpayments`;

    // ── 4. Create payment (real or mock) ─────────────────────────────────────
    let paymentData: PaymentResponse;
    let isMock = false;

    if (isNowPaymentsConfigured()) {
      try {
        paymentData = await nowPayments.createPayment({
          priceAmount: numericAmount,
          priceCurrency: 'usd',
          payCurrency,
          ipnCallbackUrl: callbackUrl,
          orderId,
          orderDescription: `USDT TRC20 Wallet Deposit for user ${user.email}`,
        });
        console.log(`[Crypto Deposit] Real payment created: payment_id=${paymentData.payment_id} order=${orderId}`);
      } catch (err) {
        console.warn('[Crypto Deposit] NOWPayments API failed, falling back to mock:', err);
        paymentData = createMockPayment(numericAmount, orderId, payCurrency);
        isMock = true;
      }
    } else {
      console.log('[Crypto Deposit] NOWPayments not configured, using mock payment.');
      paymentData = createMockPayment(numericAmount, orderId, payCurrency);
      isMock = true;
    }

    // ── 5. Store initial deposit record in DB ────────────────────────────────
    const { error: dbError } = await supabase.from('crypto_deposits').insert({
      user_id: user.id,
      order_id: orderId,
      payment_id: paymentData.payment_id?.toString() || null,
      status: PAYMENT_STATUS.WAITING,
      fiat_amount: numericAmount,
      fiat_currency: 'usd',
      crypto_amount: paymentData.pay_amount || numericAmount,
      crypto_currency: payCurrency,
      pay_address: paymentData.pay_address || null,
      metadata: {
        ...paymentData,
        user_email: user.email,
        is_mock: isMock,
      },
    });

    if (dbError) {
      console.error('[Crypto Deposit] DB insert failed:', dbError);
      // Don't fail the request — the payment was already created upstream
    }

    // ── 6. Return payment details to frontend ────────────────────────────────
    return NextResponse.json({
      success: true,
      paymentId: paymentData.payment_id?.toString() || null,
      paymentStatus: paymentData.payment_status || PAYMENT_STATUS.WAITING,
      payAddress: paymentData.pay_address || null,
      amount: paymentData.pay_amount || numericAmount,
      currency: (paymentData.pay_currency || payCurrency).toUpperCase(),
      orderId,
      expirationDate: paymentData.expiration_estimate_date || null,
      isMock,
    });
  } catch (error: any) {
    console.error('[Crypto Deposit] Unhandled exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
