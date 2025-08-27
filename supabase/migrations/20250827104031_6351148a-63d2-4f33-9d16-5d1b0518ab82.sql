
-- Create production-ready payment system schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums for status management
CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'confirmed', 'cancelled', 'refunded', 'failed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- Idempotency tracking table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Payment intents table
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    idempotency_key TEXT REFERENCES public.idempotency_keys(key),
    stripe_payment_intent_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status payment_status DEFAULT 'pending',
    client_secret TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE CASCADE,
    stripe_charge_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    fees INTEGER DEFAULT 0,
    net_amount INTEGER NOT NULL,
    status payment_status DEFAULT 'pending',
    gateway_response JSONB,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_intent_id UUID REFERENCES public.payment_intents(id),
    booking_id UUID REFERENCES public.bookings(id),
    stripe_refund_id TEXT UNIQUE,
    idempotency_key TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    failure_reason TEXT,
    gateway_response JSONB,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positive_refund_amount CHECK (amount > 0)
);

-- Event outbox for async processing
CREATE TABLE IF NOT EXISTS public.outbox_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Update existing bookings table to work with new payment system
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_intent_id UUID REFERENCES public.payment_intents(id),
ADD COLUMN IF NOT EXISTS booking_reference TEXT;

-- Generate unique booking reference if not exists
UPDATE public.bookings 
SET booking_reference = 'BK' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD((FLOOR(RANDOM() * 10000))::TEXT, 4, '0')
WHERE booking_reference IS NULL;

-- Make booking_reference unique and not null
ALTER TABLE public.bookings 
ALTER COLUMN booking_reference SET NOT NULL,
ADD CONSTRAINT unique_booking_reference UNIQUE (booking_reference);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe ON public.payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_status ON public.payment_intents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_outbox_processing ON public.outbox_events(status, next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_lookup ON public.idempotency_keys(key, expires_at);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own payment intents" ON public.payment_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.payment_transactions FOR SELECT USING (
    payment_intent_id IN (SELECT id FROM public.payment_intents WHERE user_id = auth.uid())
);
CREATE POLICY "Users view own refunds" ON public.refunds FOR SELECT USING (
    payment_intent_id IN (SELECT id FROM public.payment_intents WHERE user_id = auth.uid())
);
CREATE POLICY "Users view own idempotency keys" ON public.idempotency_keys FOR SELECT USING (auth.uid() = user_id);

-- Service functions can insert/update with service role
CREATE POLICY "Service role full access payment_intents" ON public.payment_intents FOR ALL USING (true);
CREATE POLICY "Service role full access transactions" ON public.payment_transactions FOR ALL USING (true);
CREATE POLICY "Service role full access refunds" ON public.refunds FOR ALL USING (true);
CREATE POLICY "Service role full access idempotency" ON public.idempotency_keys FOR ALL USING (true);
CREATE POLICY "Service role full access outbox" ON public.outbox_events FOR ALL USING (true);

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    exists_count INT;
BEGIN
    LOOP
        ref := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD((FLOOR(RANDOM() * 10000))::TEXT, 4, '0');
        SELECT COUNT(*) INTO exists_count FROM public.bookings WHERE booking_reference = ref;
        EXIT WHEN exists_count = 0;
    END LOOP;
    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := generate_booking_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_booking_reference ON public.bookings;
CREATE TRIGGER trigger_set_booking_reference
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_reference();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to payment_intents
DROP TRIGGER IF EXISTS trigger_update_payment_intents ON public.payment_intents;
CREATE TRIGGER trigger_update_payment_intents 
    BEFORE UPDATE ON public.payment_intents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();
