export type AdminRole = 'Super Admin' | 'Finance Admin' | 'Support Admin' | 'Operations Admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  lastLogin: string;
  permissions: string[];
}

export type KYCStatus = 'verified' | 'pending' | 'rejected' | 'unverified';

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  walletBalance: number; // in NGN
  kycStatus: KYCStatus;
  status: 'active' | 'suspended';
  createdAt: string;
  totalTransactions: number;
  totalVolume: number;
}

export type ServiceType = 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'betting' | 'pins';

export type TransactionStatus = 'successful' | 'failed' | 'pending' | 'reversed';

export interface Transaction {
  id: string;
  reference: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  serviceType: ServiceType;
  provider: string;
  amount: number; // in NGN
  fee: number; // in NGN
  status: TransactionStatus;
  createdAt: string;
  providerRef: string;
  apiResponse?: string;
  errorMessage?: string;
  processingTimeMs: number;
  // New fields: pending timeout & retry tracking
  retryCount?: number;
  autoRefunded?: boolean;
  atRisk?: boolean;
  pendingFlaggedAt?: string;
  webhookLate?: boolean;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface Provider {
  id: string;
  name: string;
  serviceType: ServiceType;
  serviceTypes: ServiceType[];
  status: 'active' | 'inactive' | 'degraded';
  commissionRate: number; // in %
  discountRate: number; // in %
  maxSingleTransaction: number; // in NGN
  apiPriority: number; // 1 = highest
  successRate: number; // in %
  uptime: number; // in %
  latencyMs: number;
  manualOverride: boolean;
  routingWeight: number;
  // New fields: circuit breaker
  circuitState: CircuitState;
  consecutiveFailures: number;
  retryCount: number;
  lastHealthCheck: string;
  fallbackProviderId?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  content: string;
  timestamp: string;
  adminName?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  transactionId?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'wallet_funding' | 'failed_bill' | 'other';
  reference: string;
  messages: TicketMessage[];
  createdAt: string;
  resolvedAt?: string;
  // New fields: SLA & auto-classification (backfilled at runtime)
  slaDeadline?: string;
  escalated?: boolean;
  autoClassified?: boolean;
  lastActivityAt?: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  targetAudience: 'all' | 'verified' | 'unverified' | 'specific' | 'pending';
  sentAt: string;
  sentBy: string;
  recipientCount: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  service: string;
  timestamp: string;
  acknowledged: boolean;
  // New fields: resolution tracking & navigation
  isResolved: boolean;
  resolvedAt?: string;
  sourceUrl?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalTransactions: number;
  successRate: number;
  activeUsers: number;
  pendingKYC: number;
  openTickets: number;
  walletFloat: number;
  // New: net profit & AT RISK counts
  netProfit: number;
  atRiskTransactions: number;
  escalatedTickets: number;
}
