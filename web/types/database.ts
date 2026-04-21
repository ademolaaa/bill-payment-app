export type KYCStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type InvestmentStatus = 'pending' | 'active' | 'matured' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  kycStatus: KYCStatus;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  providerReference?: string;
}

export interface Investment {
  id: string;
  userId: string;
  principal: number;
  currentYield: number;
  status: InvestmentStatus;
}
