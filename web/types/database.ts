export type KYCStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'bill_payment';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'successful';
export type InvestmentStatus = 'pending' | 'active' | 'matured' | 'cancelled';
export type CryptoDepositStatus = 'waiting' | 'confirming' | 'confirmed' | 'finished' | 'failed' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  kycStatus: KYCStatus;
  nowpayments_sub_partner_id?: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  flw_transaction_id?: number;
  tx_ref: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  providerReference?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CryptoDeposit {
  id: string;
  order_id: string;
  status: CryptoDepositStatus;
  fiat_amount?: number;
  fiat_currency?: string;
  crypto_amount?: number;
  crypto_currency?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Investment {
  id: string;
  userId: string;
  principal: number;
  currentYield: number;
  status: InvestmentStatus;
}
