-- ============================================================
-- Kyvatron: Crypto Deposits Table Migration
-- Run this in Supabase → SQL Editor AFTER supabase_migration.sql
-- ============================================================

-- ── CRYPTO_DEPOSITS TABLE ─────────────────────────────────
-- Stores all NOWPayments payment requests and their lifecycle
CREATE TABLE IF NOT EXISTS crypto_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  fiat_amount NUMERIC(18, 8) NOT NULL DEFAULT 0,
  fiat_currency TEXT NOT NULL DEFAULT 'usd',
  crypto_amount NUMERIC(18, 8) NOT NULL DEFAULT 0,
  crypto_currency TEXT NOT NULL DEFAULT 'usdttrc20',
  pay_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on order_id for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crypto_deposits_order_id_unique') THEN
    ALTER TABLE crypto_deposits ADD CONSTRAINT crypto_deposits_order_id_unique UNIQUE (order_id);
  END IF;
END $$;

-- Unique constraint on payment_id for provider-level idempotency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crypto_deposits_payment_id_unique') THEN
    ALTER TABLE crypto_deposits ADD CONSTRAINT crypto_deposits_payment_id_unique UNIQUE (payment_id);
  END IF;
END $$;

-- Add columns safely if table already exists from prior code
ALTER TABLE crypto_deposits
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS pay_address TEXT,
  ADD COLUMN IF NOT EXISTS credited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_order_id ON crypto_deposits(order_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_payment_id ON crypto_deposits(payment_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user_id ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_status ON crypto_deposits(status);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_created_at ON crypto_deposits(created_at DESC);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crypto deposits" ON crypto_deposits;
CREATE POLICY "Users can view own crypto deposits"
  ON crypto_deposits FOR SELECT
  USING (auth.uid() = user_id);

-- Users cannot insert/update crypto_deposits directly; only via server-side API routes.
-- Service role inserts are allowed by default when RLS is enabled.

-- ── ATOMIC USDT CREDIT RPC ────────────────────────────────
-- Prevents race conditions and double-crediting for USDT deposits
CREATE OR REPLACE FUNCTION credit_usdt_deposit(
  p_user_id UUID,
  p_order_id TEXT,
  p_amount NUMERIC(18, 8),
  p_payment_id TEXT DEFAULT NULL
)
RETURNS NUMERIC(18, 8)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit_status TEXT;
  v_current_balance NUMERIC(18, 8);
  v_new_balance NUMERIC(18, 8);
BEGIN
  -- Lock crypto_deposits row for this order_id
  SELECT status INTO v_deposit_status
  FROM crypto_deposits
  WHERE order_id = p_order_id
  FOR UPDATE;

  -- Idempotency: if already credited, return current balance
  IF v_deposit_status IN ('confirmed', 'finished') THEN
    SELECT balance_usdt INTO v_current_balance FROM profiles WHERE id = p_user_id;
    RETURN v_current_balance;
  END IF;

  -- Lock profile row for atomic update
  SELECT balance_usdt INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Update profile balance
  UPDATE profiles
  SET balance_usdt = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Mark deposit as credited
  UPDATE crypto_deposits
  SET status = 'finished',
      credited_at = NOW(),
      updated_at = NOW()
  WHERE order_id = p_order_id;

  RETURN v_new_balance;
END;
$$;
