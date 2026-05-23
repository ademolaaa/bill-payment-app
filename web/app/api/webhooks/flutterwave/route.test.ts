import { POST } from './route';
import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { flutterwave } from '../../../../lib/flutterwave';

// Mock Dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, options) => ({
      status: options?.status || 200,
      json: async () => body,
    })),
  },
}));

jest.mock('../../../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('../../../../lib/flutterwave', () => ({
  flutterwave: {
    verifyTransaction: jest.fn(),
  },
}));

describe('Flutterwave Webhook Route (POST /api/webhooks/flutterwave)', () => {
  let mockSupabase: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      FLUTTERWAVE_WEBHOOK_SECRET: 'test-webhook-secret-123',
    };

    // Setup base Supabase mock client
    mockSupabase = {
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    const headerObj = new Headers(headers);
    return new Request('http://localhost/api/webhooks/flutterwave', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headerObj,
    });
  };

  test('1. Signature Validation: Should return 403 if signature header is missing', async () => {
    const req = createMockRequest({ event: 'charge.completed' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: 'Forbidden' });
  });

  test('2. Signature Validation: Should return 403 if signature header is incorrect', async () => {
    const req = createMockRequest({ event: 'charge.completed' }, { 'verif-hash': 'wrong-secret' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: 'Forbidden' });
  });

  test('3. Event Filtering: Should return 200 received:true for non-successful or non-completed charge events', async () => {
    const req = createMockRequest(
      { event: 'charge.completed', data: { status: 'failed' } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(flutterwave.verifyTransaction).not.toHaveBeenCalled();
  });

  test('4. Re-verification Gateway Fail: Should return 502 if re-verification request to provider fails', async () => {
    (flutterwave.verifyTransaction as jest.Mock).mockRejectedValue(new Error('Gateway down'));

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: 'kyvatron-deposit-user-123' } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: 'Failed to verify transaction' });
  });

  test('5. Re-verification Integrity Mismatch: Should return 400 if verification status is not successful', async () => {
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'failed', tx_ref: 'kyvatron-deposit-user-123' }
    });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: 'kyvatron-deposit-user-123' } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Verification failed' });
  });

  test('6. Currency compliance: Should return 200 received:true if currency is unsupported (USD)', async () => {
    const txRef = 'kyvatron-deposit-user-123';
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: txRef, currency: 'USD', amount: 50 }
    });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true }); // acknowledged but ignored
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  test('7. Missing User Mapping: Should return 400 if user ID cannot be resolved from tx_ref or metadata', async () => {
    const txRef = 'kyvatron-deposit'; // short invalid parts
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: txRef, currency: 'NGN', amount: 100 }
    });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Unable to resolve user mapping' });
  });

  test('8. Resolve user from metadata metadata: Should succeed if user ID not in tx_ref parts but is in metadata.user_id', async () => {
    const txRef = 'kyvatron-deposit';
    const mockVerificationData = {
      id: 12345,
      status: 'successful',
      tx_ref: txRef,
      currency: 'NGN',
      amount: 100,
      meta: { user_id: 'user-777' }
    };
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: mockVerificationData
    });

    mockSupabase.rpc.mockResolvedValue({ data: 1100, error: null });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockSupabase.rpc).toHaveBeenCalledWith('confirm_deposit', expect.objectContaining({
      p_user_id: 'user-777'
    }));
  });

  test('9. Invalid Amount: Should return 400 if transaction amount is zero or negative', async () => {
    const txRef = 'kyvatron-deposit-user-123-123456';
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: txRef, currency: 'NGN', amount: -250 }
    });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid transaction amount' });
  });

  test('10. Database Credit Fail: Should return 500 if database mutation via RPC fails', async () => {
    const txRef = 'kyvatron-deposit-user-123-123456';
    const mockVerificationData = { id: 12345, status: 'successful', tx_ref: txRef, currency: 'NGN', amount: 5000 };
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: mockVerificationData
    });

    mockSupabase.rpc.mockResolvedValue({ error: new Error('RPC Mutation Failure') });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'RPC Mutation Failure' });
  });

  test('11. SUCCESS: Should credit balance and return 200 when everything is valid', async () => {
    const txRef = 'kyvatron-deposit-user-123-123456';
    const mockVerificationData = { id: 12345, status: 'successful', tx_ref: txRef, currency: 'NGN', amount: 5000 };
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: mockVerificationData
    });

    mockSupabase.rpc.mockResolvedValue({ error: null });

    const req = createMockRequest(
      { event: 'charge.completed', data: { id: 12345, status: 'successful', tx_ref: txRef } },
      { 'verif-hash': 'test-webhook-secret-123' }
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('confirm_deposit', {
      p_user_id: 'user-123',
      p_flw_transaction_id: BigInt(12345),
      p_tx_ref: txRef,
      p_amount: 5000,
      p_currency: 'NGN',
      p_metadata: mockVerificationData,
      p_auth_secret: 'test-webhook-secret-123'
    });
  });
});
