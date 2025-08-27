
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  items: Array<{
    id: string;
    service_id: string;
    service_title: string;
    provider_id: string;
    provider_name: string;
    price: number;
    scheduled_date: string;
    duration_minutes: number;
    special_instructions?: string;
  }>;
  address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code?: string;
    zip_code?: string;
  };
  idempotency_key: string;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Payment intent creation started");

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestData: PaymentRequest = await req.json();
    const { items, address, idempotency_key } = requestData;

    if (!idempotency_key || idempotency_key.length < 10) {
      throw new Error("Valid idempotency key required");
    }

    logStep("Request validated", { itemsCount: items.length, idempotencyKey: idempotency_key });

    // Check idempotency - if already processed, return cached result
    const { data: existingKey } = await supabaseClient
      .from('idempotency_keys')
      .select('*')
      .eq('key', idempotency_key)
      .eq('user_id', user.id)
      .single();

    if (existingKey) {
      if (existingKey.status === 'completed') {
        logStep("Returning cached result", { idempotencyKey: idempotency_key });
        return new Response(JSON.stringify(existingKey.response_payload), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else if (existingKey.status === 'processing') {
        throw new Error("Payment intent already being processed");
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const amountInCents = Math.round(totalAmount * 100);

    logStep("Amount calculated", { totalAmount, amountInCents });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user is a Stripe customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || undefined,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Create idempotency record
    const { data: idempotencyRecord, error: idempotencyError } = await supabaseClient
      .from('idempotency_keys')
      .upsert({
        key: idempotency_key,
        user_id: user.id,
        request_payload: requestData,
        status: 'processing'
      })
      .select()
      .single();

    if (idempotencyError) {
      throw new Error(`Failed to create idempotency record: ${idempotencyError.message}`);
    }

    logStep("Idempotency record created", { id: idempotencyRecord.id });

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        items_count: items.length.toString(),
        idempotency_key: idempotency_key,
        total_amount: totalAmount.toString()
      },
      description: `Booking for ${items.length} service${items.length > 1 ? 's' : ''}`
    });

    logStep("Stripe PaymentIntent created", { 
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret?.substring(0, 20) + "..."
    });

    // Store payment intent in database
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        customer_id: user.id,
        amount: totalAmount,
        currency: 'USD',
        payment_status: 'pending',
        payment_intent_id: paymentIntent.id,
        payment_method: 'stripe_checkout',
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Payment record creation failed", { error: paymentError });
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    logStep("Payment record created", { paymentId: paymentRecord.id });

    // Store pending checkout data in session storage via response
    const responsePayload = {
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: amountInCents,
      },
      payment_record_id: paymentRecord.id,
      pending_data: {
        items,
        address,
        user_id: user.id,
        payment_intent_id: paymentIntent.id
      }
    };

    // Update idempotency record with success
    await supabaseClient
      .from('idempotency_keys')
      .update({
        response_payload: responsePayload,
        status: 'completed'
      })
      .eq('id', idempotencyRecord.id);

    logStep("Payment intent creation completed successfully");

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in payment intent creation", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
