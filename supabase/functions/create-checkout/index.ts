
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
    console.log("Enhanced checkout session creation starting...");

    const { items, address } = await req.json();
    console.log("Received items:", items?.length, "Address provided:", !!address);

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!address) {
      throw new Error("No address provided");
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.service_title || !item.provider_name || !item.price || !item.scheduled_date) {
        console.error("Invalid item data:", item);
        throw new Error("Invalid item data - missing required fields");
      }
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", userData.user.email);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ 
      email: userData.user.email!, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("Creating new customer");
    }

    // Create enhanced line items with complete service information
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.service_title}`,
          description: `Service by ${item.provider_name} scheduled for ${new Date(item.scheduled_date).toLocaleDateString()}`,
          metadata: {
            service_id: item.service_id,
            provider_id: item.provider_id,
            scheduled_date: item.scheduled_date
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    console.log("Creating enhanced checkout session...");

    // Store essential data in metadata (staying within Stripe limits)
    const checkoutMetadata = {
      user_id: userData.user.id,
      items_count: String(items.length),
      total_amount: String(items.reduce((sum: number, item: any) => sum + item.price, 0)),
      checkout_timestamp: String(Date.now()),
      // Store first item details as sample
      first_service_id: items[0]?.service_id || '',
      first_provider_id: items[0]?.provider_id || ''
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout?payment=cancelled`,
      metadata: checkoutMetadata,
      payment_intent_data: {
        metadata: checkoutMetadata // Also store in payment intent
      }
    });

    console.log("Enhanced checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating enhanced checkout session:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
