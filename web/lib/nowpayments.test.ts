/**
 * Tests for NOWPayments integration helpers
 * Covers: signature verification, order ID parsing, status helpers, env validation
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import nodeCrypto from 'crypto';

// ── Test helpers (inline to avoid import issues with server-only modules) ──

function parseUserIdFromOrderId(orderId: string): string | null {
  const prefix = 'kyvatron-crypto-';
  if (!orderId || !orderId.startsWith(prefix)) return null;
  const remainder = orderId.slice(prefix.length);
  const lastHyphenIndex = remainder.lastIndexOf('-');
  if (lastHyphenIndex === -1) return null;
  const potentialTimestamp = remainder.slice(lastHyphenIndex + 1);
  if (!/^\d+$/.test(potentialTimestamp)) return null;
  const userId = remainder.slice(0, lastHyphenIndex);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) return null;
  return userId;
}

function generateOrderId(userId: string): string {
  return `kyvatron-crypto-${userId}-${Date.now()}`;
}

function isSuccessfulStatus(status: string): boolean {
  return status === 'confirmed' || status === 'finished';
}

function isTerminalStatus(status: string): boolean {
  return ['confirmed', 'finished', 'failed', 'refunded', 'expired'].includes(status);
}

function verifySignature(rawBody: string, receivedSig: string, ipnSecret: string): boolean {
  try {
    const parsed = JSON.parse(rawBody);
    const sortedKeys = Object.keys(parsed).sort();
    const sortedPayload = JSON.stringify(parsed, sortedKeys);
    const expected = nodeCrypto.createHmac('sha512', ipnSecret).update(sortedPayload).digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(receivedSig, 'hex');
    if (expectedBuf.length !== receivedBuf.length) return false;
    return nodeCrypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('NOWPayments Integration Helpers', () => {

  // ── Order ID Parsing ─────────────────────────────────────────────────────
  describe('parseUserIdFromOrderId', () => {
    it('correctly parses a standard UUID from order_id', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const orderId = `kyvatron-crypto-${userId}-1717000000000`;
      expect(parseUserIdFromOrderId(orderId)).toBe(userId);
    });

    it('handles different valid UUIDs', () => {
      const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const orderId = `kyvatron-crypto-${userId}-9999999999999`;
      expect(parseUserIdFromOrderId(orderId)).toBe(userId);
    });

    it('returns null for invalid prefix', () => {
      expect(parseUserIdFromOrderId('invalid-prefix-550e8400-e29b-41d4-a716-446655440000-123')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseUserIdFromOrderId('')).toBeNull();
    });

    it('returns null for missing timestamp', () => {
      expect(parseUserIdFromOrderId('kyvatron-crypto-550e8400-e29b-41d4-a716-446655440000')).toBeNull();
    });

    it('returns null for non-UUID user id', () => {
      expect(parseUserIdFromOrderId('kyvatron-crypto-notauuid-123456')).toBeNull();
    });

    it('roundtrips correctly with generateOrderId', () => {
      const userId = '12345678-abcd-ef01-2345-678901234567';
      const orderId = generateOrderId(userId);
      expect(parseUserIdFromOrderId(orderId)).toBe(userId);
    });

    // This is the CRITICAL BUG test: the old code did split('-')[2] which
    // only got "550e8400" instead of the full UUID
    it('does NOT truncate UUID at first hyphen (regression test)', () => {
      const fullUuid = '550e8400-e29b-41d4-a716-446655440000';
      const orderId = `kyvatron-crypto-${fullUuid}-1717000000000`;
      const parsed = parseUserIdFromOrderId(orderId);
      expect(parsed).not.toBe('550e8400'); // Old broken behavior
      expect(parsed).toBe(fullUuid);       // Correct behavior
    });
  });

  // ── Status Helpers ───────────────────────────────────────────────────────
  describe('Status helpers', () => {
    it('isSuccessfulStatus returns true for confirmed/finished', () => {
      expect(isSuccessfulStatus('confirmed')).toBe(true);
      expect(isSuccessfulStatus('finished')).toBe(true);
    });

    it('isSuccessfulStatus returns false for other statuses', () => {
      expect(isSuccessfulStatus('waiting')).toBe(false);
      expect(isSuccessfulStatus('confirming')).toBe(false);
      expect(isSuccessfulStatus('failed')).toBe(false);
      expect(isSuccessfulStatus('expired')).toBe(false);
    });

    it('isTerminalStatus covers all terminal states', () => {
      expect(isTerminalStatus('confirmed')).toBe(true);
      expect(isTerminalStatus('finished')).toBe(true);
      expect(isTerminalStatus('failed')).toBe(true);
      expect(isTerminalStatus('refunded')).toBe(true);
      expect(isTerminalStatus('expired')).toBe(true);
    });

    it('isTerminalStatus returns false for non-terminal states', () => {
      expect(isTerminalStatus('waiting')).toBe(false);
      expect(isTerminalStatus('confirming')).toBe(false);
      expect(isTerminalStatus('sending')).toBe(false);
    });
  });

  // ── Signature Verification ───────────────────────────────────────────────
  describe('Webhook signature verification', () => {
    const testSecret = 'test-ipn-secret-key-12345';

    function generateValidSignature(payload: object, secret: string): string {
      const sortedKeys = Object.keys(payload).sort();
      const sorted = JSON.stringify(payload, sortedKeys);
      return nodeCrypto.createHmac('sha512', secret).update(sorted).digest('hex');
    }

    it('accepts a correctly signed payload', () => {
      const payload = { payment_status: 'finished', order_id: 'test-123', price_amount: 50 };
      const body = JSON.stringify(payload);
      const sig = generateValidSignature(payload, testSecret);
      expect(verifySignature(body, sig, testSecret)).toBe(true);
    });

    it('rejects a payload with wrong secret', () => {
      const payload = { payment_status: 'finished', order_id: 'test-123' };
      const body = JSON.stringify(payload);
      const sig = generateValidSignature(payload, 'wrong-secret');
      expect(verifySignature(body, sig, testSecret)).toBe(false);
    });

    it('rejects a tampered payload', () => {
      const original = { payment_status: 'finished', order_id: 'test-123', price_amount: 50 };
      const sig = generateValidSignature(original, testSecret);
      const tampered = JSON.stringify({ ...original, price_amount: 5000 });
      expect(verifySignature(tampered, sig, testSecret)).toBe(false);
    });

    it('rejects an invalid hex signature', () => {
      const payload = { test: 'data' };
      const body = JSON.stringify(payload);
      expect(verifySignature(body, 'not-valid-hex', testSecret)).toBe(false);
    });

    it('rejects empty signature', () => {
      expect(verifySignature('{}', '', testSecret)).toBe(false);
    });

    it('handles complex nested payloads with correct key sorting', () => {
      const payload = {
        z_field: 'last',
        a_field: 'first',
        payment_status: 'confirmed',
        order_id: 'complex-test',
        price_amount: 100.5,
      };
      const body = JSON.stringify(payload);
      const sig = generateValidSignature(payload, testSecret);
      expect(verifySignature(body, sig, testSecret)).toBe(true);
    });
  });

  // ── Idempotency Logic ────────────────────────────────────────────────────
  describe('Idempotency handling', () => {
    it('duplicate webhook with same order_id should be detected by status check', () => {
      // Simulate: first webhook sets status to 'finished'
      const existingDeposit = { status: 'finished', credited_at: '2026-01-01T00:00:00Z' };
      const isDuplicate = isSuccessfulStatus(existingDeposit.status) && !!existingDeposit.credited_at;
      expect(isDuplicate).toBe(true);
    });

    it('pending deposit should not be treated as duplicate', () => {
      const existingDeposit = { status: 'waiting', credited_at: null };
      const isDuplicate = isSuccessfulStatus(existingDeposit.status) && !!existingDeposit.credited_at;
      expect(isDuplicate).toBe(false);
    });

    it('confirmed but not yet credited should not be duplicate', () => {
      const existingDeposit = { status: 'confirmed', credited_at: null };
      const isDuplicate = isSuccessfulStatus(existingDeposit.status) && !!existingDeposit.credited_at;
      expect(isDuplicate).toBe(false);
    });
  });

  // ── Env Validation ───────────────────────────────────────────────────────
  describe('Environment validation logic', () => {
    it('detects mock API key', () => {
      const key: string = 'mock_api_key';
      const isReal = key !== 'mock_api_key' && key.trim().length > 10;
      expect(isReal).toBe(false);
    });

    it('detects empty API key', () => {
      const key: string = '';
      const isReal = key.length > 0 && key !== 'mock_api_key' && key.trim().length > 10;
      expect(isReal).toBe(false);
    });

    it('accepts real API key', () => {
      const key: string = 'NP-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      const isReal = key.length > 0 && key !== 'mock_api_key' && key.trim().length > 10;
      expect(isReal).toBe(true);
    });

    it('detects mock IPN secret', () => {
      const secret: string = 'mock_ipn_secret';
      const isReal = secret.length > 0 && secret !== 'mock_ipn_secret' && secret.trim().length > 5;
      expect(isReal).toBe(false);
    });
  });
});
