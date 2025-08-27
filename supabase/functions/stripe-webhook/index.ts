
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Generate booking number
const generateBookingNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const code = `BK${ts}${rand}`;
  return code.length <= 20 ? code : code.slice(0, 20);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

  if (!signature) {
    logStep("No signature provided");
    return new Response("No signature provided", { status: 400 });
  }

  try {
    const bodyText = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });
    
    const event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    
    logStep("Webhook event received", { type: event.type, id: event.id });

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle payment success
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("Processing successful payment", { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        customerId: paymentIntent.customer
      });

      // Get the payment record
      const { data: paymentRecord, error: paymentError } = await supabaseService
        .from('payments')
        .select('*')
        .eq('payment_intent_id', paymentIntent.id)
        .single();

      if (paymentError || !paymentRecord) {
        logStep("Payment record not found", { paymentIntentId: paymentIntent.id });
        throw new Error("Payment record not found");
      }

      // Update payment status
      const { error: updateError } = await supabaseService
        .from('payments')
        .update({
          payment_status: 'completed',
          stripe_charge_id: paymentIntent.latest_charge as string,
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id);

      if (updateError) {
        logStep("Failed to update payment status", { error: updateError });
        throw new Error(`Failed to update payment: ${updateError.message}`);
      }

      logStep("Payment status updated to completed");

      // Get idempotency record to retrieve booking items
      const { data: idempotencyRecord } = await supabaseService
        .from('idempotency_keys')
        .select('request_payload')
        .eq('user_id', paymentRecord.customer_id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (idempotencyRecord?.request_payload) {
        const { items, address } = idempotencyRecord.request_payload as any;
        
        logStep("Creating bookings from payment success", { 
          itemsCount: items?.length,
          userId: paymentRecord.customer_id 
        });

        if (items && address) {
          // Create bookings for each item
          const bookings = [];
          
          for (const item of items) {
            // Validate provider exists
            const { data: providerData } = await supabaseService
              .from('provider_profiles')
              .select('user_id, verification_status')
              .eq('user_id', item.provider_id)
              .single();

            if (!providerData || providerData.verification_status !== 'approved') {
              logStep("Provider not found or not approved", { providerId: item.provider_id });
              continue; // Skip this item but don't fail the whole process
            }

            // Format address
            const postalCode = address.postal_code || address.zip_code || '';
            const serviceAddress = `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.city}, ${address.state} ${postalCode}`;

            // Create booking
            const bookingData = {
              customer_id: paymentRecord.customer_id,
              provider_user_id: item.provider_id,
              service_id: item.service_id,
              service_date: item.scheduled_date,
              duration_minutes: item.duration_minutes || null,
              final_price: Number(item.price) || 0,
              platform_fee: Math.round(Number(item.price) * 0.1 * 100) / 100,
              provider_earnings: Math.round(Number(item.price) * 0.9 * 100) / 100,
              special_instructions: item.special_instructions || null,
              service_address: serviceAddress,
              service_city: address.city,
              service_state: address.state,
              service_zip: address.postal_code || address.zip_code,
              booking_number: generateBookingNumber(),
              status: 'confirmed',
              confirmed_at: new Date().toISOString()
            };

            const { data: createdBooking, error: bookingError } = await supabaseService
              .from('bookings')
              .insert(bookingData)
              .select()
              .single();

            if (bookingError) {
              logStep("Failed to create booking", { error: bookingError, item });
              // Continue processing other bookings
            } else {
              logStep("Booking created successfully", { 
                bookingId: createdBooking.id,
                bookingNumber: createdBooking.booking_number 
              });
              
              // Link payment to booking
              await supabaseService
                .from('payments')
                .update({ 
                  booking_id: createdBooking.id,
                  provider_user_id: item.provider_id
                })
                .eq('id', paymentRecord.id);

              bookings.push(createdBooking);
            }
          }

          logStep("Bookings creation completed", { 
            successCount: bookings.length,
            totalItems: items.length 
          });
        }
      }

    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("Payment failed", { 
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message 
      });

      // Update payment status to failed
      await supabaseService
        .from('payments')
        .update({
          payment_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntent.id);

    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      
      logStep("Dispute created", { disputeId: dispute.id, chargeId: dispute.charge });

      // Update payment status to disputed
      await supabaseService
        .from('payments')
        .update({ 
          payment_status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_charge_id', dispute.charge);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (err) {
    logStep("Webhook processing failed", { 
      error: err instanceof Error ? err.message : String(err) 
    });
    
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
