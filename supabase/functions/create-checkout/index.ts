
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting checkout session creation...");

    // Get the request body
    const { items, address } = await req.json();
    console.log("Received items:", items?.length, "Address provided:", !!address);

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!address) {
      throw new Error("No address provided");
    }

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists in Stripe
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

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.service_title,
          description: `Service by ${item.provider_name}`,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    console.log("Creating checkout session...");

    // Build compact metadata to stay well under Stripe's 500-char per value limit
    const compactItemIds = items.map((i: any) => String(i.service_id)).slice(0, 20).join("|"); // cap to 20 ids for safety

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/customer-dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin")}/checkout?payment=cancelled`,
      metadata: {
        user_id: userData.user.id,
        item_ids: compactItemIds,
        item_count: String(items.length),
        // address and full cart details intentionally omitted to avoid Stripe metadata limits
      }
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
