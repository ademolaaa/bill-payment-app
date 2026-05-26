import { POST } from './route';
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

// Mock Dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, options) => ({
      status: options?.status || 200,
      json: async () => body,
    })),
  },
}));

jest.mock('../../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Convert Currency Route (POST /api/convert)', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup base Supabase mock client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const createMockRequest = (body: any) => {
    return new Request('http://localhost/api/convert', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  test('1. Unauthorized: Should return 401 if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

    const req = createMockRequest({ from_currency: 'NGN', amount: '5000', exchange_rate: '1500', fees: '0' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  test('2. Missing parameters: Should return 400 if required parameters are missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    // Missing exchange_rate
    const req = createMockRequest({ from_currency: 'NGN', amount: '5000', fees: '0' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Missing required parameters' });
  });

  test('3. Invalid amount: Should return 400 if amount is zero or negative', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = createMockRequest({ from_currency: 'NGN', amount: '-500', exchange_rate: '1500', fees: '0' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Amount must be positive' });
  });

  test('4. RPC Error: Should return 400 if the database RPC fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Insufficient balance to convert') });

    const req = createMockRequest({ from_currency: 'NGN', amount: '5000', exchange_rate: '1500', fees: '0' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Insufficient balance to convert' });
    expect(mockSupabase.rpc).toHaveBeenCalledWith('convert_currency', {
      p_user_id: 'user-123',
      p_from_currency: 'NGN',
      p_amount: 5000,
      p_exchange_rate: 1500,
      p_fees: 0,
    });
  });

  test('5. SUCCESS: Should return 200 with conversion details on success', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    const mockRpcData = {
      from_new_balance: 5000.00,
      to_new_balance: 10.00,
      receive_amount: 3.33,
    };
    mockSupabase.rpc.mockResolvedValue({ data: mockRpcData, error: null });

    const req = createMockRequest({ from_currency: 'NGN', amount: '5000', exchange_rate: '1500', fees: '0' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      success: true,
      from_new_balance: 5000.00,
      to_new_balance: 10.00,
      receive_amount: 3.33,
    });
  });
});
