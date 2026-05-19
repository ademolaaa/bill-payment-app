import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { flutterwave } from '../../../../lib/flutterwave';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transaction_id, tx_ref } = body;

    if (!transaction_id || !tx_ref) {
      return NextResponse.json({ error: 'Missing transaction_id or tx_ref' }, { status: 400 });
    }

    // Server-side verification with Flutterwave
    const result = await flutterwave.verifyTransaction(String(transaction_id));

    if (
      result?.data?.status === 'successful' &&
      result?.data?.tx_ref === tx_ref
    ) {
      // Log the transaction to Supabase for record-keeping
      await supabase.from('transactions').insert({
        user_id: user.id,
        flw_transaction_id: transaction_id,
        tx_ref,
        amount: result.data.amount,
        currency: result.data.currency,
        status: 'successful',
        type: 'bill_payment',
        metadata: result.data,
      });

      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: 'Transaction verification failed or status is not successful.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
