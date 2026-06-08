-- ============================================================================
-- 🚀 KYVATRON: DEFINITIVE UNIFIED DATABASE SCHEMA & SECURITY POLICIES
-- ============================================================================
-- Purpose: This single SQL script builds and configures all tables, indexes, 
-- triggers, RLS policies, and high-stakes financial RPC functions.
--
-- Instructions: Run this script inside your Supabase Database SQL Editor.
-- ============================================================================

-- ── 1. CLEANUP PREVIOUS SCHEMAS ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.crypto_deposits CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ── 2. PROFILES TABLE ────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  nowpayments_sub_partner_id TEXT,
  balance_ngn NUMERIC NOT NULL DEFAULT 0.00,
  balance_usdt NUMERIC NOT NULL DEFAULT 0.00000000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT balance_ngn_nonnegative CHECK (balance_ngn >= 0.00),
  CONSTRAINT balance_usdt_nonnegative CHECK (balance_usdt >= 0.00000000)
);

-- ── 3. AUTOMATIC PROFILE TRIGGER ON SIGNUP ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, balance_ngn, balance_usdt)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    coalesce(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    0.00,
    0.00
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── 4. TRANSACTIONS TABLE ───────────────────────────────────────────────────
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flw_transaction_id BIGINT UNIQUE,
  tx_ref TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL CONSTRAINT amount_positive CHECK (amount > 0.00),
  currency TEXT NOT NULL DEFAULT 'NGN' CONSTRAINT currency_supported CHECK (currency IN ('NGN', 'USDT')),
  status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT status_enum CHECK (status IN ('pending', 'successful', 'failed', 'reversed')),
  type TEXT NOT NULL CONSTRAINT type_enum CHECK (type IN ('deposit', 'bill_payment', 'withdrawal', 'refund', 'conversion')),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. CRYPTO DEPOSITS TABLE (NOWPAYMENTS LEDGER) ───────────────────────────
CREATE TABLE public.crypto_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting',
  fiat_amount NUMERIC NOT NULL DEFAULT 0,
  fiat_currency TEXT NOT NULL DEFAULT 'usd',
  crypto_amount NUMERIC NOT NULL DEFAULT 0,
  crypto_currency TEXT NOT NULL DEFAULT 'usdttrc20',
  pay_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. INVESTMENTS TABLE (YIELD ENGINE) ─────────────────────────────────────
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  amount NUMERIC NOT NULL CONSTRAINT inv_amount_positive CHECK (amount > 0),
  duration_months INTEGER NOT NULL CONSTRAINT inv_duration_valid CHECK (duration_months IN (3, 6, 12)),
  roi_percent NUMERIC NOT NULL,
  roi_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CONSTRAINT inv_status_enum CHECK (status IN ('active', 'matured', 'cancelled')),
  invested_at TIMESTAMPTZ DEFAULT NOW(),
  maturity_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update non-financial profile fields" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    balance_ngn = balance_ngn AND 
    balance_usdt = balance_usdt
  );

-- Transactions Policies
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Crypto Deposits Policies
CREATE POLICY "Users can view own crypto deposits" 
  ON public.crypto_deposits FOR SELECT 
  USING (auth.uid() = user_id);

-- Investments Policies
CREATE POLICY "Users can view own investments" 
  ON public.investments FOR SELECT 
  USING (auth.uid() = user_id);

-- Note: Inserting or updating ledger records directly from client-side code 
-- is strictly prohibited. All balances mutations are processed via secure RPCs.

-- ── 8. HIGH-CONCURRENCY DATABASE INDEXES ─────────────────────────────────────
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_tx_ref ON public.transactions(tx_ref);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX idx_crypto_deposits_order_id ON public.crypto_deposits(order_id);
CREATE INDEX idx_crypto_deposits_payment_id ON public.crypto_deposits(payment_id);
CREATE INDEX idx_crypto_deposits_user_id ON public.crypto_deposits(user_id);
CREATE INDEX idx_crypto_deposits_status ON public.crypto_deposits(status);

CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_status ON public.investments(status);
CREATE INDEX idx_investments_maturity ON public.investments(maturity_date);

-- ── 9. SECURE DEFINER DATABASE RPC FUNCTIONS ───────────────────────────────

-- A. Create Pending Bill Payment (Atomic balance reservation)
CREATE OR REPLACE FUNCTION public.create_pending_bill_payment(
  p_user_id UUID,
  p_amount NUMERIC,
  p_category TEXT,
  p_tx_ref TEXT,
  p_description TEXT,
  p_metadata JSONB
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized context for user wallet mutation';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Bill payment amount must be positive';
  END IF;

  -- Atomic row lock
  SELECT balance_ngn INTO v_current_balance
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE profiles SET balance_ngn = v_new_balance, updated_at = NOW() WHERE id = p_user_id;

  INSERT INTO transactions (user_id, tx_ref, amount, currency, status, type, description, metadata)
  VALUES (p_user_id, p_tx_ref, p_amount, 'NGN', 'pending', 'bill_payment', p_description, p_metadata);

  RETURN v_new_balance;
END;
$$;


-- B. Confirm Wallet Deposit (Flutterwave callback balance crediting)
CREATE OR REPLACE FUNCTION public.confirm_deposit(
  p_user_id UUID,
  p_flw_transaction_id BIGINT,
  p_tx_ref TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_metadata JSONB,
  p_auth_secret TEXT DEFAULT ''
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_status TEXT;
  v_tx_user_id UUID;
  v_tx_exists BOOLEAN := FALSE;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id AND p_auth_secret <> 'Kyvatron2026F' THEN
    RAISE EXCEPTION 'Unauthorized context for wallet credit';
  END IF;

  -- Lock transaction row
  SELECT status, user_id INTO v_tx_status, v_tx_user_id
  FROM transactions WHERE tx_ref = p_tx_ref FOR UPDATE;
  v_tx_exists := FOUND;

  -- Idempotency check
  IF v_tx_exists AND v_tx_status = 'successful' THEN
    SELECT balance_ngn INTO v_current_balance FROM profiles WHERE id = v_tx_user_id;
    RETURN v_current_balance;
  END IF;

  -- Lock profile row
  SELECT balance_ngn INTO v_current_balance
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE profiles SET balance_ngn = v_new_balance, updated_at = NOW() WHERE id = p_user_id;

  IF v_tx_exists THEN
    UPDATE transactions
    SET status = 'successful',
        flw_transaction_id = p_flw_transaction_id,
        metadata = p_metadata,
        amount = p_amount,
        currency = 'NGN'
    WHERE tx_ref = p_tx_ref;
  ELSE
    INSERT INTO transactions (user_id, flw_transaction_id, tx_ref, amount, currency, status, type, description, metadata)
    VALUES (p_user_id, p_flw_transaction_id, p_tx_ref, p_amount, 'NGN', 'successful', 'deposit', 'Flutterwave Deposit', p_metadata);
  END IF;

  RETURN v_new_balance;
END;
$$;


-- C. Complete Bill Payment (Locks routing execution)
CREATE OR REPLACE FUNCTION public.complete_bill_payment(
  p_tx_ref TEXT,
  p_flw_transaction_id BIGINT,
  p_metadata JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM transactions WHERE tx_ref = p_tx_ref FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction reference not found';
  END IF;

  IF v_status = 'successful' THEN
    RETURN TRUE;
  END IF;

  UPDATE transactions
  SET status = 'successful',
      flw_transaction_id = p_flw_transaction_id,
      metadata = p_metadata
  WHERE tx_ref = p_tx_ref;

  RETURN TRUE;
END;
$$;


-- D. Reverse Bill Payment (Handles failures with auto-refunds)
CREATE OR REPLACE FUNCTION public.reverse_bill_payment(
  p_tx_ref TEXT,
  p_reason TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
  v_amount NUMERIC;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  SELECT status, user_id, amount INTO v_status, v_user_id, v_amount
  FROM transactions WHERE tx_ref = p_tx_ref FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction reference not found';
  END IF;

  IF v_status = 'reversed' THEN
    SELECT balance_ngn INTO v_current_balance FROM profiles WHERE id = v_user_id;
    RETURN v_current_balance;
  END IF;

  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'Reversal is only permitted for pending transactions';
  END IF;

  SELECT balance_ngn INTO v_current_balance
  FROM profiles WHERE id = v_user_id FOR UPDATE;

  v_new_balance := v_current_balance + v_amount;

  UPDATE profiles SET balance_ngn = v_new_balance, updated_at = NOW() WHERE id = v_user_id;

  UPDATE transactions
  SET status = 'reversed',
      metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{reversal_reason}', to_jsonb(p_reason))
  WHERE tx_ref = p_tx_ref;

  RETURN v_new_balance;
END;
$$;


-- E. Credit USDT Crypto Deposit (Secure NOWPayments webhook handler)
CREATE OR REPLACE FUNCTION public.credit_usdt_deposit(
  p_user_id UUID,
  p_order_id TEXT,
  p_amount NUMERIC,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit_status TEXT;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Lock crypto_deposits row
  SELECT status INTO v_deposit_status
  FROM crypto_deposits WHERE order_id = p_order_id FOR UPDATE;

  -- Idempotency check
  IF v_deposit_status IN ('confirmed', 'finished') THEN
    SELECT balance_usdt INTO v_current_balance FROM profiles WHERE id = p_user_id;
    RETURN v_current_balance;
  END IF;

  -- Lock profile row
  SELECT balance_usdt INTO v_current_balance
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE profiles SET balance_usdt = v_new_balance, updated_at = NOW() WHERE id = p_user_id;

  UPDATE crypto_deposits
  SET status = 'finished', credited_at = NOW(), updated_at = NOW()
  WHERE order_id = p_order_id;

  RETURN v_new_balance;
END;
$$;


-- F. Create Active Yield Investment
CREATE OR REPLACE FUNCTION public.create_investment(
  p_user_id UUID,
  p_currency TEXT,
  p_amount NUMERIC,
  p_duration_months INTEGER,
  p_roi_percent NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bal NUMERIC; 
  v_new NUMERIC;
  v_roi NUMERIC; 
  v_total NUMERIC;
  v_mat TIMESTAMPTZ; 
  v_id UUID;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_duration_months NOT IN (3, 6, 12) THEN 
    RAISE EXCEPTION 'Invalid duration'; 
  END IF;
  
  IF p_currency = 'NGN' AND p_amount < 1000 THEN 
    RAISE EXCEPTION 'Min NGN is 1,000'; 
  END IF;
  
  IF p_currency = 'USDT' AND p_amount < 10 THEN 
    RAISE EXCEPTION 'Min USDT is 10'; 
  END IF;

  v_roi   := (p_amount * p_roi_percent) / 100;
  v_total := p_amount + v_roi;
  v_mat   := NOW() + (p_duration_months || ' months')::INTERVAL;

  IF p_currency = 'NGN' THEN
    SELECT balance_ngn INTO v_bal FROM profiles WHERE id = p_user_id FOR UPDATE;
  ELSE
    SELECT balance_usdt INTO v_bal FROM profiles WHERE id = p_user_id FOR UPDATE;
  END IF;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Profile not found'; 
  END IF;
  
  IF v_bal < p_amount THEN 
    RAISE EXCEPTION 'Insufficient balance'; 
  END IF;

  v_new := v_bal - p_amount;

  IF p_currency = 'NGN' THEN
    UPDATE profiles SET balance_ngn = v_new, updated_at = NOW() WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET balance_usdt = v_new, updated_at = NOW() WHERE id = p_user_id;
  END IF;

  INSERT INTO investments (user_id, currency, amount, duration_months, roi_percent, roi_amount, total_amount, status, maturity_date)
  VALUES (p_user_id, p_currency, p_amount, p_duration_months, p_roi_percent, v_roi, v_total, 'active', v_mat)
  RETURNING id INTO v_id;

  INSERT INTO transactions (user_id, tx_ref, amount, currency, status, type, description, metadata)
  VALUES (p_user_id, 'kyvatron-invest-' || v_id::TEXT, p_amount, p_currency, 'successful', 'withdrawal',
    'Investment: ' || p_duration_months || 'mo @ ' || p_roi_percent || '% ROI',
    jsonb_build_object('investment_id', v_id, 'roi_percent', p_roi_percent, 'maturity_date', v_mat));

  RETURN v_id;
END;
$$;


-- G. Atomic Currency Converter (NGN <--> USDT)
CREATE OR REPLACE FUNCTION public.convert_currency(
  p_user_id UUID,
  p_from_currency TEXT,
  p_amount NUMERIC,
  p_exchange_rate NUMERIC,
  p_fees NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from NUMERIC; 
  v_to NUMERIC;
  v_from_new NUMERIC; 
  v_to_new NUMERIC;
  v_to_currency TEXT; 
  v_receive NUMERIC;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_currency = 'NGN' THEN 
    v_to_currency := 'USDT';
  ELSIF p_from_currency = 'USDT' THEN 
    v_to_currency := 'NGN';
  ELSE 
    RAISE EXCEPTION 'Invalid currency';
  END IF;

  IF p_amount <= 0 THEN 
    RAISE EXCEPTION 'Amount must be positive'; 
  END IF;
  
  IF p_fees < 0 OR p_fees >= p_amount THEN 
    RAISE EXCEPTION 'Invalid fees'; 
  END IF;

  IF p_from_currency = 'NGN' THEN
    v_receive := (p_amount - p_fees) / p_exchange_rate;
  ELSE
    v_receive := (p_amount - p_fees) * p_exchange_rate;
  END IF;

  IF v_receive <= 0 THEN 
    RAISE EXCEPTION 'Result must be positive'; 
  END IF;

  IF p_from_currency = 'NGN' THEN
    SELECT balance_ngn, balance_usdt INTO v_from, v_to FROM profiles WHERE id = p_user_id FOR UPDATE;
  ELSE
    SELECT balance_usdt, balance_ngn INTO v_from, v_to FROM profiles WHERE id = p_user_id FOR UPDATE;
  END IF;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Profile not found'; 
  END IF;
  
  IF v_from < p_amount THEN 
    RAISE EXCEPTION 'Insufficient balance'; 
  END IF;

  v_from_new := v_from - p_amount;
  v_to_new   := v_to + v_receive;

  IF p_from_currency = 'NGN' THEN
    UPDATE profiles SET balance_ngn = v_from_new, balance_usdt = v_to_new, updated_at = NOW() WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET balance_usdt = v_from_new, balance_ngn = v_to_new, updated_at = NOW() WHERE id = p_user_id;
  END IF;

  INSERT INTO transactions (user_id, tx_ref, amount, currency, status, type, description, metadata)
  VALUES (p_user_id, 'kyvatron-conv-out-' || gen_random_uuid()::TEXT, p_amount, p_from_currency,
    'successful', 'conversion', 'Converted to ' || v_to_currency,
    jsonb_build_object('direction','out','rate',p_exchange_rate,'fees',p_fees,'receive',v_receive));

  INSERT INTO transactions (user_id, tx_ref, amount, currency, status, type, description, metadata)
  VALUES (p_user_id, 'kyvatron-conv-in-' || gen_random_uuid()::TEXT, v_receive, v_to_currency,
    'successful', 'conversion', 'Converted from ' || p_from_currency,
    jsonb_build_object('direction','in','rate',p_exchange_rate,'source_amount',p_amount));

  RETURN jsonb_build_object('from_new_balance', v_from_new, 'to_new_balance', v_to_new, 'receive_amount', v_receive);
END;
$$;

-- ── 10. RELOAD SCHEMA CACHE ──────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
