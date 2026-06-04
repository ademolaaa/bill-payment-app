import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, startDate, endDate, transactionsCount, accountName } = await request.json();
    
    // Log the event to console for simulation verification
    console.log(`\n======================================================`);
    console.log(`[EMAIL SIMULATOR] Dispatching Account Statement Email`);
    console.log(`------------------------------------------------------`);
    console.log(`To: ${email}`);
    console.log(`Recipient Name: ${accountName}`);
    console.log(`Statement Period: ${startDate} to ${endDate}`);
    console.log(`Total Transactions Compiled: ${transactionsCount}`);
    console.log(`Status: Email sent successfully (Mock SMTP Server)`);
    console.log(`======================================================\n`);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      message: `A copy of your statement has been sent to ${email}` 
    });
  } catch (error: any) {
    console.error('[EMAIL SIMULATOR] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
