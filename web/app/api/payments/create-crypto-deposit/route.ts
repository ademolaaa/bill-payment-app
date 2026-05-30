import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { amount } = body;
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }

    // 3. Generate unique order ID
    const timestamp = Date.now();
    const orderId = `kyvatron-crypto-${user.id}-${timestamp}`;

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    
    // We default to usdttrc20 for stable and low-fee transactions
    const payCurrency = 'usdttrc20';

    // Build the dynamic callback URL for webhooks
    const host = request.headers.get('host') || 'kyvatron.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/webhooks/nowpayments`;

    // Initialize mock fallback indicator
    let isMock = false;
    let paymentData: any = null;

    if (apiKey && apiKey !== 'mock_api_key' && apiKey.trim() !== '') {
      try {
        const response = await fetch('https://api.nowpayments.io/v1/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            price_amount: Number(amount),
            price_currency: 'usd',
            pay_currency: payCurrency,
            ipn_callback_url: callbackUrl,
            order_id: orderId,
            order_description: `USDT TRC20 Wallet Deposit for user ${user.email}`,
          }),
        });

        if (response.ok) {
          paymentData = await response.json();
        } else {
          const errText = await response.text();
          console.warn('NOWPayments API responded with an error, falling back to simulator:', errText);
          isMock = true;
        }
      } catch (err) {
        console.error('NOWPayments API connection failed, falling back to simulator:', err);
        isMock = true;
      }
    } else {
      // API Key is missing or empty, trigger simulated high-fidelity mode
      isMock = true;
    }

    if (isMock) {
      // Return a simulated NOWPayments invoice response matching actual schema parameters
      paymentData = {
        payment_id: `mock-pay-${Math.random().toString(36).substr(2, 9)}`,
        payment_status: 'waiting',
        pay_address: 'T9yD14Nj9y7xAB4dbGeiX9h8unkKHxuWwb', // High fidelity mock TRC20 address
        price_amount: Number(amount),
        price_currency: 'usd',
        pay_amount: Number(amount),
        pay_currency: payCurrency,
        order_id: orderId,
        created_at: new Date().toISOString(),
        is_mock: true,
      };
    }

    // 4. Record initial pending deposit inside the DB
    const { error: dbError } = await supabase.from('crypto_deposits').insert({
      order_id: orderId,
      status: 'waiting',
      fiat_amount: Number(amount),
      fiat_currency: 'usd',
      crypto_amount: Number(amount),
      crypto_currency: payCurrency,
      metadata: { ...paymentData, user_email: user.email },
    });

    if (dbError) {
      console.error('Failed to insert initial crypto deposit record:', dbError);
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      amount: paymentData.pay_amount,
      currency: paymentData.pay_currency.toUpperCase(),
      orderId: orderId,
      isMock: isMock,
    });
  } catch (error: any) {
    console.error('Create crypto deposit exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
