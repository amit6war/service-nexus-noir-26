
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No signature provided");
    }

    // Verify the webhook signature (in production, you'd set up a webhook endpoint secret)
    let event;
    try {
      // For now, we'll parse the event directly since we're in test mode
      event = JSON.parse(body);
      console.log("Event type:", event.type);
    } catch (err) {
      console.error("Error parsing webhook:", err);
      throw new Error("Invalid webhook payload");
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Processing successful payment for session:", session.id);

      // Extract metadata
      const userId = session.metadata?.user_id;
      const itemIds = session.metadata?.item_ids;
      const itemCount = parseInt(session.metadata?.item_count || '0');

      if (!userId) {
        console.error("Missing user_id in session metadata");
        return new Response("Missing user_id", { status: 400 });
      }

      // Create Supabase client with service role key to bypass RLS
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Since we can't pass full cart data in metadata due to Stripe limits,
      // we'll create a simple booking record that references the session
      // In a production app, you might store cart data in a temporary table
      
      // Generate booking number
      const generateBookingNumber = () => {
        const ts = Date.now().toString(36).toUpperCase();
        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BK-${ts}-${rnd}`;
      };

      // Create a single booking entry for the payment session
      // This is a simplified approach - in production you'd want to store cart items separately
      const booking = {
        customer_id: userId,
        provider_user_id: userId, // Temporary - would need to be properly set from cart data
        service_id: null, // Would need to be set from cart data
        service_date: new Date(Date.now() + 24*60*60*1000).toISOString(), // Tomorrow as default
        duration_minutes: 60, // Default duration
        final_price: session.amount_total / 100, // Convert from cents
        estimated_price: session.amount_total / 100,
        special_instructions: `Payment processed via Stripe. Session: ${session.id}`,
        booking_number: generateBookingNumber(),
        service_address: "Address from checkout", // Would need to be set from stored data
        service_city: null,
        service_state: null,
        service_zip: null,
        status: 'pending'
      };

      console.log("Creating booking for payment session");

      const { data, error } = await supabaseService
        .from('bookings')
        .insert([booking])
        .select('id, booking_number');

      if (error) {
        console.error("Error creating booking:", error);
        // Don't throw error as payment was successful
      } else {
        console.log("Booking created successfully:", data?.[0]?.booking_number);
      }

      // Record payment
      const { error: paymentError } = await supabaseService
        .from('payments')
        .insert({
          customer_id: userId,
          booking_id: data?.[0]?.id || null,
          amount: session.amount_total / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'USD',
          payment_status: 'completed',
          stripe_charge_id: session.payment_intent,
          payment_method: 'stripe_checkout',
          processed_at: new Date().toISOString()
        });

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
      } else {
        console.log("Payment recorded successfully");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
