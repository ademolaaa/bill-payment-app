/**
 * NOWPayments API Client
 * 
 * Server-side only. Do NOT import in client components.
 * Provides typed methods for payment creation, status checking,
 * sub-account management, and signature verification.
 */
import crypto from 'crypto';
import { getNowPaymentsApiKey, getNowPaymentsIpnSecret, isNowPaymentsConfigured, isSandboxMode } from './env';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreatePaymentParams {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  ipnCallbackUrl: string;
  orderId: string;
  orderDescription?: string;
}

export interface PaymentResponse {
  payment_id: string | number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  created_at: string;
  expiration_estimate_date?: string;
  is_mock?: boolean;
}

export interface PaymentStatusResponse {
  payment_id: string | number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  actually_paid: number;
  pay_amount: number;
  pay_currency: string;
}

/**
 * NOWPayments payment status values.
 * Only 'finished' and 'confirmed' are terminal successful states.
 */
export const PAYMENT_STATUS = {
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  SENDING: 'sending',
  PARTIALLY_PAID: 'partially_paid',
  FINISHED: 'finished',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/** Returns true if the status means the payment was successfully completed */
export function isSuccessfulStatus(status: string): boolean {
  return status === PAYMENT_STATUS.CONFIRMED || status === PAYMENT_STATUS.FINISHED;
}

/** Returns true if the status is terminal (no further changes expected) */
export function isTerminalStatus(status: string): boolean {
  const terminalStatuses: string[] = [
    PAYMENT_STATUS.CONFIRMED,
    PAYMENT_STATUS.FINISHED,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED,
    PAYMENT_STATUS.EXPIRED,
  ];
  return terminalStatuses.includes(status);
}

// ── API Client ─────────────────────────────────────────────────────────────────

export class NOWPaymentsAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = getNowPaymentsApiKey(false);
    if (!this.apiKey) {
      console.warn('[NOWPayments] API key is not set. Real payments will not work.');
    }
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${NOWPAYMENTS_API_URL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[NOWPayments] API Error:', response.status, errorData);
      throw new Error(`NOWPayments Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  /**
   * Creates a payment request (invoice) via NOWPayments.
   * Returns a payment object with pay_address, pay_amount, payment_id, etc.
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    return this.fetchAPI('/payment', {
      method: 'POST',
      body: JSON.stringify({
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        pay_currency: params.payCurrency,
        ipn_callback_url: params.ipnCallbackUrl,
        order_id: params.orderId,
        order_description: params.orderDescription || '',
      }),
    });
  }

  /**
   * Gets the status of an existing payment by its payment_id.
   */
  async getPaymentStatus(paymentId: string | number): Promise<PaymentStatusResponse> {
    return this.fetchAPI(`/payment/${paymentId}`);
  }

  /**
   * Creates a sub-partner account (unique wallet/ledger) for a user.
   * @param name The name or ID of the sub-account (e.g., the user's ID)
   */
  async createSubAccount(name: string): Promise<{ id: string; name: string }> {
    return this.fetchAPI('/sub-partner/balance', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Retrieves the balance of a specific sub-partner.
   * @param subPartnerId The ID of the sub-partner returned during creation
   */
  async getSubAccountBalance(subPartnerId: string) {
    return this.fetchAPI(`/sub-partner/balance/${subPartnerId}`);
  }
}

// ── Signature Verification ─────────────────────────────────────────────────────

/**
 * Verifies the HMAC-SHA512 signature from a NOWPayments IPN callback.
 * 
 * Steps per NOWPayments docs:
 * 1. Sort JSON keys alphabetically
 * 2. Stringify sorted object
 * 3. HMAC-SHA512 with IPN secret
 * 4. Compare hex digest with x-nowpayments-sig header (timing-safe)
 * 
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(rawBody: string, receivedSignature: string): boolean {
  const ipnSecret = getNowPaymentsIpnSecret(false);
  if (!ipnSecret) {
    console.error('[NOWPayments] IPN secret not configured — cannot verify signature');
    return false;
  }

  try {
    const parsed = JSON.parse(rawBody);
    const sortedKeys = Object.keys(parsed).sort();
    const sortedPayload = JSON.stringify(parsed, sortedKeys);

    const expectedSignature = crypto
      .createHmac('sha512', ipnSecret)
      .update(sortedPayload)
      .digest('hex');

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(receivedSignature, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (e) {
    // JSON parse error, encoding mismatch, or buffer length mismatch
    console.error('[NOWPayments] Signature verification error:', e);
    return false;
  }
}

// ── Order ID Helpers ───────────────────────────────────────────────────────────

/**
 * Generates a unique order ID for a crypto deposit.
 * Format: kyvatron-crypto-{userId}-{timestamp}
 * 
 * IMPORTANT: userId is a UUID containing hyphens. When parsing back,
 * we cannot simply split by '-'. We use the known prefix length and 
 * suffix timestamp to extract the UUID.
 */
export function generateOrderId(userId: string): string {
  const timestamp = Date.now();
  return `kyvatron-crypto-${userId}-${timestamp}`;
}

/**
 * Parses a userId (UUID) from our order_id format.
 * Format: kyvatron-crypto-{UUID}-{timestamp}
 * 
 * Since UUIDs contain hyphens (e.g., "550e8400-e29b-41d4-a716-446655440000"),
 * we strip the known prefix "kyvatron-crypto-" and the trailing "-{timestamp}".
 */
export function parseUserIdFromOrderId(orderId: string): string | null {
  const prefix = 'kyvatron-crypto-';
  if (!orderId || !orderId.startsWith(prefix)) {
    return null;
  }

  const remainder = orderId.slice(prefix.length); // "{UUID}-{timestamp}"
  // The timestamp is the last segment after the final hyphen, and it's numeric
  const lastHyphenIndex = remainder.lastIndexOf('-');
  if (lastHyphenIndex === -1) {
    return null;
  }

  const potentialTimestamp = remainder.slice(lastHyphenIndex + 1);
  if (!/^\d+$/.test(potentialTimestamp)) {
    return null;
  }

  const userId = remainder.slice(0, lastHyphenIndex);
  // Basic UUID format validation (8-4-4-4-12 hex chars)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return null;
  }

  return userId;
}

/**
 * Generates a mock/simulated payment response for development/testing.
 */
export function createMockPayment(amount: number, orderId: string, payCurrency: string): PaymentResponse {
  return {
    payment_id: `mock-pay-${crypto.randomBytes(6).toString('hex')}`,
    payment_status: PAYMENT_STATUS.WAITING,
    pay_address: 'T9yD14Nj9y7xAB4dbGeiX9h8unkKHxuWwb',
    price_amount: amount,
    price_currency: 'usd',
    pay_amount: amount,
    pay_currency: payCurrency,
    order_id: orderId,
    created_at: new Date().toISOString(),
    is_mock: true,
  };
}

// ── Singleton ──────────────────────────────────────────────────────────────────

export const nowPayments = new NOWPaymentsAPI();
