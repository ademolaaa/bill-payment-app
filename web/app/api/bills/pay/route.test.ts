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
    createBillPayment: jest.fn(),
  },
}));

describe('Bill Payment Route (POST /api/bills/pay)', () => {
  let mockSupabase: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default production environment (non-test key)
    process.env = {
      ...originalEnv,
      FLUTTERWAVE_SECRET_KEY: 'FLWSECK-PROD-SECRET-KEY-123',
    };

    // Setup base Supabase mock client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createMockRequest = (body: any) => {
    return new Request('http://localhost/api/bills/pay', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  test('1. Unauthorized: Should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

    const req = createMockRequest({ category: 'airtime', amount: '1000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  test('2. Invalid parameters: Should return 400 if amount is not a valid positive number', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = createMockRequest({ category: 'airtime', amount: '-500', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid payment amount.' });
  });

  test('3. Balance Check Fail: Should return 400 if pending payment creation database RPC fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    // Mock RPC returning insufficient funds error
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Insufficient wallet balance.') });

    const req = createMockRequest({ category: 'airtime', amount: '5000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Insufficient wallet balance.' });
    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_pending_bill_payment', expect.any(Object));
    expect(flutterwave.createBillPayment).not.toHaveBeenCalled();
  });

  test('4. SUCCESS Path (Production): Should deduct balance, call gateway, transition transaction to complete, and return 200', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    // 1. Mock pending deduction success (returns new balance)
    mockSupabase.rpc.mockImplementation((fnName: string) => {
      if (fnName === 'create_pending_bill_payment') {
        return Promise.resolve({ data: 12000.00, error: null });
      }
      if (fnName === 'complete_bill_payment') {
        return Promise.resolve({ data: null, error: null });
      }
      return Promise.resolve({ error: new Error('Unexpected RPC call') });
    });

    // 2. Mock successful Flutterwave call
    (flutterwave.createBillPayment as jest.Mock).mockResolvedValue({
      status: 'success',
      message: 'Bill payment successful',
      data: { tx_id: 998811 }
    });

    const req = createMockRequest({ category: 'airtime', amount: '2000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.newBalance).toBe(12000.00);
    expect(body.txRef).toMatch(/^kyvatron-airtime-\d+-/);

    // Verify Flutterwave API payload
    expect(flutterwave.createBillPayment).toHaveBeenCalledWith({
      country: 'NG',
      customer: '08012345678',
      amount: 2000,
      recurrence: 'ONCE',
      type: 'AIRTIME',
      reference: expect.stringMatching(/^kyvatron-airtime-\d+-/),
    });

    // Verify DB call to complete
    expect(mockSupabase.rpc).toHaveBeenCalledWith('complete_bill_payment', {
      p_tx_ref: expect.stringMatching(/^kyvatron-airtime-\d+-/),
      p_flw_transaction_id: 998811,
      p_metadata: expect.objectContaining({
        flw_response_tx_id: 998811,
        flw_bill_type: 'AIRTIME'
      })
    });
  });

  test('5. FAIL Path (Production Compensating Refund): Should trigger atomic wallet reversal if gateway fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    mockSupabase.rpc.mockImplementation((fnName: string) => {
      if (fnName === 'create_pending_bill_payment') {
        return Promise.resolve({ data: 12000.00, error: null });
      }
      if (fnName === 'reverse_bill_payment') {
        return Promise.resolve({ data: 14000.00, error: null }); // Refunded back original amount
      }
      return Promise.resolve({ error: new Error('Unexpected RPC call') });
    });

    // Mock Flutterwave failing
    (flutterwave.createBillPayment as jest.Mock).mockResolvedValue({
      status: 'error',
      message: 'Carrier network timeout'
    });

    const req = createMockRequest({ category: 'airtime', amount: '2000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Carrier network timeout');
    expect(body.error).toContain('Your wallet balance has been refunded.');

    // Ensure database compensating refund was triggered
    expect(mockSupabase.rpc).toHaveBeenCalledWith('reverse_bill_payment', {
      p_tx_ref: expect.stringMatching(/^kyvatron-airtime-\d+-/),
      p_reason: 'Carrier network timeout'
    });
  });

  test('6. CRITICAL FAIL Path: Should return 500 emergency warning if both gateway and reverse balance RPC fail', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    mockSupabase.rpc.mockImplementation((fnName: string) => {
      if (fnName === 'create_pending_bill_payment') {
        return Promise.resolve({ data: 12000.00, error: null });
      }
      if (fnName === 'reverse_bill_payment') {
        return Promise.resolve({ data: null, error: new Error('Database transaction lock error') }); // Refund failed!
      }
      return Promise.resolve({ error: new Error('Unexpected RPC call') });
    });

    // Mock Flutterwave failing
    (flutterwave.createBillPayment as jest.Mock).mockRejectedValue(new Error('Network offline'));

    const req = createMockRequest({ category: 'airtime', amount: '2000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Bill payment failed and refund failed. Please contact customer support.');
    expect(body.actionNeeded).toBe('Reconcile manual refund');
  });

  test('7. Sandbox/Test Mode completion: Should bypass actual API failures in sandbox and complete as simulated success', async () => {
    // Activate Test Mode
    process.env.FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-sandbox-secret-key-123';

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    mockSupabase.rpc.mockImplementation((fnName: string) => {
      if (fnName === 'create_pending_bill_payment') {
        return Promise.resolve({ data: 12000.00, error: null });
      }
      if (fnName === 'complete_bill_payment') {
        return Promise.resolve({ data: null, error: null });
      }
      return Promise.resolve({ error: new Error('Unexpected RPC call') });
    });

    // Mock API failing (simulated carrier timeout in sandbox)
    (flutterwave.createBillPayment as jest.Mock).mockResolvedValue({
      status: 'error',
      message: 'Validation API failure'
    });

    const req = createMockRequest({ category: 'airtime', amount: '2000', form: { phone: '08012345678' } });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.warning).toBe('Simulated test success');

    // Verify it complete_bill_payment'ed in the database with mock flags
    expect(mockSupabase.rpc).toHaveBeenCalledWith('complete_bill_payment', {
      p_tx_ref: expect.stringMatching(/^kyvatron-airtime-\d+-/),
      p_flw_transaction_id: expect.any(Number),
      p_metadata: expect.objectContaining({
        is_mock: true,
        mock_reason: 'Validation API failure'
      })
    });
  });
});
