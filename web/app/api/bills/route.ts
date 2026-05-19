import { NextResponse } from 'next/server';
import { flutterwave } from '../../../lib/flutterwave';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'categories') {
      const categories = await flutterwave.getBillCategories();
      return NextResponse.json(categories);
    }

    if (type === 'validate') {
      const itemCode = searchParams.get('itemCode');
      const code = searchParams.get('code');
      const customer = searchParams.get('customer');

      if (!itemCode || !code || !customer) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const validation = await flutterwave.validateBillService(itemCode, code, customer);
      return NextResponse.json(validation);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Bills API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
