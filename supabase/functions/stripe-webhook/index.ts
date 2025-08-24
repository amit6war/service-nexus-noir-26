
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Remove static Redis import; we'll dynamic import when needed
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const REDIS_URL = Deno.env.get("REDIS_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (msg: string, ctx?: Record<string, unknown>) => {
  console.log(`[stripe-webhook] ${msg}`, ctx ?? {});
};

function parseRedisUrl(url: string) {
  try {
    const u = new URL(url);
    const isTls = u.protocol === "rediss:";
    const hostname = u.hostname;
    const port = Number(u.port || (isTls ? 6380 : 6379));
    const password = u.password || undefined;
    return { hostname, port, password, tls: isTls };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature") || "";

  try {
    const bodyText = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const event = stripe.webhooks.constructEvent(bodyText, signature, STRIPE_WEBHOOK_SECRET);

    // Enqueue to Redis for async processing (if configured and available)
    if (REDIS_URL) {
      const cfg = parseRedisUrl(REDIS_URL);
      if (cfg) {
        try {
          const mod = await import("https://deno.land/x/redis@v0.36.0/mod.ts");
          const connect = (mod as any).connect as (opts: any) => Promise<any>;
          const redis = await connect({
            hostname: cfg.hostname,
            port: cfg.port,
            password: cfg.password,
            tls: cfg.tls ? {} : undefined,
          });
          try {
            await redis.lpush("queue:webhooks", JSON.stringify(event));
          } finally {
            try { redis?.close?.(); } catch {}
          }
        } catch (e) {
          console.log("[stripe-webhook] Redis enqueue failed, continuing without queue", { error: e instanceof Error ? e.message : String(e) });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    log("Webhook signature validation failed", { error: err instanceof Error ? err.message : String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
