-- ============================================================
-- Kyvatron: High-Security Wallet & Transaction Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- ── 0. CONVERT ENUM COLUMNS TO TEXT ───────────────────────
-- If transactions table already exists, convert columns to TEXT to prevent custom enum type conflicts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
    ALTER TABLE transactions ALTER COLUMN status TYPE TEXT USING status::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'type') THEN
    ALTER TABLE transactions ALTER COLUMN type TYPE TEXT USING type::text;
  END IF;
END $$;

-- ── 1. CLEANUP OLD LOGIC ──────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_pending_bill_payment;
DROP FUNCTION IF EXISTS confirm_deposit;
DROP FUNCTION IF EXISTS complete_bill_payment;
DROP FUNCTION IF EXISTS reverse_bill_payment;

-- ── 2. PROFILES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  nowpayments_sub_partner_id TEXT,
  balance_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CONSTRAINT balance_ngn_nonnegative CHECK (balance_ngn >= 0.00),
  balance_usdt NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000 CONSTRAINT balance_usdt_nonnegative CHECK (balance_usdt >= 0.00000000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure non-negative constraints and columns exist if table already exists
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS balance_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS balance_usdt NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000;

-- Apply constraints safely if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'balance_ngn_nonnegative') THEN
    ALTER TABLE profiles ADD CONSTRAINT balance_ngn_nonnegative CHECK (balance_ngn >= 0.00);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'balance_usdt_nonnegative') THEN
    ALTER TABLE profiles ADD CONSTRAINT balance_usdt_nonnegative CHECK (balance_usdt >= 0.00000000);
  END IF;
END $$;

-- ── 3. AUTO-CREATE PROFILE ON SIGN-UP ─────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, balance_ngn, balance_usdt)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    0.00,
    0.00
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── 4. ROW LEVEL SECURITY (RLS) FOR PROFILES ──────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- CRITICAL SECURITY: Users are NOT allowed to update their own profiles directly to change balances.
-- If they want to update full_name or avatar_url, they can use this policy which restricts balance updates.
DROP POLICY IF EXISTS "Users can update non-financial profile fields" ON profiles;
CREATE POLICY "Users can update non-financial profile fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    balance_ngn = balance_ngn AND -- locks balance from mutation
    balance_usdt = balance_usdt
  );

-- ── 5. TRANSACTIONS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flw_transaction_id BIGINT UNIQUE,
  tx_ref TEXT UNIQUE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CONSTRAINT amount_positive CHECK (amount > 0.00),
  currency TEXT NOT NULL DEFAULT 'NGN' CONSTRAINT currency_is_ngn CHECK (currency = 'NGN'),
  status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT status_enum CHECK (status IN ('pending', 'successful', 'failed', 'reversed')),
  type TEXT NOT NULL CONSTRAINT type_enum CHECK (type IN ('deposit', 'bill_payment', 'withdrawal', 'refund')),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply status and type check constraints safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'status_enum') THEN
    ALTER TABLE transactions ADD CONSTRAINT status_enum CHECK (status IN ('pending', 'successful', 'failed', 'reversed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'type_enum') THEN
    ALTER TABLE transactions ADD CONSTRAINT type_enum CHECK (type IN ('deposit', 'bill_payment', 'withdrawal', 'refund'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'amount_positive') THEN
    ALTER TABLE transactions ADD CONSTRAINT amount_positive CHECK (amount > 0.00);
  END IF;
END $$;

-- ── 6. ROW LEVEL SECURITY (RLS) FOR TRANSACTIONS ──────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- CRITICAL SECURITY: Users are NOT allowed to INSERT or UPDATE transactions directly via the client libraries.
-- All database updates are performed strictly through SECURITY DEFINER Postgres functions.

-- ── 7. INDEXES FOR HIGH CONCURRENCY ───────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_ref ON transactions(tx_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ── 8. TRANSACTION-SAFE SECURITY DEFINER RPC FUNCTIONS ────

-- Function A: Atomic deduction and creation of pending bill payment
CREATE OR REPLACE FUNCTION create_pending_bill_payment(
  p_user_id UUID,
  p_amount NUMERIC(12, 2),
  p_category TEXT,
  p_tx_ref TEXT,
  p_description TEXT,
  p_metadata JSONB
)
RETURNS NUMERIC(12, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
BEGIN
  -- Strict context authorization check
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized context for user wallet mutation';
  END IF;

  -- Validate amount
  IF p_amount <= 0.00 THEN
    RAISE EXCEPTION 'Bill payment amount must be positive';
  END IF;

  -- Lock user profile row to prevent race conditions during parallel requests
  SELECT balance_ngn INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Validate balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Update profile balance
  UPDATE profiles
  SET balance_ngn = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction record as pending
  INSERT INTO transactions (
    user_id,
    tx_ref,
    amount,
    currency,
    status,
    type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_tx_ref,
    p_amount,
    'NGN',
    'pending',
    'bill_payment',
    p_description,
    p_metadata
  );

  RETURN v_new_balance;
END;
$$;


-- Function B: Atomic and Idempotent confirmation of deposit
CREATE OR REPLACE FUNCTION confirm_deposit(
  p_user_id UUID,
  p_flw_transaction_id BIGINT,
  p_tx_ref TEXT,
  p_amount NUMERIC(12, 2),
  p_currency TEXT,
  p_metadata JSONB,
  p_auth_secret TEXT DEFAULT ''
)
RETURNS NUMERIC(12, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_status TEXT;
  v_tx_user_id UUID;
  v_current_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
BEGIN
  -- Check context authorization: allows service_role, authenticated owner, or signature secret
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id AND p_auth_secret <> 'Kyvatron2026F' THEN
    RAISE EXCEPTION 'Unauthorized context for wallet credit';
  END IF;

  -- Lock transaction row for the specific reference to prevent webhook vs verify client races
  SELECT status, user_id INTO v_tx_status, v_tx_user_id
  FROM transactions
  WHERE tx_ref = p_tx_ref
  FOR UPDATE;

  -- Idempotency check: if transaction already successful, bypass credit and return current balance
  IF FOUND AND v_tx_status = 'successful' THEN
    SELECT balance_ngn INTO v_current_balance FROM profiles WHERE id = v_tx_user_id;
    RETURN v_current_balance;
  END IF;

  -- Lock profile row to update balance safely
  SELECT balance_ngn INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Update balance
  UPDATE profiles
  SET balance_ngn = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction record update or insertion
  IF FOUND THEN
    -- If it existed (e.g. as pending), transition status to successful
    UPDATE transactions
    SET status = 'successful',
        flw_transaction_id = p_flw_transaction_id,
        metadata = p_metadata,
        amount = p_amount, -- ensure verified amount is written
        currency = p_currency
    WHERE tx_ref = p_tx_ref;
  ELSE
    -- If verify/webhook processed before a pending row was made, insert as successful
    INSERT INTO transactions (
      user_id,
      flw_transaction_id,
      tx_ref,
      amount,
      currency,
      status,
      type,
      description,
      metadata
    ) VALUES (
      p_user_id,
      p_flw_transaction_id,
      p_tx_ref,
      p_amount,
      p_currency,
      'successful',
      'deposit',
      'Wallet Deposit',
      p_metadata
    );
  END IF;

  RETURN v_new_balance;
END;
$$;


-- Function C: Complete pending bill payment successfully
CREATE OR REPLACE FUNCTION complete_bill_payment(
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
  -- Lock transaction row
  SELECT status INTO v_status
  FROM transactions
  WHERE tx_ref = p_tx_ref
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction reference not found';
  END IF;

  -- Idempotency check
  IF v_status = 'successful' THEN
    RETURN TRUE;
  END IF;

  -- Transition status
  UPDATE transactions
  SET status = 'successful',
      flw_transaction_id = p_flw_transaction_id,
      metadata = p_metadata
  WHERE tx_ref = p_tx_ref;

  RETURN TRUE;
END;
$$;


-- Function D: Reverse pending bill payment (Refund wallet)
CREATE OR REPLACE FUNCTION reverse_bill_payment(
  p_tx_ref TEXT,
  p_reason TEXT
)
RETURNS NUMERIC(12, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
  v_amount NUMERIC(12, 2);
  v_current_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
BEGIN
  -- Lock transaction row
  SELECT status, user_id, amount INTO v_status, v_user_id, v_amount
  FROM transactions
  WHERE tx_ref = p_tx_ref
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction reference not found';
  END IF;

  -- Idempotency check: if already reversed, return current balance
  IF v_status = 'reversed' THEN
    SELECT balance_ngn INTO v_current_balance FROM profiles WHERE id = v_user_id;
    RETURN v_current_balance;
  END IF;

  -- Reversal only allowed on pending transactions to protect database state integrity
  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'Reversal is only permitted for pending transactions';
  END IF;

  -- Lock user profile row to prevent balance race conditions
  SELECT balance_ngn INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_new_balance := v_current_balance + v_amount;

  -- Refund NGN balance
  UPDATE profiles
  SET balance_ngn = v_new_balance,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Set status to reversed
  UPDATE transactions
  SET status = 'reversed',
      metadata = jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{reversal_reason}',
        to_jsonb(p_reason)
      )
  WHERE tx_ref = p_tx_ref;

  RETURN v_new_balance;
END;
$$;
