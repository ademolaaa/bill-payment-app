import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { nowPayments, isSuccessfulStatus } from '../../../../lib/nowpayments';
import { isNowPaymentsConfigured } from '../../../../lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // Try to get status from NOWPayments API first
    if (isNowPaymentsConfigured() && !paymentId.startsWith('mock-')) {
      try {
        const statusData = await nowPayments.getPaymentStatus(paymentId);
        return NextResponse.json({
          status: statusData.payment_status,
          actuallyPaid: statusData.actually_paid,
          payAmount: statusData.pay_amount,
        });
      } catch (err) {
        console.warn('[Payment Status] API check failed, falling back to DB:', err);
      }
    }

    // Fallback: check crypto_deposits table
    const { data: deposit } = await supabase
      .from('crypto_deposits')
      .select('status')
      .eq('payment_id', paymentId)
      .maybeSingle();

    return NextResponse.json({
      status: deposit?.status || 'waiting',
    });
  } catch (error: any) {
    console.error('[Payment Status] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
