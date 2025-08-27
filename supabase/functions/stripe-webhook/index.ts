
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (msg: string, ctx?: Record<string, unknown>) => {
  console.log(`[stripe-webhook] ${msg}`, ctx ?? {});
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!stripeSecret || !webhookSecret) {
    log("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    log("Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    log("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

      // 1) Upsert into new payment_intents table for reconciliation
      if (paymentIntentId) {
        await supabaseService
          .from("payment_intents")
          .upsert({
            stripe_payment_intent_id: paymentIntentId,
            amount: typeof session.amount_total === "number" ? session.amount_total : 0,
            currency: (session.currency || "usd").toUpperCase(),
            status: "succeeded",
            user_id: (session.metadata?.user_id as string) || null,
            metadata: session.metadata || {},
          }, { onConflict: "stripe_payment_intent_id" });
      }

      // 2) Idempotent write to existing payments table used by current UI flow
      const { data: existing } = await supabaseService
        .from("payments")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (!existing) {
        await supabaseService.from("payments").insert({
          customer_id: (session.metadata?.user_id as string) || null,
          amount: typeof session.amount_total === "number" ? session.amount_total / 100 : 0,
          currency: (session.currency || "USD").toUpperCase(),
          payment_status: "completed",
          stripe_charge_id: paymentIntentId || null,
          payment_intent_id: paymentIntentId || null,
          payment_method: "stripe_checkout",
          stripe_session_id: session.id,
          processed_at: new Date().toISOString(),
        });
      } else {
        await supabaseService
          .from("payments")
          .update({
            payment_status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;

      // Update new payment_intents table
      await supabaseService
        .from("payment_intents")
        .upsert({
          stripe_payment_intent_id: pi.id,
          amount: typeof pi.amount === "number" ? pi.amount : 0,
          currency: (pi.currency || "usd").toUpperCase(),
          status: "failed",
          user_id: (pi.metadata?.user_id as string) || null,
          metadata: pi.metadata || {},
        }, { onConflict: "stripe_payment_intent_id" });

      // Record failure in existing payments table (idempotent-ish)
      const { data: maybePay } = await supabaseService
        .from("payments")
        .select("id")
        .eq("payment_intent_id", pi.id)
        .maybeSingle();

      if (!maybePay) {
        await supabaseService.from("payments").insert({
          customer_id: (pi.metadata?.user_id as string) || null,
          amount: typeof pi.amount === "number" ? pi.amount / 100 : 0,
          currency: (pi.currency || "USD").toUpperCase(),
          payment_status: "failed",
          payment_intent_id: pi.id,
          payment_method: "stripe_checkout",
          processed_at: new Date().toISOString(),
        });
      } else {
        await supabaseService
          .from("payments")
          .update({ payment_status: "failed" })
          .eq("id", maybePay.id);
      }
    }

    if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      // Mark payment as disputed by charge id
      await supabaseService
        .from("payments")
        .update({ payment_status: "disputed", updated_at: new Date().toISOString() } as any)
        .eq("stripe_charge_id", dispute.charge as string);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    log("Unhandled webhook error", { error: e instanceof Error ? e.message : String(e) });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
