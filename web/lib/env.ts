/**
 * Centralized environment variable validation for NOWPayments and server-side secrets.
 * 
 * IMPORTANT: This file must ONLY be imported in server-side code (API routes, server components).
 * Never import this in client components — secrets must never reach the browser.
 * 
 * Vercel env updates require a redeploy to take effect.
 */

// ── Required Env Vars ──────────────────────────────────────────────────────────
// NOWPAYMENTS_API_KEY      - Your NOWPayments API key (from dashboard)
// NOWPAYMENTS_IPN_SECRET   - Your IPN webhook secret (from dashboard store settings)
// NEXT_PUBLIC_SUPABASE_URL - Supabase project URL (safe for client)
// NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon key (safe for client)

export interface EnvConfig {
  NOWPAYMENTS_API_KEY: string;
  NOWPAYMENTS_IPN_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
}

/**
 * Returns true if the NOWPayments API key is a real key (not a mock/placeholder).
 */
export function isNowPaymentsConfigured(): boolean {
  const key = process.env.NOWPAYMENTS_API_KEY;
  return !!key && key !== 'mock_api_key' && key.trim().length > 10;
}

/**
 * Returns true if the IPN secret is set and not a mock value.
 */
export function isIpnSecretConfigured(): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  return !!secret && secret !== 'mock_ipn_secret' && secret.trim().length > 5;
}

/**
 * Get the NOWPayments API key. Throws if not configured and throwOnMissing is true.
 */
export function getNowPaymentsApiKey(throwOnMissing = false): string {
  const key = process.env.NOWPAYMENTS_API_KEY || '';
  if (throwOnMissing && !isNowPaymentsConfigured()) {
    throw new Error(
      '[ENV] NOWPAYMENTS_API_KEY is missing or set to a mock value. ' +
      'Set it in Vercel Environment Variables and redeploy.'
    );
  }
  return key;
}

/**
 * Get the IPN secret. Throws if not configured and throwOnMissing is true.
 */
export function getNowPaymentsIpnSecret(throwOnMissing = false): string {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET || '';
  if (throwOnMissing && !isIpnSecretConfigured()) {
    throw new Error(
      '[ENV] NOWPAYMENTS_IPN_SECRET is missing or set to a mock value. ' +
      'Set it in Vercel Environment Variables and redeploy.'
    );
  }
  return secret;
}

/**
 * Returns true if we are running in development/sandbox mode.
 */
export function isSandboxMode(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

/**
 * Validate all required environment variables at startup.
 * Call this in API routes that depend on NOWPayments.
 * Returns an object with validation results (does not throw).
 */
export function validateEnv(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NOWPAYMENTS_API_KEY) {
    missing.push('NOWPAYMENTS_API_KEY');
  } else if (process.env.NOWPAYMENTS_API_KEY === 'mock_api_key') {
    warnings.push('NOWPAYMENTS_API_KEY is set to a mock value — real payments will not work');
  }

  if (!process.env.NOWPAYMENTS_IPN_SECRET) {
    missing.push('NOWPAYMENTS_IPN_SECRET');
  } else if (process.env.NOWPAYMENTS_IPN_SECRET === 'mock_ipn_secret') {
    warnings.push('NOWPAYMENTS_IPN_SECRET is set to a mock value — webhook verification will fail');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
