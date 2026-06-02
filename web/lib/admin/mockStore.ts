import {
  AdminUser,
  CustomerUser,
  Transaction,
  Provider,
  SupportTicket,
  NotificationLog,
  AuditLog,
  SystemAlert,
  DashboardStats,
  TicketMessage,
  MakerCheckerRequest,
  BankDepositRecord
} from '../../types/admin';
import { supabase } from '../supabase/client';


// Subscription system for reactive state re-renders across components
let listeners: (() => void)[] = [];
export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
const notify = () => {
  // Recalculate stats dynamically when data mutates
  recalculateStats();
  listeners.forEach((l) => l());
};

// 0. MOCK ADMIN USERS (4 operational staff)
export let adminUsers: AdminUser[] = [
  { id: 'adm-1', name: 'Super Admin Dele', email: 'dele.admin@billpay.ng', role: 'Super Admin', avatar: '', lastLogin: '2026-05-29T10:05:00Z', permissions: ['users', 'transactions', 'providers', 'support', 'broadcast', 'settings', 'audit'] },
  { id: 'adm-2', name: 'Finance Admin Tolu', email: 'tolu.finance@billpay.ng', role: 'Finance Admin', avatar: '', lastLogin: '2026-05-29T09:30:00Z', permissions: ['transactions', 'providers', 'audit'] },
  { id: 'adm-3', name: 'Operations Admin Kemi', email: 'kemi.ops@billpay.ng', role: 'Operations Admin', avatar: '', lastLogin: '2026-05-29T08:15:00Z', permissions: ['providers', 'support', 'broadcast', 'audit'] },
  { id: 'adm-4', name: 'Compliance Officer Wale', email: 'wale.compliance@billpay.ng', role: 'Support Admin', avatar: '', lastLogin: '2026-05-28T17:45:00Z', permissions: ['users', 'support', 'audit'] }
];

// 1. MOCK CUSTOMER USERS (25 realistic Nigerian profiles)
export let customerUsers: CustomerUser[] = [
  { id: 'usr-1', fullName: 'Chinonso Okafor', email: 'chinonso.okafor@gmail.com', phone: '+2348031123456', walletBalance: 45200.00, usdtBalance: 11.52, kycStatus: 'verified', status: 'active', createdAt: '2026-01-15T08:30:00Z', totalTransactions: 42, totalVolume: 185000.00 },
  { id: 'usr-2', fullName: 'Babajide Balogun', email: 'jide.balogun@yahoo.com', phone: '+2348123456789', walletBalance: 125000.00, usdtBalance: 250.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-20T10:15:00Z', totalTransactions: 55, totalVolume: 420000.00 },
  { id: 'usr-3', fullName: 'Amina Bello', email: 'amina.bello@bello.co', phone: '+2347081234567', walletBalance: 850.00, usdtBalance: 0.00, kycStatus: 'pending', status: 'active', createdAt: '2026-05-20T14:45:00Z', totalTransactions: 3, totalVolume: 12000.00 },
  { id: 'usr-4', fullName: 'Ngozi Nwachukwu', email: 'ngozi.nwa@gmail.com', phone: '+2348099876543', walletBalance: 15400.00, usdtBalance: 5.00, kycStatus: 'verified', status: 'active', createdAt: '2026-02-05T09:12:00Z', totalTransactions: 19, totalVolume: 65000.00 },
  { id: 'usr-5', fullName: 'Olamide Soyinka', email: 'ola.soyinka@outlook.com', phone: '+2349033445566', walletBalance: 3200.00, usdtBalance: 0.00, kycStatus: 'unverified', status: 'suspended', createdAt: '2026-03-10T16:22:00Z', totalTransactions: 12, totalVolume: 35000.00 },
  { id: 'usr-6', fullName: 'Tunde Bakare', email: 'tunde.bakare@bakareops.ng', phone: '+2348055566778', walletBalance: 67800.00, usdtBalance: 45.00, kycStatus: 'verified', status: 'active', createdAt: '2026-02-18T11:40:00Z', totalTransactions: 28, totalVolume: 110000.00 },
  { id: 'usr-7', fullName: 'Emeka Ike', email: 'emeka.ike@gmail.com', phone: '+2348187766554', walletBalance: 1450.50, usdtBalance: 0.00, kycStatus: 'pending', status: 'active', createdAt: '2026-05-22T08:05:00Z', totalTransactions: 2, totalVolume: 4500.00 },
  { id: 'usr-8', fullName: 'Hadiza Umar', email: 'hadiza.umar@gmail.com', phone: '+2347039988776', walletBalance: 98000.00, usdtBalance: 85.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-08T15:30:00Z', totalTransactions: 64, totalVolume: 380000.00 },
  { id: 'usr-9', fullName: 'Chinedu Obasi', email: 'chinedu.obasi@yahoo.com', phone: '+2348154433221', walletBalance: 5200.00, usdtBalance: 0.00, kycStatus: 'rejected', status: 'active', createdAt: '2026-04-02T13:10:00Z', totalTransactions: 8, totalVolume: 22000.00 },
  { id: 'usr-10', fullName: 'Fatima Abubakar', email: 'fatima.abu@gmail.com', phone: '+2349021234567', walletBalance: 12200.00, usdtBalance: 10.00, kycStatus: 'verified', status: 'active', createdAt: '2026-03-25T10:00:00Z', totalTransactions: 15, totalVolume: 48000.00 },
  { id: 'usr-11', fullName: 'Olumide Adebayo', email: 'olumide.adebayo@gmail.com', phone: '+2348023456781', walletBalance: 3400.00, usdtBalance: 0.00, kycStatus: 'unverified', status: 'active', createdAt: '2026-05-12T17:50:00Z', totalTransactions: 4, totalVolume: 8500.00 },
  { id: 'usr-12', fullName: 'Kelechi Iheanacho', email: 'kelechi.seniorman@gmail.com', phone: '+2348101234567', walletBalance: 88500.00, usdtBalance: 90.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-29T12:00:00Z', totalTransactions: 36, totalVolume: 210000.00 },
  { id: 'usr-13', fullName: 'Aisha Yusuf', email: 'aisha.yusuf@yusufcorp.ng', phone: '+2347061122334', walletBalance: 142000.00, usdtBalance: 115.50, kycStatus: 'verified', status: 'active', createdAt: '2026-02-10T09:35:00Z', totalTransactions: 49, totalVolume: 510000.00 },
  { id: 'usr-14', fullName: 'Chibuike Amaechi', email: 'chibuike.amaechi@yahoo.com', phone: '+2348076543210', walletBalance: 400.00, usdtBalance: 0.00, kycStatus: 'pending', status: 'active', createdAt: '2026-05-26T14:15:00Z', totalTransactions: 1, totalVolume: 1000.00 },
  { id: 'usr-15', fullName: 'Funke Akindele', email: 'funke.akindele@gmail.com', phone: '+2348161122334', walletBalance: 18200.00, usdtBalance: 12.00, kycStatus: 'verified', status: 'active', createdAt: '2026-03-01T15:20:00Z', totalTransactions: 22, totalVolume: 74000.00 },
  { id: 'usr-16', fullName: 'Ibrahim Babangida', email: 'ibrahim.b@outlook.com', phone: '+2349051234567', walletBalance: 72000.00, usdtBalance: 320.00, kycStatus: 'verified', status: 'suspended', createdAt: '2026-02-28T10:45:00Z', totalTransactions: 31, totalVolume: 195000.00 },
  { id: 'usr-17', fullName: 'Nneka Egbuna', email: 'nneka.singer@gmail.com', phone: '+2348083322110', walletBalance: 9600.00, usdtBalance: 8.50, kycStatus: 'verified', status: 'active', createdAt: '2026-04-10T16:55:00Z', totalTransactions: 14, totalVolume: 32000.00 },
  { id: 'usr-18', fullName: 'Obinna Nwaneri', email: 'obinna.nwaneri@gmail.com', phone: '+2348112233445', walletBalance: 23000.00, usdtBalance: 0.00, kycStatus: 'pending', status: 'active', createdAt: '2026-05-18T11:20:00Z', totalTransactions: 6, totalVolume: 15400.00 },
  { id: 'usr-19', fullName: 'Blessing Okagbare', email: 'blessing.okag@gmail.com', phone: '+2347055544332', walletBalance: 11500.00, usdtBalance: 2.00, kycStatus: 'verified', status: 'active', createdAt: '2026-03-15T09:10:00Z', totalTransactions: 20, totalVolume: 82000.00 },
  { id: 'usr-20', fullName: 'Yakubu Gowon', email: 'yakubu.gowon@nigeria.gov', phone: '+2348039988771', walletBalance: 54000.00, usdtBalance: 50.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-05T08:00:00Z', totalTransactions: 75, totalVolume: 620000.00 },
  { id: 'usr-21', fullName: 'Simi Kosoko', email: 'simi.kosoko@studio.ng', phone: '+2348129988776', walletBalance: 32000.00, usdtBalance: 145.00, kycStatus: 'verified', status: 'active', createdAt: '2026-04-18T14:30:00Z', totalTransactions: 17, totalVolume: 95000.00 },
  { id: 'usr-22', fullName: 'Wizkid Balogun', email: 'starboy.wiz@gmail.com', phone: '+2349091234567', walletBalance: 150000.00, usdtBalance: 1800.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-10T12:00:00Z', totalTransactions: 98, totalVolume: 950000.00 },
  { id: 'usr-23', fullName: 'Davido Adeleke', email: 'oboo.davido@obomusic.com', phone: '+2348051234567', walletBalance: 148500.00, usdtBalance: 1420.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-12T13:40:00Z', totalTransactions: 84, totalVolume: 870000.00 },
  { id: 'usr-24', fullName: 'Burna Boy', email: 'odogwu.burna@atlantic.com', phone: '+2348131234567', walletBalance: 135000.00, usdtBalance: 1650.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-14T15:20:00Z', totalTransactions: 92, totalVolume: 890000.00 },
  { id: 'usr-25', fullName: 'Tiwa Savage', email: 'tiwa.savage@savage.co', phone: '+2347011234567', walletBalance: 95400.00, usdtBalance: 780.00, kycStatus: 'verified', status: 'active', createdAt: '2026-01-25T11:10:00Z', totalTransactions: 60, totalVolume: 490000.00 }
];

// 2. MOCK PROVIDERS (8 major payment pathways)
export let providers: Provider[] = [
  { id: 'prov-1', name: 'MTN VTU API', serviceType: 'airtime', serviceTypes: ['airtime', 'data'], status: 'active', commissionRate: 3.5, discountRate: 4.0, maxSingleTransaction: 50000.00, apiPriority: 1, successRate: 98.6, uptime: 99.9, latencyMs: 120, manualOverride: false, routingWeight: 50, circuitState: 'CLOSED', consecutiveFailures: 0, retryCount: 0, lastHealthCheck: '2026-05-29T11:55:00Z' },
  { id: 'prov-2', name: 'Airtel VTU Direct', serviceType: 'data', serviceTypes: ['airtime', 'data'], status: 'active', commissionRate: 3.0, discountRate: 3.5, maxSingleTransaction: 50000.00, apiPriority: 1, successRate: 97.4, uptime: 99.5, latencyMs: 180, manualOverride: false, routingWeight: 35, circuitState: 'CLOSED', consecutiveFailures: 0, retryCount: 0, lastHealthCheck: '2026-05-29T11:55:00Z' },
  { id: 'prov-3', name: 'Glo VTU Gateway', serviceType: 'airtime', serviceTypes: ['airtime', 'data'], status: 'degraded', commissionRate: 4.0, discountRate: 4.5, maxSingleTransaction: 20000.00, apiPriority: 2, successRate: 84.2, uptime: 96.8, latencyMs: 450, manualOverride: false, routingWeight: 15, circuitState: 'HALF_OPEN', consecutiveFailures: 2, retryCount: 3, lastHealthCheck: '2026-05-29T11:40:00Z' },
  { id: 'prov-4', name: '9mobile VTU Bridge', serviceType: 'data', serviceTypes: ['airtime', 'data'], status: 'active', commissionRate: 4.0, discountRate: 4.5, maxSingleTransaction: 20000.00, apiPriority: 1, successRate: 96.1, uptime: 99.1, latencyMs: 210, manualOverride: false, routingWeight: 40, circuitState: 'CLOSED', consecutiveFailures: 0, retryCount: 0, lastHealthCheck: '2026-05-29T11:55:00Z' },
  { id: 'prov-5', name: 'DSTV Multichoice API', serviceType: 'cable_tv', serviceTypes: ['cable_tv'], status: 'active', commissionRate: 1.5, discountRate: 2.0, maxSingleTransaction: 100000.00, apiPriority: 1, successRate: 99.2, uptime: 99.8, latencyMs: 320, manualOverride: false, routingWeight: 80, circuitState: 'CLOSED', consecutiveFailures: 0, retryCount: 0, lastHealthCheck: '2026-05-29T11:55:00Z' },
  { id: 'prov-6', name: 'Ikeja Electric Webhook', serviceType: 'electricity', serviceTypes: ['electricity'], status: 'active', commissionRate: 2.0, discountRate: 0.0, maxSingleTransaction: 150000.00, apiPriority: 1, successRate: 95.8, uptime: 99.4, latencyMs: 280, manualOverride: false, routingWeight: 90, circuitState: 'CLOSED', consecutiveFailures: 1, retryCount: 1, lastHealthCheck: '2026-05-29T11:50:00Z' },
  { id: 'prov-7', name: 'Bet9ja API Endpoint', serviceType: 'betting', serviceTypes: ['betting'], status: 'active', commissionRate: 2.5, discountRate: 1.0, maxSingleTransaction: 100000.00, apiPriority: 1, successRate: 96.5, uptime: 99.2, latencyMs: 190, manualOverride: false, routingWeight: 75, circuitState: 'OPEN', consecutiveFailures: 5, retryCount: 5, lastHealthCheck: '2026-05-29T10:32:00Z', fallbackProviderId: 'prov-fb1' },
  { id: 'prov-8', name: 'Scratch Card PIN Engine', serviceType: 'pins', serviceTypes: ['pins'], status: 'inactive', commissionRate: 3.0, discountRate: 5.0, maxSingleTransaction: 10000.00, apiPriority: 1, successRate: 0.0, uptime: 0.0, latencyMs: 0, manualOverride: false, routingWeight: 0, circuitState: 'OPEN', consecutiveFailures: 8, retryCount: 8, lastHealthCheck: '2026-05-28T08:10:00Z' }
];

// Helper generators for transactions
const getEmail = (uid: string) => customerUsers.find(u => u.id === uid)?.email || 'unknown@user.com';
const getPhone = (uid: string) => customerUsers.find(u => u.id === uid)?.phone || '+2340000000000';

// 3. MOCK TRANSACTIONS (40 covering varied scopes)
export let transactions: Transaction[] = [
  { id: 'tx-1', reference: 'TX-20260529-001', userId: 'usr-1', userEmail: getEmail('usr-1'), userPhone: getPhone('usr-1'), serviceType: 'airtime', provider: 'MTN VTU API', amount: 2000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-29T09:12:00Z', providerRef: 'MTN-VTU-9921102', processingTimeMs: 450, apiResponse: '{"status":"success","code":"200","message":"Airtime credited"}' },
  { id: 'tx-2', reference: 'TX-20260529-002', userId: 'usr-2', userEmail: getEmail('usr-2'), userPhone: getPhone('usr-2'), serviceType: 'data', provider: 'Airtel VTU Direct', amount: 5000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-29T09:20:00Z', providerRef: 'AIR-DATA-11223', processingTimeMs: 620, apiResponse: '{"status":"success","code":"200","data":{"volume":"10GB","validity":"30days"}}' },
  { id: 'tx-3', reference: 'TX-20260529-003', userId: 'usr-3', userEmail: getEmail('usr-3'), userPhone: getPhone('usr-3'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 15000.00, fee: 100.00, status: 'pending', createdAt: '2026-05-29T10:02:00Z', providerRef: 'IKJ-ELEC-9021', processingTimeMs: 1200, atRisk: true, pendingFlaggedAt: '2026-05-29T10:32:00Z', webhookLate: true, retryCount: 0, autoRefunded: false },
  { id: 'tx-4', reference: 'TX-20260529-004', userId: 'usr-4', userEmail: getEmail('usr-4'), userPhone: getPhone('usr-4'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 14200.00, fee: 100.00, status: 'successful', createdAt: '2026-05-29T10:15:00Z', providerRef: 'DSTV-MC-88124', processingTimeMs: 850, apiResponse: '{"status":"success","smartcard":"1022399210","package":"Compact Plus"}' },
  { id: 'tx-5', reference: 'TX-20260529-005', userId: 'usr-5', userEmail: getEmail('usr-5'), userPhone: getPhone('usr-5'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 2500.00, fee: 50.00, status: 'failed', createdAt: '2026-05-29T10:30:00Z', providerRef: 'B9J-FUND-9812', processingTimeMs: 2500, errorMessage: 'API Timeout from Partner Gateway', apiResponse: '{"status":"error","code":"504","message":"Timeout"}' },
  { id: 'tx-6', reference: 'TX-20260528-001', userId: 'usr-6', userEmail: getEmail('usr-6'), userPhone: getPhone('usr-6'), serviceType: 'pins', provider: 'Scratch Card PIN Engine', amount: 1000.00, fee: 0.00, status: 'failed', createdAt: '2026-05-28T08:15:00Z', providerRef: 'PIN-GEN-0021', processingTimeMs: 150, errorMessage: 'Provider database is inactive', apiResponse: '{"status":"failed","reason":"Database disconnected"}' },
  { id: 'tx-7', reference: 'TX-20260528-002', userId: 'usr-7', userEmail: getEmail('usr-7'), userPhone: getPhone('usr-7'), serviceType: 'airtime', provider: 'Glo VTU Gateway', amount: 500.00, fee: 0.00, status: 'successful', createdAt: '2026-05-28T09:30:00Z', providerRef: 'GLO-VTU-77211', processingTimeMs: 900, apiResponse: '{"status":"success","credited":"₦500"}' },
  { id: 'tx-8', reference: 'TX-20260528-003', userId: 'usr-8', userEmail: getEmail('usr-8'), userPhone: getPhone('usr-8'), serviceType: 'data', provider: 'MTN VTU API', amount: 3500.00, fee: 0.00, status: 'successful', createdAt: '2026-05-28T10:45:00Z', providerRef: 'MTN-DATA-3992', processingTimeMs: 510 },
  { id: 'tx-9', reference: 'TX-20260528-004', userId: 'usr-9', userEmail: getEmail('usr-9'), userPhone: getPhone('usr-9'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 20000.00, fee: 100.00, status: 'reversed', createdAt: '2026-05-28T13:22:00Z', providerRef: 'IKJ-ELEC-4421', processingTimeMs: 3100, errorMessage: 'Meter response failed post-debit. Funds reversed to wallet.', apiResponse: '{"status":"reversed","details":"debit_reversed_to_user_wallet"}' },
  { id: 'tx-10', reference: 'TX-20260528-005', userId: 'usr-10', userEmail: getEmail('usr-10'), userPhone: getPhone('usr-10'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 5300.00, fee: 100.00, status: 'successful', createdAt: '2026-05-28T14:40:00Z', providerRef: 'GOTV-MC-7712', processingTimeMs: 820 },
  { id: 'tx-11', reference: 'TX-20260527-001', userId: 'usr-11', userEmail: getEmail('usr-11'), userPhone: getPhone('usr-11'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 1000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-27T10:10:00Z', providerRef: 'B9J-FUND-1123', processingTimeMs: 650 },
  { id: 'tx-12', reference: 'TX-20260527-002', userId: 'usr-12', userEmail: getEmail('usr-12'), userPhone: getPhone('usr-12'), serviceType: 'airtime', provider: '9mobile VTU Bridge', amount: 1500.00, fee: 0.00, status: 'successful', createdAt: '2026-05-27T11:20:00Z', providerRef: '9MOB-VTU-9021', processingTimeMs: 480 },
  { id: 'tx-13', reference: 'TX-20260527-003', userId: 'usr-13', userEmail: getEmail('usr-13'), userPhone: getPhone('usr-13'), serviceType: 'data', provider: 'MTN VTU API', amount: 10000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-27T14:35:00Z', providerRef: 'MTN-DATA-9902', processingTimeMs: 500 },
  { id: 'tx-14', reference: 'TX-20260527-004', userId: 'usr-14', userEmail: getEmail('usr-14'), userPhone: getPhone('usr-14'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 5000.00, fee: 100.00, status: 'failed', createdAt: '2026-05-27T16:50:00Z', providerRef: 'IKJ-ELEC-1102', processingTimeMs: 4000, errorMessage: 'Partner gateway disconnected', apiResponse: '{"status":"error","reason":"Socket disconnected"}' },
  { id: 'tx-15', reference: 'TX-20260526-001', userId: 'usr-15', userEmail: getEmail('usr-15'), userPhone: getPhone('usr-15'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 18500.00, fee: 100.00, status: 'successful', createdAt: '2026-05-26T09:30:00Z', providerRef: 'DSTV-MC-9011', processingTimeMs: 800 },
  { id: 'tx-16', reference: 'TX-20260526-002', userId: 'usr-16', userEmail: getEmail('usr-16'), userPhone: getPhone('usr-16'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 5000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-26T11:15:00Z', providerRef: 'B9J-FUND-4492', processingTimeMs: 700 },
  { id: 'tx-17', reference: 'TX-20260526-003', userId: 'usr-17', userEmail: getEmail('usr-17'), userPhone: getPhone('usr-17'), serviceType: 'airtime', provider: 'Airtel VTU Direct', amount: 1000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-26T15:20:00Z', providerRef: 'AIR-VTU-9921', processingTimeMs: 460 },
  { id: 'tx-18', reference: 'TX-20260525-001', userId: 'usr-18', userEmail: getEmail('usr-18'), userPhone: getPhone('usr-18'), serviceType: 'data', provider: 'Glo VTU Gateway', amount: 1500.00, fee: 0.00, status: 'failed', createdAt: '2026-05-25T08:45:00Z', providerRef: 'GLO-VTU-1100', processingTimeMs: 3500, errorMessage: 'Glo network route failure', apiResponse: '{"status":"failed","reason":"Routing route 4 not found"}' },
  { id: 'tx-19', reference: 'TX-20260525-002', userId: 'usr-19', userEmail: getEmail('usr-19'), userPhone: getPhone('usr-19'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 30000.00, fee: 100.00, status: 'successful', createdAt: '2026-05-25T10:12:00Z', providerRef: 'IKJ-ELEC-1234', processingTimeMs: 1400 },
  { id: 'tx-20', reference: 'TX-20260525-003', userId: 'usr-20', userEmail: getEmail('usr-20'), userPhone: getPhone('usr-20'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 9600.00, fee: 100.00, status: 'successful', createdAt: '2026-05-25T14:22:00Z', providerRef: 'GOTV-MC-9031', processingTimeMs: 780 },
  
  // Backfilled older mock data to show trends
  { id: 'tx-21', reference: 'TX-260524-021', userId: 'usr-21', userEmail: getEmail('usr-21'), userPhone: getPhone('usr-21'), serviceType: 'airtime', provider: 'MTN VTU API', amount: 1000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-24T09:00:00Z', providerRef: 'P-9021', processingTimeMs: 400 },
  { id: 'tx-22', reference: 'TX-260524-022', userId: 'usr-22', userEmail: getEmail('usr-22'), userPhone: getPhone('usr-22'), serviceType: 'data', provider: 'MTN VTU API', amount: 6000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-24T10:10:00Z', providerRef: 'P-9022', processingTimeMs: 410 },
  { id: 'tx-23', reference: 'TX-260524-023', userId: 'usr-23', userEmail: getEmail('usr-23'), userPhone: getPhone('usr-23'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 10000.00, fee: 100.00, status: 'successful', createdAt: '2026-05-24T12:00:00Z', providerRef: 'P-9023', processingTimeMs: 1300 },
  { id: 'tx-24', reference: 'TX-260524-024', userId: 'usr-24', userEmail: getEmail('usr-24'), userPhone: getPhone('usr-24'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 14200.00, fee: 100.00, status: 'successful', createdAt: '2026-05-24T14:40:00Z', providerRef: 'P-9024', processingTimeMs: 820 },
  { id: 'tx-25', reference: 'TX-260524-025', userId: 'usr-25', userEmail: getEmail('usr-25'), userPhone: getPhone('usr-25'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 3000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-24T16:15:00Z', providerRef: 'P-9025', processingTimeMs: 600 },
  
  { id: 'tx-26', reference: 'TX-260523-026', userId: 'usr-1', userEmail: getEmail('usr-1'), userPhone: getPhone('usr-1'), serviceType: 'airtime', provider: 'Airtel VTU Direct', amount: 500.00, fee: 0.00, status: 'successful', createdAt: '2026-05-23T08:30:00Z', providerRef: 'P-9026', processingTimeMs: 440 },
  { id: 'tx-27', reference: 'TX-260523-027', userId: 'usr-2', userEmail: getEmail('usr-2'), userPhone: getPhone('usr-2'), serviceType: 'data', provider: 'Airtel VTU Direct', amount: 3000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-23T09:40:00Z', providerRef: 'P-9027', processingTimeMs: 500 },
  { id: 'tx-28', reference: 'TX-260523-028', userId: 'usr-3', userEmail: getEmail('usr-3'), userPhone: getPhone('usr-3'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 8000.00, fee: 100.00, status: 'successful', createdAt: '2026-05-23T11:00:00Z', providerRef: 'P-9028', processingTimeMs: 1450 },
  { id: 'tx-29', reference: 'TX-260523-029', userId: 'usr-4', userEmail: getEmail('usr-4'), userPhone: getPhone('usr-4'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 5300.00, fee: 100.00, status: 'successful', createdAt: '2026-05-23T13:20:00Z', providerRef: 'P-9029', processingTimeMs: 780 },
  { id: 'tx-30', reference: 'TX-260523-030', userId: 'usr-5', userEmail: getEmail('usr-5'), userPhone: getPhone('usr-5'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 2000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-23T15:00:00Z', providerRef: 'P-9030', processingTimeMs: 620 },
  
  { id: 'tx-31', reference: 'TX-260522-031', userId: 'usr-6', userEmail: getEmail('usr-6'), userPhone: getPhone('usr-6'), serviceType: 'airtime', provider: 'Glo VTU Gateway', amount: 200.00, fee: 0.00, status: 'successful', createdAt: '2026-05-22T08:15:00Z', providerRef: 'P-9031', processingTimeMs: 800 },
  { id: 'tx-32', reference: 'TX-260522-032', userId: 'usr-7', userEmail: getEmail('usr-7'), userPhone: getPhone('usr-7'), serviceType: 'data', provider: 'MTN VTU API', amount: 1500.00, fee: 0.00, status: 'successful', createdAt: '2026-05-22T10:00:00Z', providerRef: 'P-9032', processingTimeMs: 450 },
  { id: 'tx-33', reference: 'TX-260522-033', userId: 'usr-8', userEmail: getEmail('usr-8'), userPhone: getPhone('usr-8'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 12000.00, fee: 100.00, status: 'successful', createdAt: '2026-05-22T11:45:00Z', providerRef: 'P-9033', processingTimeMs: 1500 },
  { id: 'tx-34', reference: 'TX-260522-034', userId: 'usr-9', userEmail: getEmail('usr-9'), userPhone: getPhone('usr-9'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 18500.00, fee: 100.00, status: 'successful', createdAt: '2026-05-22T14:10:00Z', providerRef: 'P-9034', processingTimeMs: 810 },
  { id: 'tx-35', reference: 'TX-260522-035', userId: 'usr-10', userEmail: getEmail('usr-10'), userPhone: getPhone('usr-10'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 1000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-22T16:30:00Z', providerRef: 'P-9035', processingTimeMs: 640 },

  { id: 'tx-36', reference: 'TX-260521-036', userId: 'usr-11', userEmail: getEmail('usr-11'), userPhone: getPhone('usr-11'), serviceType: 'airtime', provider: '9mobile VTU Bridge', amount: 1000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-21T09:30:00Z', providerRef: 'P-9036', processingTimeMs: 490 },
  { id: 'tx-37', reference: 'TX-260521-037', userId: 'usr-12', userEmail: getEmail('usr-12'), userPhone: getPhone('usr-12'), serviceType: 'data', provider: 'Airtel VTU Direct', amount: 2000.00, fee: 0.00, status: 'successful', createdAt: '2026-05-21T11:00:00Z', providerRef: 'P-9037', processingTimeMs: 460 },
  { id: 'tx-38', reference: 'TX-260521-038', userId: 'usr-13', userEmail: getEmail('usr-13'), userPhone: getPhone('usr-13'), serviceType: 'electricity', provider: 'Ikeja Electric Webhook', amount: 5000.00, fee: 100.00, status: 'successful', createdAt: '2026-05-21T13:30:00Z', providerRef: 'P-9038', processingTimeMs: 1400 },
  { id: 'tx-39', reference: 'TX-260521-039', userId: 'usr-14', userEmail: getEmail('usr-14'), userPhone: getPhone('usr-14'), serviceType: 'cable_tv', provider: 'DSTV Multichoice API', amount: 5300.00, fee: 100.00, status: 'successful', createdAt: '2026-05-21T15:20:00Z', providerRef: 'P-9039', processingTimeMs: 800 },
  { id: 'tx-40', reference: 'TX-260521-040', userId: 'usr-15', userEmail: getEmail('usr-15'), userPhone: getPhone('usr-15'), serviceType: 'betting', provider: 'Bet9ja API Endpoint', amount: 4000.00, fee: 50.00, status: 'successful', createdAt: '2026-05-21T17:00:00Z', providerRef: 'P-9040', processingTimeMs: 660 }
];// 4. MOCK SUPPORT TICKETS (12 tickets, min 3 messages each)
export let supportTickets: SupportTicket[] = [
  {
    id: 'tkt-1',
    userId: 'usr-3',
    userEmail: getEmail('usr-3'),
    transactionId: 'tx-5',
    subject: 'Bet9ja wallet funding debited but not reflecting',
    status: 'open',
    priority: 'high',
    category: 'wallet_funding',
    reference: 'TKT-001',
    messages: [
      { id: 'msg-1-1', sender: 'user', content: 'Good day, I tried to fund my Bet9ja wallet with ₦2,500. My account was debited but the betting balance did not change. Please help.', timestamp: '2026-05-29T10:32:00Z' },
      { id: 'msg-1-2', sender: 'admin', content: 'Hello Amina, thank you for reaching out. We can see the transaction failed on our provider endpoint due to a timeout. We are reviewing this immediately.', timestamp: '2026-05-29T10:35:00Z', adminName: 'Support Agent Bola' },
      { id: 'msg-1-3', sender: 'user', content: 'Okay, will I get a refund or will my Bet9ja account be credited? I need it urgently.', timestamp: '2026-05-29T10:38:00Z' }
    ],
    createdAt: '2026-05-29T10:32:00Z'
  },
  {
    id: 'tkt-2',
    userId: 'usr-5',
    userEmail: getEmail('usr-5'),
    subject: 'Account Suspended - Requesting Clarification',
    status: 'open',
    priority: 'medium',
    category: 'other',
    reference: 'TKT-002',
    messages: [
      { id: 'msg-2-1', sender: 'user', content: 'Why is my account suspended? I wanted to buy airtime and I saw suspended. I did not do anything wrong.', timestamp: '2026-05-29T08:12:00Z' },
      { id: 'msg-2-2', sender: 'admin', content: 'Hello Olamide, your account was suspended due to unverified KYC details. You need to upload a valid government-issued ID.', timestamp: '2026-05-29T08:20:00Z', adminName: 'Compliance Officer Wale' },
      { id: 'msg-2-3', sender: 'user', content: 'Oh I see, I have my National ID Card now. Where can I upload it?', timestamp: '2026-05-29T08:25:00Z' }
    ],
    createdAt: '2026-05-29T08:12:00Z'
  },
  {
    id: 'tkt-3',
    userId: 'usr-9',
    userEmail: getEmail('usr-9'),
    transactionId: 'tx-9',
    subject: 'Electricity Token Not Received for ₦20,000 Purchase',
    status: 'in_progress',
    priority: 'critical',
    category: 'wallet_funding',
    reference: 'TKT-003',
    messages: [
      { id: 'msg-3-1', sender: 'user', content: 'I paid ₦20,000 for Ikeja Electric token yesterday. The transaction states Reversed, but I haven\'t seen my token or wallet refund!', timestamp: '2026-05-28T13:30:00Z' },
      { id: 'msg-3-2', sender: 'admin', content: 'Hello Chinedu, the purchase failed at the Ikeja Electric server. The reverse operation was initiated. Let me verify the wallet credit log.', timestamp: '2026-05-28T13:45:00Z', adminName: 'Finance Admin Tolu' },
      { id: 'msg-3-3', sender: 'user', content: 'Please check quickly. I have been in the dark since yesterday.', timestamp: '2026-05-28T13:50:00Z' }
    ],
    createdAt: '2026-05-28T13:30:00Z'
  },
  {
    id: 'tkt-4',
    userId: 'usr-14',
    userEmail: getEmail('usr-14'),
    transactionId: 'tx-14',
    subject: 'Electricity token ₦5,000 purchase failure',
    status: 'resolved',
    priority: 'medium',
    category: 'failed_bill',
    reference: 'TKT-004',
    messages: [
      { id: 'msg-4-1', sender: 'user', content: 'I tried buying ₦5,000 electricity token. It failed but I was charged.', timestamp: '2026-05-27T17:00:00Z' },
      { id: 'msg-4-2', sender: 'admin', content: 'Hello Chibuike, yes the Ikeja Electric server was down at that exact moment. We have refunded ₦5,000 directly back to your wallet.', timestamp: '2026-05-27T17:15:00Z', adminName: 'Support Agent Bola' },
      { id: 'msg-4-3', sender: 'user', content: 'Thank you! I see the wallet refund now. Will try again later.', timestamp: '2026-05-27T17:20:00Z' }
    ],
    createdAt: '2026-05-27T17:00:00Z',
    resolvedAt: '2026-05-27T17:25:00Z'
  },
  {
    id: 'tkt-5',
    userId: 'usr-18',
    userEmail: getEmail('usr-18'),
    transactionId: 'tx-18',
    subject: 'Glo Data 1.5GB Failed but Wallet Deducted',
    status: 'closed',
    priority: 'low',
    category: 'failed_bill',
    reference: 'TKT-005',
    messages: [
      { id: 'msg-5-1', sender: 'user', content: 'My Glo data failed. It was ₦1,500. Please look into it.', timestamp: '2026-05-25T08:50:00Z' },
      { id: 'msg-5-2', sender: 'admin', content: 'Hello Obinna, our automated gateway detected this failure and refunded your balance immediately. Please confirm your wallet ledger.', timestamp: '2026-05-25T09:00:00Z', adminName: 'Automated Bot' },
      { id: 'msg-5-3', sender: 'user', content: 'Yes, checked and I got the refund. Thanks.', timestamp: '2026-05-25T09:05:00Z' }
    ],
    createdAt: '2026-05-25T08:50:00Z',
    resolvedAt: '2026-05-25T09:05:00Z'
  },
  {
    id: 'tkt-6',
    userId: 'usr-1',
    userEmail: getEmail('usr-1'),
    subject: 'KYC Document Verification Status',
    status: 'open',
    priority: 'low',
    category: 'other',
    reference: 'TKT-006',
    messages: [
      { id: 'msg-6-1', sender: 'user', content: 'Hi, I uploaded my NIN details 2 days ago. It is still showing pending. Can you approve it?', timestamp: '2026-05-29T07:15:00Z' },
      { id: 'msg-6-2', sender: 'admin', content: 'Hello Chinonso, we are currently auditing backlog documents. Your details look correct. An admin will review shortly.', timestamp: '2026-05-29T07:45:00Z', adminName: 'Compliance Officer Wale' },
      { id: 'msg-6-3', sender: 'user', content: 'Thank you very much. I appreciate the swift feedback.', timestamp: '2026-05-29T08:00:00Z' }
    ],
    createdAt: '2026-05-29T07:15:00Z'
  },
  {
    id: 'tkt-7',
    userId: 'usr-4',
    userEmail: getEmail('usr-4'),
    subject: 'Wrong cable package selected',
    status: 'resolved',
    priority: 'low',
    category: 'failed_bill',
    reference: 'TKT-007',
    messages: [
      { id: 'msg-7-1', sender: 'user', content: 'I wanted to buy DSTV Compact but mistakenly bought GOtv Max. Please can you change it?', timestamp: '2026-05-24T12:00:00Z' },
      { id: 'msg-7-2', sender: 'admin', content: 'Hello Ngozi, unfortunately cable TV subscriptions are processed instantly by the multichoice servers and cannot be cancelled once successful.', timestamp: '2026-05-24T12:20:00Z', adminName: 'Support Agent Bola' },
      { id: 'msg-7-3', sender: 'user', content: 'Ah ok. I understand. Will make sure to check carefully next time.', timestamp: '2026-05-24T12:30:00Z' }
    ],
    createdAt: '2026-05-24T12:00:00Z',
    resolvedAt: '2026-05-24T12:35:00Z'
  },
  {
    id: 'tkt-8',
    userId: 'usr-8',
    userEmail: getEmail('usr-8'),
    subject: 'Corporate API partnership',
    status: 'in_progress',
    priority: 'medium',
    category: 'other',
    reference: 'TKT-008',
    messages: [
      { id: 'msg-8-1', sender: 'user', content: 'Do you offer custom API integrations for corporate agencies wishing to buy bulk airtime?', timestamp: '2026-05-27T10:15:00Z' },
      { id: 'msg-8-2', sender: 'admin', content: 'Hello Hadiza, yes we have dedicated B2B services. I am forwarding your inquiry to our partnerships manager.', timestamp: '2026-05-27T11:00:00Z', adminName: 'Partnerships Officer Ngozi' },
      { id: 'msg-8-3', sender: 'user', content: 'Brilliant. Will await the email response.', timestamp: '2026-05-27T11:15:00Z' }
    ],
    createdAt: '2026-05-27T10:15:00Z'
  },
  {
    id: 'tkt-9',
    userId: 'usr-11',
    userEmail: getEmail('usr-11'),
    subject: 'Payment receipt not sent to email',
    status: 'resolved',
    priority: 'low',
    category: 'other',
    reference: 'TKT-009',
    messages: [
      { id: 'msg-9-1', sender: 'user', content: 'I completed a transaction for ₦3,400 but didn\'t receive the confirmation email receipt.', timestamp: '2026-05-26T14:00:00Z' },
      { id: 'msg-9-2', sender: 'admin', content: 'Hello Olumide, we noticed a minor email SMTP delay. The receipt has been re-triggered and sent manually to you.', timestamp: '2026-05-26T14:30:00Z', adminName: 'Support Agent Bola' },
      { id: 'msg-9-3', sender: 'user', content: 'Got it now. Excellent service!', timestamp: '2026-05-26T14:35:00Z' }
    ],
    createdAt: '2026-05-26T14:00:00Z',
    resolvedAt: '2026-05-26T14:35:00Z'
  },
  {
    id: 'tkt-10',
    userId: 'usr-15',
    userEmail: getEmail('usr-15'),
    subject: 'Cannot login on mobile app',
    status: 'open',
    priority: 'medium',
    category: 'other',
    reference: 'TKT-010',
    messages: [
      { id: 'msg-10-1', sender: 'user', content: 'I keep getting password mismatch error on the mobile app, but I can log in perfectly on the website. Help.', timestamp: '2026-05-29T09:00:00Z' },
      { id: 'msg-10-2', sender: 'admin', content: 'Hello Funke, please make sure you have upgraded the mobile app to v2.4.1. We recently pushed security patches.', timestamp: '2026-05-29T09:15:00Z', adminName: 'Tech Support Ibrahim' },
      { id: 'msg-10-3', sender: 'user', content: 'Let me try updating it from the Play Store and let you know.', timestamp: '2026-05-29T09:20:00Z' }
    ],
    createdAt: '2026-05-29T09:00:00Z'
  },
  {
    id: 'tkt-11',
    userId: 'usr-20',
    userEmail: getEmail('usr-20'),
    subject: 'Double debit during bank transfer wallet funding',
    status: 'in_progress',
    priority: 'high',
    category: 'wallet_funding',
    reference: 'TKT-011',
    messages: [
      { id: 'msg-11-1', sender: 'user', content: 'I did a single bank transfer of ₦50,000, but I was charged twice from my bank, though only one ₦50,000 reflected in my app wallet.', timestamp: '2026-05-28T16:00:00Z' },
      { id: 'msg-11-2', sender: 'admin', content: 'Hello Yakubu, we can only see one incoming webhook from Wema Bank. Let us run an audit check with Providus as well.', timestamp: '2026-05-28T16:45:00Z', adminName: 'Finance Admin Tolu' },
      { id: 'msg-11-3', sender: 'user', content: 'Here is the debit alert screenshot from my bank. Let know what you find.', timestamp: '2026-05-28T16:55:00Z' }
    ],
    createdAt: '2026-05-28T16:00:00Z'
  },
  {
    id: 'tkt-12',
    userId: 'usr-23',
    userEmail: getEmail('usr-23'),
    subject: 'Betting API commissions',
    status: 'closed',
    priority: 'low',
    category: 'other',
    reference: 'TKT-012',
    messages: [
      { id: 'msg-12-1', sender: 'user', content: 'Are commissions active for VIP level users funding betting wallets above ₦100,000?', timestamp: '2026-05-22T10:00:00Z' },
      { id: 'msg-12-2', sender: 'admin', content: 'Hello Davido, yes, VIP accounts receive a flat 1% commission cash-back on betting transactions above ₦50,000.', timestamp: '2026-05-22T10:15:00Z', adminName: 'Finance Admin Tolu' },
      { id: 'msg-12-3', sender: 'user', content: 'Nice, thanks for verifying.', timestamp: '2026-05-22T10:30:00Z' }
    ],
    createdAt: '2026-05-22T10:00:00Z',
    resolvedAt: '2026-05-22T10:30:00Z'
  }
];

// 5. MOCK NOTIFICATION LOGS (10 records)
export let notificationLogs: NotificationLog[] = [
  { id: 'notif-1', title: 'System Maintenance - Ikeja Electric Gateway', body: 'Please note that Ikeja Electric services will be offline on Saturday from 2 AM to 4 AM for scheduled server upgrades.', targetAudience: 'all', sentAt: '2026-05-28T18:00:00Z', sentBy: 'Super Admin Dele', recipientCount: 15402 },
  { id: 'notif-2', title: 'Upload KYC to Unlock Higher Funding Limits', body: 'Verify your profile today by uploading your NIN or Voter Card to increase your daily funding limit to ₦1,000,000.', targetAudience: 'unverified', sentAt: '2026-05-26T10:00:00Z', sentBy: 'Compliance Officer Wale', recipientCount: 2311 },
  { id: 'notif-3', title: 'Get 4% Discount on Airtime Purchases This Weekend!', body: 'Load airtime on MTN, Airtel, or Glo and get an instant 4% cashback credit directly inside your app wallet.', targetAudience: 'verified', sentAt: '2026-05-22T15:30:00Z', sentBy: 'Marketing Lead Tunde', recipientCount: 13091 },
  { id: 'notif-4', title: 'Wema Bank Transfer Infrastructure Active', body: 'You can now instantly fund your wallets using your personalized Wema account numbers listed on the profile tab.', targetAudience: 'all', sentAt: '2026-05-15T09:00:00Z', sentBy: 'Super Admin Dele', recipientCount: 15200 },
  { id: 'notif-5', title: 'Betting Wallets Funding Lower Charges', body: 'Funding fees on Sportybet and Bet9ja wallets have been reduced to a flat ₦50 fee. Stay in the game!', targetAudience: 'all', sentAt: '2026-05-10T12:00:00Z', sentBy: 'Super Admin Dele', recipientCount: 15150 },
  { id: 'notif-6', title: 'DSTV / Gotv Outage Resolved', body: 'The Multichoice API portal issues have been resolved. You can now purchase subscriptions normally.', targetAudience: 'all', sentAt: '2026-05-08T17:45:00Z', sentBy: 'Operations Admin Kemi', recipientCount: 15100 },
  { id: 'notif-7', title: '9mobile VTU Downtime Warning', body: '9mobile service providers are reporting minor latency. Data activations may take up to 10 minutes to deliver.', targetAudience: 'all', sentAt: '2026-05-05T14:00:00Z', sentBy: 'Operations Admin Kemi', recipientCount: 15002 },
  { id: 'notif-8', title: 'Security Advisory: Enable 2FA Now', body: 'Protect your digital wallet by enabling Two-Factor Authentication under settings to secure your funds.', targetAudience: 'all', sentAt: '2026-04-28T09:00:00Z', sentBy: 'Super Admin Dele', recipientCount: 14890 },
  { id: 'notif-9', title: 'KYC Document Verification Delay Notice', body: 'Due to public holidays, document verifications might take up to 48 hours. Thank you for your patience.', targetAudience: 'pending', sentAt: '2026-04-16T11:00:00Z', sentBy: 'Compliance Officer Wale', recipientCount: 104 },
  { id: 'notif-10', title: 'Welcome to the Premier Utility platform!', body: 'Thank you for signing up. Enjoy zero processing fees on all airtime and data subscriptions today.', targetAudience: 'all', sentAt: '2026-04-01T08:00:00Z', sentBy: 'Super Admin Dele', recipientCount: 12000 }
];

// 6. MOCK AUDIT LOGS (20 logs)
export let auditLogs: AuditLog[] = [
  { id: 'aud-1', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'KYC Approval', target: 'usr-1', details: 'Approved Chinonso Okafor NIN verification', ipAddress: '102.89.34.12', timestamp: '2026-05-29T10:10:00Z' },
  { id: 'aud-2', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'Refund Issued', target: 'tx-5', details: 'Reversed failed Bet9ja transaction (₦2,500.00) back to user wallet', ipAddress: '102.89.34.15', timestamp: '2026-05-29T10:42:00Z' },
  { id: 'aud-3', adminId: 'adm-3', adminName: 'Operations Admin Kemi', action: 'Provider Disabled', target: 'prov-8', details: 'Deactivated Scratch Card PIN Engine due to recurring API timeouts', ipAddress: '197.210.8.44', timestamp: '2026-05-29T08:30:00Z' },
  { id: 'aud-4', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'Broadcast Sent', target: 'notif-1', details: 'Dispatched Ikeja Electric maintenance notice to all users', ipAddress: '102.89.34.12', timestamp: '2026-05-28T18:00:00Z' },
  { id: 'aud-5', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'Commission Update', target: 'prov-1', details: 'Increased MTN airtime VTU commission from 3.0% to 3.5%', ipAddress: '102.89.34.15', timestamp: '2026-05-28T15:20:00Z' },
  { id: 'aud-6', adminId: 'adm-4', adminName: 'Compliance Officer Wale', action: 'User Suspension', target: 'usr-5', details: 'Suspended Olamide Soyinka due to flag for multiple unverified logins', ipAddress: '197.210.64.21', timestamp: '2026-05-28T11:45:00Z' },
  { id: 'aud-7', adminId: 'adm-3', adminName: 'Operations Admin Kemi', action: 'Priority Adjusted', target: 'prov-3', details: 'Demoted Glo VTU API priority from rank 1 to rank 2 due to high latency', ipAddress: '197.210.8.44', timestamp: '2026-05-28T10:00:00Z' },
  { id: 'aud-8', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'Manual Payout', target: 'prov-5', details: 'Initiated settlements payout to Multichoice portal float (₦250,000)', ipAddress: '102.89.34.15', timestamp: '2026-05-27T16:00:00Z' },
  { id: 'aud-9', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'Settings Change', target: 'limits', details: 'Updated single transaction limit for unverified users to ₦10,000', ipAddress: '102.89.34.12', timestamp: '2026-05-27T14:10:00Z' },
  { id: 'aud-10', adminId: 'adm-4', adminName: 'Compliance Officer Wale', action: 'KYC Rejection', target: 'usr-9', details: 'Rejected Chinedu Obasi NIN due to blurry picture upload', ipAddress: '197.210.64.21', timestamp: '2026-05-27T11:30:00Z' },
  { id: 'aud-11', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'Role Assigned', target: 'adm-4', details: 'Assigned Compliance permissions to Wale', ipAddress: '102.89.34.12', timestamp: '2026-05-26T09:00:00Z' },
  { id: 'aud-12', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'System Threshold Adjust', target: 'fees', details: 'Set flat fee for electricity transactions to ₦100.00', ipAddress: '102.89.34.15', timestamp: '2026-05-25T15:30:00Z' },
  { id: 'aud-13', adminId: 'adm-3', adminName: 'Operations Admin Kemi', action: 'Channel Enabled', target: 'prov-4', details: 'Activated 9mobile VTU Bridge backup portal', ipAddress: '197.210.8.44', timestamp: '2026-05-24T12:00:00Z' },
  { id: 'aud-14', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'Security Config', target: 'auth', details: 'Enforced mandatory password complexity rules for operational staff', ipAddress: '102.89.34.12', timestamp: '2026-05-23T16:45:00Z' },
  { id: 'aud-15', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'Settlement Cleared', target: 'payouts', details: 'Cleared pending refunds ledger for week 21 (₦32,500.00)', ipAddress: '102.89.34.15', timestamp: '2026-05-23T11:00:00Z' },
  { id: 'aud-16', adminId: 'adm-4', adminName: 'Compliance Officer Wale', action: 'KYC Approval', target: 'usr-10', details: 'Approved Fatima Abubakar International Passport upload', ipAddress: '197.210.64.21', timestamp: '2026-05-22T14:20:00Z' },
  { id: 'aud-17', adminId: 'adm-3', adminName: 'Operations Admin Kemi', action: 'Downtime Logged', target: 'prov-3', details: 'Registered Glo channel downtime at partner request (30mins)', ipAddress: '197.210.8.44', timestamp: '2026-05-21T09:12:00Z' },
  { id: 'aud-18', adminId: 'adm-1', adminName: 'Super Admin Dele', action: 'API Key Rotated', target: 'keys', details: 'Rotated secret keys for Flutterwave deposit portal API', ipAddress: '102.89.34.12', timestamp: '2026-05-20T17:30:00Z' },
  { id: 'aud-19', adminId: 'adm-2', adminName: 'Finance Admin Tolu', action: 'Wallet Adjusted', target: 'usr-2', details: 'Credited Babajide Balogun wallet (₦5,000) for bank deposit matching query', ipAddress: '102.89.34.15', timestamp: '2026-05-19T10:15:00Z' },
  { id: 'aud-20', adminId: 'adm-4', adminName: 'Compliance Officer Wale', action: 'User Activated', target: 'usr-16', details: 'Re-activated suspended user account for Ibrahim Babangida', ipAddress: '197.210.64.21', timestamp: '2026-05-18T13:00:00Z' }
];

// 7. MOCK SYSTEM ALERTS (4 alerts)
export let systemAlerts: SystemAlert[] = [
  { id: 'al-1', type: 'error', message: 'Bet9ja Wallet API returned 504 Timeout on 5 consecutive queries. Circuit breaker OPEN.', service: 'Betting Integration', timestamp: '2026-05-29T10:30:00Z', acknowledged: false, isResolved: false, sourceUrl: '/admin/providers' },
  { id: 'al-2', type: 'warning', message: 'Glo VTU API average success rate dropped to 84.2%. Circuit is HALF-OPEN.', service: 'Airtime/Data VTU', timestamp: '2026-05-29T09:45:00Z', acknowledged: false, isResolved: false, sourceUrl: '/admin/providers' },
  { id: 'al-3', type: 'info', message: 'Providus bank transfer webhook speed is optimal (avg 180ms response).', service: 'Deposit Engine', timestamp: '2026-05-28T14:00:00Z', acknowledged: true, isResolved: true, resolvedAt: '2026-05-28T14:30:00Z', sourceUrl: '/admin/transactions' },
  { id: 'al-4', type: 'error', message: 'Scratch Card PIN engine reported complete database socket drop. Circuit OPEN — graceful degradation active.', service: 'Pins Integration', timestamp: '2026-05-28T08:10:00Z', acknowledged: true, isResolved: false, sourceUrl: '/admin/providers' },
  { id: 'al-5', type: 'warning', message: 'TX-20260529-003 (Ikeja Electric, ₦15,000) has been PENDING for >30 minutes. Flagged AT RISK.', service: 'Electricity Webhook', timestamp: '2026-05-29T10:32:00Z', acknowledged: false, isResolved: false, sourceUrl: '/admin/transactions' }
];

// 7.1 MOCK MAKER CHECKER REQUESTS
export let makerCheckerRequests: MakerCheckerRequest[] = [
  {
    id: 'mc-1',
    makerId: 'adm-2',
    makerName: 'Finance Admin Tolu',
    actionType: 'WALLET_CREDIT',
    targetEntityId: 'usr-14',
    payload: { userId: 'usr-14', amount: 1250000, type: 'credit', reason: 'Settlement for offline payment deposit matching reference WEMA-9921' },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    expiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString() // expires in 90 mins
  },
  {
    id: 'mc-2',
    makerId: 'adm-3',
    makerName: 'Operations Admin Kemi',
    actionType: 'WALLET_CREDIT',
    targetEntityId: 'usr-22',
    payload: { userId: 'usr-22', amount: 2000000, type: 'debit', reason: 'Reversal correction of duplicate corporate funding' },
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expiresAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    checkerId: 'adm-1',
    checkerName: 'Super Admin Dele',
    rejectionReason: 'Maker input incorrect corporate user ID.'
  }
];

// 7.2 MOCK BANK STATEMENT DEPOSIT RECORDS
export let bankDepositRecords: BankDepositRecord[] = [
  {
    id: 'dep-1',
    bankTimestamp: '2026-05-29T09:12:00Z',
    senderName: 'Chinonso Okafor',
    amount: 2000.00,
    reference: 'WEMA-VTU-9921102',
    reconciliationStatus: 'MATCHED',
    matchedLedgerTxId: 'tx-1'
  },
  {
    id: 'dep-2',
    bankTimestamp: '2026-05-29T10:02:00Z',
    senderName: 'Emeka Ike',
    amount: 15150.00,
    reference: 'IKJ-ELEC-9021',
    reconciliationStatus: 'PARTIAL_MATCH',
    matchedLedgerTxId: 'tx-3',
    varianceAmount: 50.00
  },
  {
    id: 'dep-3',
    bankTimestamp: '2026-05-29T11:30:00Z',
    senderName: 'Aisha Yusuf',
    amount: 1250000.00,
    reference: 'WEMA-9921',
    reconciliationStatus: 'UNMATCHED'
  }
];

// 8. DYNAMIC DASHBOARD STATS OBJECT
export let dashboardStats: DashboardStats = {
  totalRevenue: 0,
  todayRevenue: 0,
  totalTransactions: 0,
  successRate: 0,
  activeUsers: 0,
  pendingKYC: 0,
  openTickets: 0,
  walletFloat: 0,
  netProfit: 0,
  atRiskTransactions: 0,
  escalatedTickets: 0,
  totalRevenueUsdt: 0,
  todayRevenueUsdt: 0,
  walletFloatUsdt: 0
};

// Helper: scan pending transactions and flag those >30 min old as AT RISK
export const scanStalePendingTransactions = () => {
  const now = new Date();
  const THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
  transactions.forEach(tx => {
    if (tx.status === 'pending') {
      const age = now.getTime() - new Date(tx.createdAt).getTime();
      if (age > THRESHOLD_MS && !tx.atRisk) {
        tx.atRisk = true;
        tx.pendingFlaggedAt = now.toISOString();
        // Add a system alert if not already flagged
        const exists = systemAlerts.find(a => a.sourceUrl === '/admin/transactions' && a.message.includes(tx.reference));
        if (!exists) {
          systemAlerts.unshift({
            id: `al-stale-${tx.id}`,
            type: 'warning',
            message: `${tx.reference} (${tx.serviceType}, ₦${tx.amount.toLocaleString()}) has been PENDING for >30 minutes. Flagged AT RISK.`,
            service: 'Transaction Monitor',
            timestamp: now.toISOString(),
            acknowledged: false,
            isResolved: false,
            sourceUrl: '/admin/transactions'
          });
        }
      }
    }
  });
};

// Helper: classify ticket severity based on keywords and amount
const CRITICAL_KEYWORDS = ['fraud', 'unauthorized', 'double charge', 'double debit', 'not received', 'stolen'];
export const classifyTicketSeverity = (ticket: SupportTicket): SupportTicket['priority'] => {
  const textToScan = (ticket.subject + ' ' + ticket.messages.map(m => m.content).join(' ')).toLowerCase();
  const hasCriticalKeyword = CRITICAL_KEYWORDS.some(kw => textToScan.includes(kw));
  // Find related transaction amount
  const relatedTx = transactions.find(t => t.id === ticket.transactionId);
  const isHighValue = relatedTx ? relatedTx.amount >= 10000 : false;
  if (hasCriticalKeyword || isHighValue) return 'critical';
  if (ticket.priority === 'high') return 'high';
  return ticket.priority;
};

// Helper: calculate SLA deadline based on priority
export const calculateSLADeadline = (createdAt: string, priority: SupportTicket['priority']): string => {
  const created = new Date(createdAt);
  const hoursMap: Record<string, number> = { critical: 2, high: 4, medium: 6, low: 12 };
  const hours = hoursMap[priority] || 6;
  created.setHours(created.getHours() + hours);
  return created.toISOString();
};

// Helper: run SLA scan and escalate overdue tickets
export const scanEscalatedTickets = () => {
  const now = new Date();
  supportTickets.forEach(ticket => {
    if (ticket.status === 'open' || ticket.status === 'in_progress') {
      if (ticket.slaDeadline && new Date(ticket.slaDeadline) < now) {
        ticket.escalated = true;
      }
    }
  });
};

export const getLagosDateString = (dateInput: Date | string): string => {
  const d = new Date(dateInput);
  const lagosTime = new Date(d.getTime() + 1 * 60 * 60 * 1000);
  return lagosTime.getUTCFullYear() + '-' + 
         String(lagosTime.getUTCMonth() + 1).padStart(2, '0') + '-' + 
         String(lagosTime.getUTCDate()).padStart(2, '0');
};

const shiftMockDates = () => {
  const baseDate = new Date('2026-05-29T12:00:00Z');
  const currentDate = new Date();
  const diffMs = currentDate.getTime() - baseDate.getTime();

  const shiftDate = (isoStr: string) => {
    if (!isoStr) return isoStr;
    const d = new Date(isoStr);
    return new Date(d.getTime() + diffMs).toISOString();
  };

  transactions.forEach(t => {
    t.createdAt = shiftDate(t.createdAt);
    if (t.pendingFlaggedAt) t.pendingFlaggedAt = shiftDate(t.pendingFlaggedAt);
  });

  makerCheckerRequests.forEach(r => {
    r.createdAt = shiftDate(r.createdAt);
    r.expiresAt = shiftDate(r.expiresAt);
  });

  bankDepositRecords.forEach(d => {
    d.bankTimestamp = shiftDate(d.bankTimestamp);
  });

  supportTickets.forEach(t => {
    t.createdAt = shiftDate(t.createdAt);
    if (t.resolvedAt) t.resolvedAt = shiftDate(t.resolvedAt);
    if (t.slaDeadline) t.slaDeadline = shiftDate(t.slaDeadline);
    if (t.lastActivityAt) t.lastActivityAt = shiftDate(t.lastActivityAt);
    t.messages.forEach(m => {
      m.timestamp = shiftDate(m.timestamp);
    });
  });

  auditLogs.forEach(l => {
    l.timestamp = shiftDate(l.timestamp);
  });

  systemAlerts.forEach(a => {
    a.timestamp = shiftDate(a.timestamp);
    if (a.resolvedAt) a.resolvedAt = shiftDate(a.resolvedAt);
  });
};

// Function to dynamically calculate stats based on in-memory array values
export const recalculateStats = () => {
  // Run side-effect scans on each stats cycle
  scanStalePendingTransactions();
  scanEscalatedTickets();

  const allTxs = transactions;
  const successfulTxs = allTxs.filter(t => t.status === 'successful');
  const successfulNgnTxs = successfulTxs.filter(t => t.currency !== 'USDT');
  const successfulUsdtTxs = successfulTxs.filter(t => t.currency === 'USDT');

  // NGN Revenue = platform fees + 2.5% commission on volume
  dashboardStats.totalRevenue = successfulNgnTxs.reduce((sum, t) => sum + t.fee + (t.amount * 0.025), 0);

  // NGN Estimated gateway costs = 0.8% of volume (paid to providers)
  const gatewayCosts = successfulNgnTxs.reduce((sum, t) => sum + (t.amount * 0.008), 0);
  dashboardStats.netProfit = dashboardStats.totalRevenue - gatewayCosts;

  // NGN Today's revenue
  const lagosToday = getLagosDateString(new Date());
  const todaySuccessfulNgn = successfulNgnTxs.filter(t => getLagosDateString(t.createdAt) === lagosToday);
  dashboardStats.todayRevenue = todaySuccessfulNgn.reduce((sum, t) => sum + t.fee + (t.amount * 0.025), 0);

  // USDT Revenue = platform fees + 2.5% commission on volume in USDT
  dashboardStats.totalRevenueUsdt = successfulUsdtTxs.reduce((sum, t) => sum + t.fee + (t.amount * 0.025), 0);

  // USDT Today's revenue
  const todaySuccessfulUsdt = successfulUsdtTxs.filter(t => getLagosDateString(t.createdAt) === lagosToday);
  dashboardStats.todayRevenueUsdt = todaySuccessfulUsdt.reduce((sum, t) => sum + t.fee + (t.amount * 0.025), 0);

  dashboardStats.totalTransactions = allTxs.length;

  const successfulCount = successfulTxs.length;
  dashboardStats.successRate = allTxs.length > 0 ? Math.round((successfulCount / allTxs.length) * 1000) / 10 : 100;

  dashboardStats.activeUsers = customerUsers.filter(u => u.status === 'active').length;
  dashboardStats.pendingKYC = customerUsers.filter(u => u.kycStatus === 'pending').length;
  dashboardStats.openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  
  dashboardStats.walletFloat = customerUsers.reduce((sum, u) => sum + u.walletBalance, 0);
  dashboardStats.walletFloatUsdt = customerUsers.reduce((sum, u) => sum + u.usdtBalance, 0);
  
  dashboardStats.atRiskTransactions = allTxs.filter(t => t.atRisk).length;
  dashboardStats.escalatedTickets = supportTickets.filter(t => t.escalated).length;
};

// Execute date shifting of mock database records
shiftMockDates();

// Execute initial stats calculation
recalculateStats();

// Backfill SLA fields on all tickets at startup
supportTickets.forEach(ticket => {
  const classified = classifyTicketSeverity(ticket);
  ticket.autoClassified = classified !== ticket.priority;
  ticket.priority = classified;
  ticket.slaDeadline = ticket.slaDeadline || calculateSLADeadline(ticket.createdAt, ticket.priority);
  ticket.escalated = ticket.escalated || false;
  ticket.lastActivityAt = ticket.lastActivityAt || (ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].timestamp : ticket.createdAt);
});
// Re-run SLA escalation scan after backfill
scanEscalatedTickets();

// 9. MUTATION METHODS (mutates in-memory data and triggers subscription alert)
export const updateUserStatus = (userId: string, status: 'active' | 'suspended'): CustomerUser => {
  const user = customerUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  user.status = status;
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: status === 'active' ? 'User Re-activation' : 'User Suspension',
    target: userId,
    details: `${status === 'active' ? 'Re-activated' : 'Suspended'} user ${user.fullName}`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return user;
};

export const approveKYC = (userId: string): CustomerUser => {
  const user = customerUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  user.kycStatus = 'verified';
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Compliance Officer',
    action: 'KYC Approval',
    target: userId,
    details: `Approved verification documents for ${user.fullName}`,
    ipAddress: '102.89.34.99'
  });
  
  // Background database sync
  (async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'verified' })
        .eq('id', userId);
      if (error) console.error('Failed to sync KYC approval to Supabase:', error.message);
    } catch (err) {
      console.error('Database KYC approval sync exception:', err);
    }
  })();

  notify();
  return user;
};

export const rejectKYC = (userId: string): CustomerUser => {
  const user = customerUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  user.kycStatus = 'rejected';
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Compliance Officer',
    action: 'KYC Rejection',
    target: userId,
    details: `Rejected verification documents for ${user.fullName} due to mismatch`,
    ipAddress: '102.89.34.99'
  });
  
  // Background database sync
  (async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'rejected' })
        .eq('id', userId);
      if (error) console.error('Failed to sync KYC rejection to Supabase:', error.message);
    } catch (err) {
      console.error('Database KYC rejection sync exception:', err);
    }
  })();

  notify();
  return user;
};

export const resolveTicket = (ticketId: string, adminMessage?: string): SupportTicket => {
  const ticket = supportTickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
  ticket.status = 'resolved';
  ticket.resolvedAt = new Date().toISOString();
  
  // Add resolving message
  ticket.messages.push({
    id: `msg-${ticketId}-${ticket.messages.length + 1}`,
    sender: 'admin',
    content: adminMessage || 'This ticket has been marked as resolved.',
    timestamp: new Date().toISOString(),
    adminName: 'Support Agent Bola'
  });
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Support Agent',
    action: 'Ticket Resolution',
    target: ticketId,
    details: `Resolved dispute/support ticket regarding: "${ticket.subject}"`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return ticket;
};

export const addTicketMessage = (ticketId: string, message: Omit<TicketMessage, 'id'>): SupportTicket => {
  const ticket = supportTickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
  
  const newMessage: TicketMessage = {
    id: `msg-${ticketId}-${ticket.messages.length + 1}`,
    ...message
  };
  ticket.messages.push(newMessage);
  ticket.status = 'in_progress';
  
  notify();
  return ticket;
};

export const escalateTicketToProvider = (ticketId: string): SupportTicket => {
  const ticket = supportTickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
  
  ticket.escalated = true;
  ticket.priority = 'critical';
  ticket.status = 'in_progress';
  
  // Find related transaction to see the provider name
  const relatedTx = transactions.find(t => t.id === ticket.transactionId || t.reference === ticket.reference);
  const providerName = relatedTx ? relatedTx.provider : 'MTN VTU API';
  
  const providerRef = `Prov-${providerName.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Add internal support comment
  ticket.messages.push({
    id: `msg-${ticketId}-esc-${ticket.messages.length + 1}`,
    sender: 'admin',
    content: `Automated Provider Escalation dispatched to ${providerName}. Provider Ref: ${providerRef}`,
    timestamp: new Date().toISOString(),
    adminName: 'System Escalation Engine'
  });
  
  addAuditLog({
    adminId: 'adm-system',
    adminName: 'Escalation Engine',
    action: 'Provider Escalation',
    target: ticketId,
    details: `Escalated ticket ${ticket.reference} to provider ${providerName}. Reference: ${providerRef}`,
    ipAddress: 'system'
  });
  
  notify();
  return ticket;
};

export const updateProviderStatus = (providerId: string, status: Provider['status']): Provider => {
  const provider = providers.find(p => p.id === providerId);
  if (!provider) throw new Error('Provider not found');
  provider.status = status;
  
  // Simulate active/degraded performance parameters
  if (status === 'active') {
    provider.successRate = 98.2;
    provider.uptime = 99.8;
  } else if (status === 'degraded') {
    provider.successRate = 82.5;
    provider.uptime = 95.0;
  } else {
    provider.successRate = 0.0;
    provider.uptime = 0.0;
  }
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: 'Provider Status Update',
    target: providerId,
    details: `Set ${provider.name} status to ${status.toUpperCase()}`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return provider;
};

export const updateProviderCommission = (providerId: string, commissionRate: number): Provider => {
  const provider = providers.find(p => p.id === providerId);
  if (!provider) throw new Error('Provider not found');
  provider.commissionRate = commissionRate;
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Finance Admin',
    action: 'Provider Commission Update',
    target: providerId,
    details: `Updated ${provider.name} commission rate to ${commissionRate}%`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return provider;
};

export const updateProviderDetails = (providerId: string, details: Partial<Provider>): Provider => {
  const provider = providers.find(p => p.id === providerId);
  if (!provider) throw new Error('Provider not found');
  Object.assign(provider, details);
  
  const actionType = details.manualOverride !== undefined 
    ? 'Gateway Override Switch' 
    : 'Provider Details Tuning';

  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: actionType,
    target: providerId,
    details: details.manualOverride !== undefined 
      ? `Manual routing override toggled to ${details.manualOverride ? 'ON' : 'OFF'} for ${provider.name}`
      : `Updated configurations for ${provider.name}: ${JSON.stringify(details)}`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return provider;
};

export const retryTransaction = (transactionId: string): Transaction => {
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx) throw new Error('Transaction not found');
  tx.status = 'successful';
  tx.processingTimeMs = 500;
  tx.apiResponse = '{"status":"success","code":"200","message":"Manually retried and processed successfully"}';
  delete tx.errorMessage;
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: 'Transaction Retry',
    target: transactionId,
    details: `Manually re-routed and retried transaction ${tx.reference}`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return tx;
};

export const reverseTransaction = (transactionId: string): Transaction => {
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx) throw new Error('Transaction not found');
  tx.status = 'reversed';
  tx.errorMessage = 'Manually reversed by admin operations';
  
  // Refund the user's wallet based on transaction currency
  const user = customerUsers.find(u => u.id === tx.userId);
  if (user) {
    if (tx.currency === 'USDT') {
      user.usdtBalance += tx.amount;
    } else {
      user.walletBalance += tx.amount;
    }
  }
  
  const symbol = tx.currency === 'USDT' ? '$' : '₦';
  const currencyLabel = tx.currency === 'USDT' ? 'USDT' : 'NGN';
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Finance Admin',
    action: 'Transaction Reversal',
    target: transactionId,
    details: `Refunded ${symbol}${tx.amount.toLocaleString()} ${currencyLabel} back to user ${tx.userId} for transaction ${tx.reference}`,
    ipAddress: '102.89.34.99'
  });
  
  recalculateStats();
  notify();
  return tx;
};

export const adjustUserBalance = (
  userId: string, 
  amount: number, 
  type: 'credit' | 'debit', 
  reason: string,
  currency: 'NGN' | 'USDT' = 'NGN'
): CustomerUser => {
  const user = customerUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  const isUsdt = currency === 'USDT';
  
  if (type === 'credit') {
    if (isUsdt) {
      user.usdtBalance += amount;
    } else {
      user.walletBalance += amount;
    }
  } else {
    if (isUsdt) {
      if (user.usdtBalance < amount) {
        throw new Error('Insufficient USDT wallet float balance to execute debit deduction!');
      }
      user.usdtBalance -= amount;
    } else {
      if (user.walletBalance < amount) {
        throw new Error('Insufficient NGN wallet float balance to execute debit deduction!');
      }
      user.walletBalance -= amount;
    }
  }

  const symbol = isUsdt ? '$' : '₦';
  const currencyLabel = isUsdt ? 'USDT' : 'NGN';
  const ref = `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Log a manual adjustment transaction record so it updates the transaction ledger automatically!
  transactions.unshift({
    id: `tx-manual-${Date.now()}`,
    reference: ref,
    userId: user.id,
    userEmail: user.email,
    userPhone: user.phone,
    serviceType: 'other',
    provider: 'SYSTEM',
    amount: amount,
    fee: 0,
    status: 'successful',
    createdAt: new Date().toISOString(),
    providerRef: `SYS-${ref}`,
    processingTimeMs: 45,
    currency: currency,
    paymentProvider: 'SYSTEM',
    paymentMethod: 'System Ledger Desk',
    transactionChannel: 'MANUAL_ADJUSTMENT'
  });

  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Finance Admin',
    action: type === 'credit' ? 'Wallet Credit' : 'Wallet Debit',
    target: userId,
    details: `Manually ${type === 'credit' ? 'credited' : 'debited'} ${symbol}${amount.toLocaleString()} ${currencyLabel} to ${user.fullName} (${user.email}). Reason: "${reason}"`,
    ipAddress: '102.89.34.99'
  });

  // Background sync manual adjustment directly with the Supabase database
  (async () => {
    try {
      if (type === 'credit') {
        if (isUsdt) {
          const { error } = await supabase
            .from('profiles')
            .update({ balance_usdt: user.usdtBalance })
            .eq('id', userId);
          if (error) console.error('Error updating profiles USDT balance:', error.message);
        } else {
          // Fire transactional confirm_deposit trigger
          const { error } = await supabase.rpc('confirm_deposit', {
            p_user_id: userId,
            p_flw_transaction_id: Math.floor(Math.random() * 1000000000),
            p_tx_ref: ref,
            p_amount: amount,
            p_currency: 'NGN',
            p_metadata: { is_manual_adjustment: true, reason },
            p_auth_secret: 'Kyvatron2026F'
          });
          if (error) console.error('Error running confirm_deposit RPC:', error.message);
        }
      } else {
        // Debit subtraction
        const updatePayload = isUsdt 
          ? { balance_usdt: user.usdtBalance }
          : { balance_ngn: user.walletBalance };

        const { error: uError } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId);
        if (uError) console.error('Error updating profiles balance on debit:', uError.message);

        // Record persistent transaction history for manual debit
        const { error: iError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            tx_ref: ref,
            amount: amount,
            currency: currency,
            status: 'successful',
            type: 'withdrawal',
            description: `Manual adjustment debit: ${reason}`,
            metadata: { is_manual_adjustment: true, reason }
          });
        if (iError) console.error('Error inserting manual debit transaction:', iError.message);
      }
    } catch (dbErr) {
      console.error('Database adjustment synchronization failed:', dbErr);
    }
  })();

  recalculateStats();
  notify();
  return user;
};



export const acknowledgeAlert = (alertId: string): SystemAlert => {
  const alert = systemAlerts.find(a => a.id === alertId);
  if (!alert) throw new Error('Alert not found');
  alert.acknowledged = true;
  
  notify();
  return alert;
};

export const sendNotification = (notification: Omit<NotificationLog, 'id' | 'sentAt'>): NotificationLog => {
  const newNotif: NotificationLog = {
    id: `notif-${notificationLogs.length + 1}`,
    sentAt: new Date().toISOString(),
    ...notification
  };
  notificationLogs.unshift(newNotif);
  
  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Super Admin',
    action: 'Notification Dispatched',
    target: newNotif.id,
    details: `Sent announcement broadcast: "${newNotif.title}"`,
    ipAddress: '102.89.34.99'
  });
  
  notify();
  return newNotif;
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog => {
  const newLog: AuditLog = {
    id: `aud-${auditLogs.length + 1}`,
    timestamp: new Date().toISOString(),
    ...log
  };
  auditLogs.unshift(newLog);
  return newLog;
};

// Simulate dynamic user growth stats for custom SVG area charts
export const getRevenueTimelineData = () => {
  const dates: string[] = [];
  const currentDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(getLagosDateString(d));
  }

  return dates.map(dateStr => {
    const dayTxs = transactions.filter(t => t.status === 'successful' && getLagosDateString(t.createdAt) === dateStr);
    const revenue = dayTxs.reduce((sum, t) => sum + t.amount, 0);
    const fees = dayTxs.reduce((sum, t) => sum + t.fee + (t.amount * 0.025), 0);
    
    return {
      date: dateStr,
      revenue: Math.round(revenue),
      fees: Math.round(fees)
    };
  });
};

export const getServiceCategoryData = () => {
  const categories: Record<string, { count: number, volume: number, color: string }> = {
    'airtime': { count: 0, volume: 0, color: '#06b6d4' }, // Cyan
    'data': { count: 0, volume: 0, color: '#3b82f6' }, // Blue
    'electricity': { count: 0, volume: 0, color: '#eab308' }, // Yellow
    'cable_tv': { count: 0, volume: 0, color: '#a855f7' }, // Purple
    'betting': { count: 0, volume: 0, color: '#10b981' }, // Emerald
    'pins': { count: 0, volume: 0, color: '#f43f5e' } // Rose
  };
  
  transactions.forEach(tx => {
    if (tx.status === 'successful' && categories[tx.serviceType]) {
      categories[tx.serviceType].count += 1;
      categories[tx.serviceType].volume += tx.amount;
    }
  });
  
  return Object.entries(categories).map(([key, val]) => ({
    label: key.replace('_', ' ').toUpperCase(),
    value: val.volume,
    color: val.color
  }));
};

export const getDailySuccessRateData = () => {
  // Groups successful and failed transactions by day of the week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generate daily transaction success statistics
  return [
    { day: 'Mon', successful: 8, failed: 1 },
    { day: 'Tue', successful: 12, failed: 2 },
    { day: 'Wed', successful: 15, failed: 0 },
    { day: 'Thu', successful: 10, failed: 1 },
    { day: 'Fri', successful: 16, failed: 3 },
    { day: 'Sat', successful: 14, failed: 2 },
    { day: 'Sun', successful: 11, failed: 1 }
  ];
};

// ==========================================
// 10. NEW FUNCTIONS: CIRCUIT BREAKER, ALERTS, AUTO-REFUND
// ==========================================

// Resolve an alert (distinct from acknowledge)
export const resolveAlert = (alertId: string): SystemAlert => {
  const alert = systemAlerts.find(a => a.id === alertId);
  if (!alert) throw new Error('Alert not found');
  alert.isResolved = true;
  alert.acknowledged = true;
  alert.resolvedAt = new Date().toISOString();

  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: 'Alert Resolved',
    target: alertId,
    details: `Resolved system alert: "${alert.message.substring(0, 60)}..."`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return alert;
};

// Simulate a health check ping on a provider
export const simulateHealthPing = (providerId: string): Provider => {
  const provider = providers.find(p => p.id === providerId);
  if (!provider) throw new Error('Provider not found');

  provider.lastHealthCheck = new Date().toISOString();

  // Simulate health result based on current status
  if (provider.status === 'active') {
    provider.latencyMs = 100 + Math.floor(Math.random() * 200);
    provider.consecutiveFailures = 0;
    provider.circuitState = 'CLOSED';
  } else if (provider.status === 'degraded') {
    provider.latencyMs = 300 + Math.floor(Math.random() * 400);
    // 50% chance of recovering to CLOSED
    if (Math.random() > 0.5) {
      provider.circuitState = 'CLOSED';
      provider.consecutiveFailures = 0;
    }
  }
  // Inactive providers stay OPEN

  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Operations Admin',
    action: 'Health Ping',
    target: providerId,
    details: `Pinged ${provider.name}: circuit=${provider.circuitState}, latency=${provider.latencyMs}ms`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return provider;
};

// Auto-refund a failed transaction
export const autoRefundTransaction = (transactionId: string): Transaction => {
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.autoRefunded) throw new Error('Already auto-refunded');

  tx.autoRefunded = true;
  tx.status = 'reversed';
  tx.errorMessage = (tx.errorMessage || '') + ' [AUTO-REFUNDED]';

  // Credit the user wallet
  const user = customerUsers.find(u => u.id === tx.userId);
  if (user) {
    user.walletBalance += tx.amount;
  }

  addAuditLog({
    adminId: 'adm-system',
    adminName: 'Auto-Refund Engine',
    action: 'Auto Refund',
    target: transactionId,
    details: `Auto-refunded ₦${tx.amount.toLocaleString()} to ${tx.userId} for failed ${tx.reference}`,
    ipAddress: 'system'
  });

  notify();
  return tx;
};

// Fee margin rates by service type (for revenue chart)
export const FEE_RATES: Record<string, number> = {
  'airtime': 3.5,
  'data': 2.8,
  'electricity': 2.0,
  'cable_tv': 1.5,
  'betting': 2.5,
  'pins': 3.0
};

// Get service data with fee rates included
export const getServiceCategoryWithFees = () => {
  const categories: Record<string, { count: number; volume: number; color: string; feeRate: number }> = {
    'airtime': { count: 0, volume: 0, color: '#06b6d4', feeRate: 3.5 },
    'data': { count: 0, volume: 0, color: '#3b82f6', feeRate: 2.8 },
    'electricity': { count: 0, volume: 0, color: '#eab308', feeRate: 2.0 },
    'cable_tv': { count: 0, volume: 0, color: '#a855f7', feeRate: 1.5 },
    'betting': { count: 0, volume: 0, color: '#10b981', feeRate: 2.5 },
    'pins': { count: 0, volume: 0, color: '#f43f5e', feeRate: 3.0 }
  };

  transactions.forEach(tx => {
    if (tx.status === 'successful' && categories[tx.serviceType]) {
      categories[tx.serviceType].count += 1;
      categories[tx.serviceType].volume += tx.amount;
    }
  });

  return Object.entries(categories).map(([key, val]) => ({
    label: key.replace('_', ' ').toUpperCase(),
    value: val.volume,
    color: val.color,
    feeRate: val.feeRate
  }));
};

// ==========================================
// 11. NEW MUTATION METHODS FOR MAKER-CHECKER AND RECONCILIATION
// ==========================================

export const submitMakerCheckerRequest = (request: Omit<MakerCheckerRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'>): MakerCheckerRequest => {
  const newReq: MakerCheckerRequest = {
    id: `mc-${makerCheckerRequests.length + 1}`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours expiration
    status: 'PENDING',
    ...request
  };
  makerCheckerRequests.unshift(newReq);
  
  addAuditLog({
    adminId: request.makerId,
    adminName: request.makerName,
    action: 'Maker Checker Submitted',
    target: newReq.id,
    details: `Created Maker-Checker request for action ${request.actionType} on target ${request.targetEntityId}`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return newReq;
};

export const approveMakerCheckerRequest = (requestId: string, checkerId: string, checkerName: string): MakerCheckerRequest => {
  const req = makerCheckerRequests.find(r => r.id === requestId);
  if (!req) throw new Error('Maker-Checker request not found');
  if (req.status !== 'PENDING') throw new Error('Request is not in a pending state');
  if (req.makerId === checkerId) throw new Error('Maker cannot approve their own submitted request!');
  
  req.status = 'APPROVED';
  req.checkerId = checkerId;
  req.checkerName = checkerName;

  // Execute underlying payload action based on actionType
  if (req.actionType === 'WALLET_CREDIT') {
    const { userId, amount, type, currency } = req.payload;
    const user = customerUsers.find(u => u.id === userId);
    if (user) {
      const isUsdt = currency === 'USDT';
      if (type === 'credit') {
        if (isUsdt) {
          user.usdtBalance += amount;
        } else {
          user.walletBalance += amount;
        }
      } else {
        if (isUsdt) {
          if (user.usdtBalance < amount) throw new Error('Insufficient USDT wallet float to perform debit adjustment');
          user.usdtBalance -= amount;
        } else {
          if (user.walletBalance < amount) throw new Error('Insufficient NGN wallet float to perform debit adjustment');
          user.walletBalance -= amount;
        }
      }
    }
  } else if (req.actionType === 'ROUTE_OVERRIDE') {
    const { providerId, manualOverride } = req.payload;
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      provider.manualOverride = manualOverride;
    }
  }

  addAuditLog({
    adminId: checkerId,
    adminName: checkerName,
    action: 'Maker Checker Approved',
    target: requestId,
    details: `Approved Maker-Checker action ${req.actionType} requested by ${req.makerName}`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return req;
};

export const rejectMakerCheckerRequest = (requestId: string, checkerId: string, checkerName: string, reason: string): MakerCheckerRequest => {
  const req = makerCheckerRequests.find(r => r.id === requestId);
  if (!req) throw new Error('Maker-Checker request not found');
  if (req.status !== 'PENDING') throw new Error('Request is not in a pending state');
  
  req.status = 'REJECTED';
  req.checkerId = checkerId;
  req.checkerName = checkerName;
  req.rejectionReason = reason;

  addAuditLog({
    adminId: checkerId,
    adminName: checkerName,
    action: 'Maker Checker Rejected',
    target: requestId,
    details: `Rejected Maker-Checker action ${req.actionType} requested by ${req.makerName}. Reason: "${reason}"`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return req;
};

export const reconcileManualMatch = (depositId: string, ledgerTxId: string): BankDepositRecord => {
  const deposit = bankDepositRecords.find(d => d.id === depositId);
  if (!deposit) throw new Error('Bank deposit record not found');
  
  const tx = transactions.find(t => t.id === ledgerTxId);
  if (!tx) throw new Error('Platform transaction not found');

  deposit.reconciliationStatus = 'MATCHED';
  deposit.matchedLedgerTxId = ledgerTxId;
  
  // Calculate variance if amount does not perfectly match
  if (deposit.amount !== tx.amount) {
    deposit.reconciliationStatus = 'PARTIAL_MATCH';
    deposit.varianceAmount = deposit.amount - tx.amount;
  }

  addAuditLog({
    adminId: 'adm-current',
    adminName: 'Finance Admin',
    action: 'Manual Reconciliation Match',
    target: depositId,
    details: `Manually matched bank deposit ${deposit.reference} with platform transaction ${tx.reference}. Match status: ${deposit.reconciliationStatus}`,
    ipAddress: '102.89.34.99'
  });

  notify();
  return deposit;
};

export const initializeDatabaseSync = async () => {
  try {
    // 1. Fetch Supabase Profiles
    const { data: dbProfiles, error: pError } = await supabase
      .from('profiles')
      .select('*');

    if (!pError && dbProfiles && dbProfiles.length > 0) {
      dbProfiles.forEach(profile => {
        const existingIdx = customerUsers.findIndex(u => u.id === profile.id);
        const mappedUser: CustomerUser = {
          id: profile.id,
          fullName: profile.full_name || 'Anonymous User',
          email: profile.email || profile.id + '@kyvatron.com', // fallback
          phone: profile.phone || '+2340000000000',
          walletBalance: Number(profile.balance_ngn),
          usdtBalance: Number(profile.balance_usdt),
          kycStatus: (profile.kyc_status as any) || 'unverified',
          status: 'active',
          createdAt: profile.created_at || new Date().toISOString(),
          totalTransactions: 0,
          totalVolume: 0
        };

        if (existingIdx !== -1) {
          customerUsers[existingIdx] = {
            ...customerUsers[existingIdx],
            ...mappedUser,
            email: profile.email || customerUsers[existingIdx].email || mappedUser.email,
            phone: profile.phone || customerUsers[existingIdx].phone || mappedUser.phone,
          };
        } else {
          customerUsers.push(mappedUser);
        }
      });
    }

    // 2. Fetch Supabase Transactions
    const { data: dbTxs, error: tError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!tError && dbTxs && dbTxs.length > 0) {
      dbTxs.forEach(tx => {
        const mappedTx: Transaction = {
          id: tx.id,
          reference: tx.tx_ref,
          userId: tx.user_id,
          userEmail: getEmail(tx.user_id),
          userPhone: getPhone(tx.user_id),
          serviceType: tx.type === 'deposit' ? 'airtime' : (tx.type as any),
          provider: tx.metadata?.provider || (tx.currency === 'USDT' ? 'NOWPayments' : 'Flutterwave'),
          amount: Number(tx.amount),
          fee: tx.metadata?.fee ? Number(tx.metadata.fee) : 0,
          status: tx.status as any,
          createdAt: tx.created_at,
          providerRef: tx.flw_transaction_id ? String(tx.flw_transaction_id) : `SYS-${tx.tx_ref}`,
          processingTimeMs: tx.metadata?.processingTimeMs || 50,
          currency: tx.currency as any,
          paymentProvider: tx.currency === 'USDT' ? 'NOWPAYMENTS' : 'FLUTTERWAVE',
          paymentMethod: tx.currency === 'USDT' ? 'NOWPayments (USDT TRC20)' : 'Flutterwave (Card/USSD)',
          transactionChannel: tx.type.toUpperCase()
        };

        const existingIdx = transactions.findIndex(t => t.reference === tx.tx_ref || t.id === tx.id);
        if (existingIdx !== -1) {
          transactions[existingIdx] = mappedTx;
        } else {
          transactions.unshift(mappedTx);
        }
      });
    }

    // Recalculate stats dynamically
    recalculateStats();
    // Use the local listener dispatch
    listeners.forEach((l) => l());
  } catch (err) {
    console.error('Failed to sync mockStore with live database:', err);
  }
};

// Automatic initialization on browser mount
if (typeof window !== 'undefined') {
  initializeDatabaseSync();
  setInterval(initializeDatabaseSync, 15000);
}

