
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Refund request received");

    const { paymentId, reason, amount } = await req.json();

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseService
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      logStep("Payment not found", { paymentId, error: paymentError });
      throw new Error("Payment not found");
    }

    if (payment.payment_status !== 'completed') {
      throw new Error("Can only refund completed payments");
    }

    logStep("Processing refund for payment", { 
      paymentId, 
      stripeChargeId: payment.stripe_charge_id,
      amount: amount || payment.amount
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.payment_intent_id || payment.stripe_charge_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents or full amount
      reason: 'requested_by_customer',
      metadata: {
        payment_id: paymentId,
        reason: reason || 'booking_creation_failed'
      }
    });

    logStep("Stripe refund created", { refundId: refund.id });

    // Update payment record
    const { error: updateError } = await supabaseService
      .from('payments')
      .update({
        payment_status: 'refunded',
        refund_amount: refund.amount / 100,
        refund_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (updateError) {
      logStep("Error updating payment record", { error: updateError });
      throw updateError;
    }

    logStep("Refund processed successfully", { 
      refundId: refund.id, 
      amount: refund.amount / 100 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      refundId: refund.id,
      amount: refund.amount / 100
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Refund error", { error: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
