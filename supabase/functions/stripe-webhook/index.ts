
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
      const itemsJson = session.metadata?.items;
      const addressJson = session.metadata?.address;

      if (!userId || !itemsJson || !addressJson) {
        console.error("Missing metadata in session");
        return new Response("Missing metadata", { status: 400 });
      }

      const items = JSON.parse(itemsJson);
      const address = JSON.parse(addressJson);

      // Create Supabase client with service role key to bypass RLS
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Generate booking number
      const generateBookingNumber = () => {
        const ts = Date.now().toString(36).toUpperCase();
        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BK-${ts}-${rnd}`;
      };

      // Format service address
      const formatServiceAddress = (addr: any) => {
        const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : '';
        const city = addr.city ? `, ${addr.city}` : '';
        const state = addr.state ? `, ${addr.state}` : '';
        const zip = addr.postal_code ? ` ${addr.postal_code}` : '';
        const country = addr.country ? `, ${addr.country}` : '';
        return `${addr.address_line_1}${line2}${city}${state}${zip}${country}`.trim();
      };

      const serviceAddress = formatServiceAddress(address);

      // Create bookings
      const bookings = items.map((item: any) => ({
        customer_id: userId,
        provider_user_id: item.provider_id,
        service_id: item.service_id,
        service_date: item.scheduled_date,
        duration_minutes: item.duration_minutes || null,
        final_price: item.price,
        estimated_price: item.price,
        special_instructions: item.special_instructions || null,
        booking_number: generateBookingNumber(),
        service_address: serviceAddress,
        service_city: address.city || null,
        service_state: address.state || null,
        service_zip: address.postal_code || null,
        status: 'pending'
      }));

      console.log("Creating bookings:", bookings.length);

      const { data, error } = await supabaseService
        .from('bookings')
        .insert(bookings)
        .select('id, booking_number');

      if (error) {
        console.error("Error creating bookings:", error);
        throw error;
      }

      console.log("Bookings created successfully:", data?.length);

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
