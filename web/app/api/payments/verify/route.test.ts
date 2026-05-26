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

describe('Payment Verification Route (POST /api/payments/verify)', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup base Supabase mock client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const createMockRequest = (body: any) => {
    return new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  test('1. Unauthorized: Should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  test('2. Missing parameters: Should return 400 if transaction_id or tx_ref is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = createMockRequest({ transaction_id: '123' }); // missing tx_ref
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Missing transaction_id or tx_ref' });
  });

  test('3. Invalid reference format: Should return 400 if tx_ref does not start with deposit prefix', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'invalid-prefix-user-123' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid transaction reference format' });
  });

  test('4. Ownership verification: Should return 403 if user ID in tx_ref does not match authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    // Reference belongs to user-999
    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-999-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: 'Transaction reference ownership verification failed' });
  });

  test('5. Idempotency: Should return 200 with success status if transaction is already marked successful in DB', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    // Mock DB returning a successful transaction
    mockSupabase.maybeSingle.mockResolvedValue({ data: { status: 'successful' }, error: null });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, message: 'Transaction already processed successfully.' });
    expect(flutterwave.verifyTransaction).not.toHaveBeenCalled();
  });

  test('6. Gateway fail: Should return 502 if communication with Flutterwave fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    (flutterwave.verifyTransaction as jest.Mock).mockRejectedValue(new Error('Network error'));

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: 'Failed to communicate with payment gateway.' });
  });

  test('7. Empty gateway data: Should return 400 if verification returns empty transaction data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({ data: null });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Payment gateway returned empty transaction data.' });
  });

  test('8. Unsuccessful gateway status: Should return 400 if gateway status is not successful', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'failed' }
    });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Transaction was not successful on payment gateway.' });
  });

  test('9. Mismatched tx_ref: Should return 400 if gateway reference does not match payload', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: 'different-tx-ref' }
    });

    const req = createMockRequest({ transaction_id: '123', tx_ref: 'kyvatron-deposit-user-123-12345678' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Transaction reference mismatch.' });
  });

  test('10. Unsupported currency: Should return 400 if currency is not NGN', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    
    const txRef = 'kyvatron-deposit-user-123-12345678';
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: txRef, currency: 'USD', amount: 10 }
    });

    const req = createMockRequest({ transaction_id: '123', tx_ref: txRef });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Unsupported transaction currency: USD' });
  });

  test('11. Invalid transaction amount: Should return 400 if amount is 0 or negative', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    
    const txRef = 'kyvatron-deposit-user-123-12345678';
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { status: 'successful', tx_ref: txRef, currency: 'NGN', amount: -50 }
    });

    const req = createMockRequest({ transaction_id: '123', tx_ref: txRef });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid transaction amount returned by gateway.' });
  });

  test('12. Database RPC credit fail: Should return 400 if confirm_deposit rpc fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    
    const txRef = 'kyvatron-deposit-user-123-12345678';
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: { id: 998877, status: 'successful', tx_ref: txRef, currency: 'NGN', amount: 5000 }
    });

    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('RPC Balance Credit Failure') });

    const req = createMockRequest({ transaction_id: '123', tx_ref: txRef });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'RPC Balance Credit Failure' });
  });

  test('13. SUCCESS: Should credit balance and return 200 when everything is valid', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    
    const txRef = 'kyvatron-deposit-user-123-12345678';
    const mockGatewayData = { id: 998877, status: 'successful', tx_ref: txRef, currency: 'NGN', amount: 5000 };
    (flutterwave.verifyTransaction as jest.Mock).mockResolvedValue({
      data: mockGatewayData
    });

    mockSupabase.rpc.mockResolvedValue({ data: 5200.00, error: null });

    const req = createMockRequest({ transaction_id: '123', tx_ref: txRef });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      success: true,
      newBalance: 5200.00,
      message: 'Deposit verified and credited successfully.'
    });

    // Ensure database was called with the correct parameters
    expect(mockSupabase.rpc).toHaveBeenCalledWith('confirm_deposit', {
      p_user_id: 'user-123',
      p_flw_transaction_id: 998877,
      p_tx_ref: txRef,
      p_amount: 5000,
      p_currency: 'NGN',
      p_metadata: mockGatewayData
    });
  });
});
