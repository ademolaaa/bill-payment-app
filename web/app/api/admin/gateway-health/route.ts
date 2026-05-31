import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isNowPaymentsConfigured, isIpnSecretConfigured, validateEnv } from '../../../../lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Environment validation ───────────────────────────────────────────────
    const apiKeyConfigured = isNowPaymentsConfigured();
    const ipnSecretConfigured = isIpnSecretConfigured();
    const envValidation = validateEnv();

    // ── Retrieve stats from crypto_deposits ──────────────────────────────────
    let totalCount = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let lastEventTime: string | null = null;
    let recentDeposits: any[] = [];

    try {
      const { data: deposits, error: dbError } = await supabase
        .from('crypto_deposits')
        .select('order_id, payment_id, status, fiat_amount, crypto_currency, created_at, updated_at, credited_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!dbError && deposits) {
        totalCount = deposits.length;
        successfulCount = deposits.filter(d => ['confirmed', 'finished'].includes(d.status)).length;
        pendingCount = deposits.filter(d => ['waiting', 'confirming', 'sending'].includes(d.status)).length;
        failedCount = deposits.filter(d => ['failed', 'expired', 'refunded'].includes(d.status)).length;
        
        if (deposits.length > 0) {
          lastEventTime = deposits[0].created_at;
        }

        // Return the 10 most recent as event log (without sensitive metadata)
        recentDeposits = deposits.slice(0, 10).map(d => ({
          orderId: d.order_id,
          paymentId: d.payment_id,
          status: d.status,
          amount: d.fiat_amount,
          currency: d.crypto_currency,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          creditedAt: d.credited_at,
        }));
      }
    } catch (dbErr) {
      console.warn('[Admin Gateway] Could not retrieve crypto_deposits stats:', dbErr);
    }

    // ── Build response ───────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      apiKeyConfigured,
      ipnSecretConfigured,
      webhookEndpointHealthy: apiKeyConfigured && ipnSecretConfigured,
      walletProvisioningEnabled: true,
      cryptoDepositsEnabled: true,
      envWarnings: envValidation.warnings,
      stats: {
        total: totalCount,
        successful: successfulCount,
        pending: pendingCount,
        failed: failedCount,
        lastEventTime,
      },
      recentEvents: recentDeposits,
      recentErrors: failedCount > 0
        ? recentDeposits.filter(d => ['failed', 'expired', 'refunded'].includes(d.status))
        : [],
    });
  } catch (error: any) {
    console.error('[Admin Gateway] Health check exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
