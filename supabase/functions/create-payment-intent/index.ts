
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, ctx?: Record<string, unknown>) => {
  console.log(`[create-payment-intent] ${msg}`, ctx ?? {});
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    // Auth: use anon key client with forwarded Authorization header to resolve the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userRes.user;

    // Expected body
    // { amount: number (in cents), currency?: string, idempotency_key: string, metadata?: Record<string, any> }
    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const currency = String(body?.currency || "usd").toLowerCase();
    const idempotencyKey = String(body?.idempotency_key || "");
    const metadata = (body?.metadata && typeof body.metadata === "object") ? body.metadata : {};

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    if (!idempotencyKey || idempotencyKey.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid idempotency_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    log("Incoming request", { userId: user.id, amount, currency, idempotencyKey });

    // Check existing idempotency key
    const { data: existingKey } = await supabaseService
      .from("idempotency_keys")
      .select("status, response_payload")
      .eq("key", idempotencyKey)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingKey?.status === "completed" && existingKey?.response_payload) {
      log("Returning cached response for idempotency key", { idempotencyKey });
      return new Response(JSON.stringify(existingKey.response_payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create PaymentIntent at Stripe (idempotent)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          ...metadata,
          user_id: user.id,
          idempotency_key: idempotencyKey,
        },
      },
      { idempotencyKey: `pi_${idempotencyKey}` }
    );

    // Record in our DB
    const { data: dbPi, error: insertErr } = await supabaseService
      .from("payment_intents")
      .insert({
        user_id: user.id,
        idempotency_key: idempotencyKey,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        status: "pending",
        client_secret: paymentIntent.client_secret,
        metadata: { ...metadata },
      })
      .select("id, client_secret, amount, currency, status, stripe_payment_intent_id")
      .single();

    if (insertErr) {
      log("DB insert failed, canceling Stripe PI", { error: insertErr });
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (_) {}
      return new Response(JSON.stringify({ error: "Failed to record payment intent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const response = {
      success: true,
      payment_intent: dbPi,
    };

    // Upsert idempotency record
    await supabaseService.from("idempotency_keys").upsert({
      key: idempotencyKey,
      user_id: user.id,
      request_payload: { amount, currency, metadata },
      response_payload: response,
      status: "completed",
    }, { onConflict: "key" });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    log("Unhandled error", { error: e instanceof Error ? e.message : String(e) });
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
