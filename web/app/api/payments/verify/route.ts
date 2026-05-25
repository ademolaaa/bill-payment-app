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

    // 1. Double check: user ID verification from tx_ref structure to prevent user-A verifying user-B transactions
    const depositPrefix = 'kyvatron-deposit-';
    if (!tx_ref.startsWith(depositPrefix)) {
      return NextResponse.json({ error: 'Invalid transaction reference format' }, { status: 400 });
    }

    const suffix = tx_ref.slice(depositPrefix.length);
    const lastHyphenIndex = suffix.lastIndexOf('-');
    const txUserId = lastHyphenIndex !== -1 ? suffix.slice(0, lastHyphenIndex) : suffix;

    if (!txUserId || txUserId !== user.id) {
      return NextResponse.json({ error: 'Transaction reference ownership verification failed' }, { status: 403 });
    }

    // 2. Idempotency Check: check if already logged as successful in DB
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('status')
      .eq('tx_ref', tx_ref)
      .maybeSingle();

    if (existingTx?.status === 'successful') {
      return NextResponse.json({ success: true, message: 'Transaction already processed successfully.' });
    }

    // 3. Server-side verification directly with Flutterwave API
    let verificationResponse;
    try {
      verificationResponse = await flutterwave.verifyTransaction(String(transaction_id));
    } catch (err: any) {
      console.error('Flutterwave transaction verification request failed:', err);
      return NextResponse.json({ error: 'Failed to communicate with payment gateway.' }, { status: 502 });
    }

    const transactionData = verificationResponse?.data;

    if (!transactionData) {
      return NextResponse.json({ error: 'Payment gateway returned empty transaction data.' }, { status: 400 });
    }

    // 4. Strict Validation of Gateway details against expected server parameters
    if (transactionData.status !== 'successful') {
      return NextResponse.json({ error: 'Transaction was not successful on payment gateway.' }, { status: 400 });
    }

    if (transactionData.tx_ref !== tx_ref) {
      return NextResponse.json({ error: 'Transaction reference mismatch.' }, { status: 400 });
    }

    const gatewayCurrency = transactionData.currency || 'NGN';
    if (gatewayCurrency !== 'NGN') {
      return NextResponse.json({ error: `Unsupported transaction currency: ${gatewayCurrency}` }, { status: 400 });
    }

    const amount = Number(transactionData.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transaction amount returned by gateway.' }, { status: 400 });
    }

    // 5. Invoke transaction-safe atomic database credit function
    const { data: newBalance, error: rpcError } = await supabase.rpc('confirm_deposit', {
      p_user_id: user.id,
      p_flw_transaction_id: Number(transactionData.id),
      p_tx_ref: tx_ref,
      p_amount: amount,
      p_currency: 'NGN',
      p_metadata: transactionData
    });

    if (rpcError) {
      console.error('RPC confirm_deposit error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Failed to credit wallet balance.' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      newBalance, 
      message: 'Deposit verified and credited successfully.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
