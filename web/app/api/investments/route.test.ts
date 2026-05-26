import { GET, POST } from './route';
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

describe('Investments Route (GET & POST /api/investments)', () => {
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
      order: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const createMockRequest = (method: string, body?: any) => {
    return new Request('http://localhost/api/investments', {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  describe('GET /api/investments', () => {
    test('1. Unauthorized: Should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

      const req = createMockRequest('GET');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: 'Unauthorized' });
    });

    test('2. Database Error: Should return 500 if select query fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      
      // Mock db query throwing an error
      mockSupabase.order.mockResolvedValue({ data: null, error: new Error('Database read timeout') });

      const req = createMockRequest('GET');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Database read timeout' });
    });

    test('3. SUCCESS: Should return 200 with dynamic investments list', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      
      const mockInvestments = [
        { id: 'inv-1', amount: 50000, duration_months: 6, status: 'active' },
        { id: 'inv-2', amount: 10000, duration_months: 3, status: 'matured' }
      ];
      mockSupabase.order.mockResolvedValue({ data: mockInvestments, error: null });

      const req = createMockRequest('GET');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ investments: mockInvestments });
      expect(mockSupabase.from).toHaveBeenCalledWith('investments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('POST /api/investments', () => {
    test('1. Unauthorized: Should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

      const req = createMockRequest('POST', { currency: 'NGN', amount: '15000', duration_months: '3', roi_percent: '11' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: 'Unauthorized' });
    });

    test('2. Missing parameters: Should return 400 if required parameters are missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

      // Missing roi_percent
      const req = createMockRequest('POST', { currency: 'NGN', amount: '15000', duration_months: '3' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: 'Missing required parameters' });
    });

    test('3. Invalid amount: Should return 400 if amount is zero or negative', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

      const req = createMockRequest('POST', { currency: 'NGN', amount: '-500', duration_months: '3', roi_percent: '11' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: 'Amount must be positive' });
    });

    test('4. RPC Error: Should return 400 if database RPC function fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Insufficient wallet balance') });

      const req = createMockRequest('POST', { currency: 'NGN', amount: '15000', duration_months: '3', roi_percent: '11' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: 'Insufficient wallet balance' });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_investment', {
        p_user_id: 'user-123',
        p_currency: 'NGN',
        p_amount: 15000,
        p_duration_months: 3,
        p_roi_percent: 11,
      });
    });

    test('5. SUCCESS: Should return 200 with investment ID on success', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSupabase.rpc.mockResolvedValue({ data: 'inv-uuid-999', error: null });

      const req = createMockRequest('POST', { currency: 'NGN', amount: '15000', duration_months: '3', roi_percent: '11' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, investmentId: 'inv-uuid-999' });
    });
  });
});
