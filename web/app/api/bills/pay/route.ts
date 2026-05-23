import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { flutterwave } from '../../../../lib/flutterwave';

export async function POST(request: Request) {
  const supabase = createClient();
  let txRef = '';
  
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, amount: rawAmount, form } = await request.json();
    const amount = parseFloat(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 });
    }

    // 1. Generate secure transaction reference and description
    txRef = `kyvatron-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const description = `${category.toUpperCase()} Payment`;

    // 2. Map category to Flutterwave bill types
    let flwBillType = 'AIRTIME';
    const customerIdentifier = form.phone || form.meterNumber || form.smartCardNumber || form.studentId || '08012345678';

    if (category === 'data') flwBillType = 'MOBILEDATA';
    else if (category === 'electricity') flwBillType = 'POWER';
    else if (category === 'tv') flwBillType = 'CABLE';
    else if (category === 'internet') flwBillType = 'INTERNET';

    const txMetadata = {
      category,
      form_data: form,
      inline_payment: true,
      customer_identifier: customerIdentifier,
      flw_bill_type: flwBillType
    };

    // 3. Atomically check balance and deduct NGN balance using database RPC (creates pending transaction)
    const { data: newBalance, error: rpcError } = await supabase.rpc('create_pending_bill_payment', {
      p_user_id: user.id,
      p_amount: amount,
      p_category: category,
      p_tx_ref: txRef,
      p_description: description,
      p_metadata: txMetadata
    });

    if (rpcError) {
      console.error('RPC create_pending_bill_payment error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Balance check/deduction failed.' }, { status: 400 });
    }

    // 4. Dispatch the Flutterwave backend bill payment API
    let flwTxId: number | null = null;
    let dispatchSuccess = false;
    let failureReason = '';

    try {
      const response = await flutterwave.createBillPayment({
        country: 'NG',
        customer: customerIdentifier,
        amount: amount,
        recurrence: 'ONCE',
        type: flwBillType,
        reference: txRef,
      });

      if (response && response.status === 'success') {
        flwTxId = response.data?.tx_id || null;
        dispatchSuccess = true;
      } else {
        failureReason = response?.message || 'Provider API response error';
      }
    } catch (flwError: any) {
      failureReason = flwError.message || 'Network exception calling provider';
      console.error('Flutterwave billing API error:', flwError);
    }

    // 5. Check mode: Is sandbox/test mode active?
    const isTestMode = process.env.FLUTTERWAVE_SECRET_KEY?.startsWith('FLWSECK_TEST');

    if (dispatchSuccess) {
      // Transition transaction from pending to successful
      const { error: completeError } = await supabase.rpc('complete_bill_payment', {
        p_tx_ref: txRef,
        p_flw_transaction_id: flwTxId,
        p_metadata: { ...txMetadata, flw_response_tx_id: flwTxId }
      });

      if (completeError) {
        console.error('Failed to complete transaction in DB:', completeError);
      }

      return NextResponse.json({ success: true, txRef, newBalance }, { status: 200 });
    } else if (isTestMode) {
      // In Staging/Sandbox mode, we log the failure warning but mock complete the payment to allow manual user flow testing
      console.warn(`[TEST MODE ONLY] Mock success for failed Flutterwave bill dispatch. Ref: ${txRef}. Reason: ${failureReason}`);
      
      const mockFlwId = Date.now();
      await supabase.rpc('complete_bill_payment', {
        p_tx_ref: txRef,
        p_flw_transaction_id: mockFlwId,
        p_metadata: { ...txMetadata, is_mock: true, mock_reason: failureReason }
      });

      return NextResponse.json({ success: true, txRef, newBalance, warning: 'Simulated test success' }, { status: 200 });
    } else {
      // Production mode: perform atomic compensating refund (reverse pending transaction)
      console.warn(`Deduction reversed for ref ${txRef}. Reason: ${failureReason}`);
      
      const { data: refundedBalance, error: refundError } = await supabase.rpc('reverse_bill_payment', {
        p_tx_ref: txRef,
        p_reason: failureReason
      });

      if (refundError) {
        console.error('Critical: Failed to reverse balance deduction:', refundError);
        return NextResponse.json({ 
          error: 'Bill payment failed and refund failed. Please contact customer support.',
          txRef, 
          actionNeeded: 'Reconcile manual refund' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        error: `Bill payment failed: ${failureReason}. Your wallet balance has been refunded.`,
        refundedBalance 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Pay bills API general error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
