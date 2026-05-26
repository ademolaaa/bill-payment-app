import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: investments, error: dbError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('invested_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching investments:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ investments }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch investments error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { currency, amount, duration_months, roi_percent } = body;

    if (!currency || !amount || !duration_months || !roi_percent) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const numDuration = Number(duration_months);
    const numRoi = Number(roi_percent);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Call the RPC function we added in migration
    const { data: investmentId, error: rpcError } = await supabase.rpc('create_investment', {
      p_user_id: user.id,
      p_currency: currency,
      p_amount: numAmount,
      p_duration_months: numDuration,
      p_roi_percent: numRoi
    });

    if (rpcError) {
      console.error('RPC create_investment error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Failed to create investment' }, { status: 400 });
    }

    return NextResponse.json({ success: true, investmentId }, { status: 200 });
  } catch (error: any) {
    console.error('Create investment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
