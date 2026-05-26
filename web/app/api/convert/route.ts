import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

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
    const { from_currency, amount, exchange_rate, fees } = body;

    if (!from_currency || !amount || !exchange_rate || fees === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const numRate = Number(exchange_rate);
    const numFees = Number(fees);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Call the RPC function we added in migration
    const { data, error: rpcError } = await supabase.rpc('convert_currency', {
      p_user_id: user.id,
      p_from_currency: from_currency,
      p_amount: numAmount,
      p_exchange_rate: numRate,
      p_fees: numFees
    });

    if (rpcError) {
      console.error('RPC convert_currency error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Failed to convert currency' }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: any) {
    console.error('Convert currency error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
