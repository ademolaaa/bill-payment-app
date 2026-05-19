import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { nowPayments } from '../../../../lib/nowpayments';

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

    // Check if the user already has a sub_partner_id to avoid duplicate creation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nowpayments_sub_partner_id')
      .eq('id', user.id)
      .single();

    if (profile?.nowpayments_sub_partner_id) {
      return NextResponse.json({ message: 'Wallet already exists' }, { status: 200 });
    }

    // Call NOWPayments to create a sub-account
    // Using user.id as the sub-account name for easy mapping
    const subAccount = await nowPayments.createSubAccount(user.id);

    if (subAccount && subAccount.id) {
      // Update Supabase profile with the generated sub_partner_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nowpayments_sub_partner_id: subAccount.id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile with sub_partner_id:', updateError);
        // Do not throw here, as the NOWPayments account was created. 
        // A retry mechanism or background sync could be implemented later.
      }
      
      return NextResponse.json({ success: true, sub_partner_id: subAccount.id }, { status: 200 });
    } else {
      throw new Error('NOWPayments failed to return a valid sub-account ID');
    }
  } catch (error: any) {
    console.error('Wallet setup error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
