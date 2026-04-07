import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * Creates a Comgate payment and returns the redirect URL.
 *
 * Comgate API: POST https://payments.comgate.cz/v1.0/create
 * Test API:    POST https://payments.comgate.cz/v1.0/create (same URL, test mode via merchant config)
 *
 * Required env vars:
 *   COMGATE_MERCHANT_ID  — your merchant ID from Comgate portal
 *   COMGATE_SECRET       — your API secret from Comgate portal
 *   COMGATE_TEST_MODE    — "true" for sandbox, "false" for production
 */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { orderId, amount, email, label } = await req.json();

    if (!orderId || !amount || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merchantId = Deno.env.get("COMGATE_MERCHANT_ID");
    const secret = Deno.env.get("COMGATE_SECRET");
    const testMode = Deno.env.get("COMGATE_TEST_MODE") === "true";
    const siteUrl = Deno.env.get("SITE_URL") || "https://tajnabotanika.online";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!merchantId || !secret) {
      console.error("Comgate credentials not configured");
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Price in cents (haléře) — Comgate expects integer, 10000 = 100.00 CZK
    const priceInCents = Math.round(amount * 100);

    // Build Comgate API request
    const params = new URLSearchParams({
      merchant: merchantId,
      test: testMode ? "true" : "false",
      price: priceInCents.toString(),
      curr: "CZK",
      label: label || `Objednávka Tajná Botanika`,
      refId: orderId,
      method: "ALL", // All payment methods (cards, bank transfers, etc.)
      email: email,
      prepareOnly: "true", // Don't redirect, return URL
      country: "CZ",
      lang: "cs",
      secret: secret,
      url_ok: `${siteUrl}/paymentok?order=${orderId}`,
      url_pending: `${siteUrl}/paymentok?order=${orderId}&pending=1`,
      url_cancel: `${siteUrl}/paymenterr?order=${orderId}`,
    });

    console.log(`Creating Comgate payment for order ${orderId}, amount ${amount} CZK`);

    const comgateResponse = await fetch("https://payments.comgate.cz/v1.0/create", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const responseText = await comgateResponse.text();

    // Parse Comgate response (format: code=0&message=OK&transId=ABC123&redirect=https://...)
    const result: Record<string, string> = {};
    responseText.split("&").forEach((pair) => {
      const [key, ...vals] = pair.split("=");
      result[key] = decodeURIComponent(vals.join("="));
    });

    if (result.code !== "0") {
      console.error("Comgate error:", result.message, result.code);
      return new Response(JSON.stringify({
        error: "Platba se nepodařila vytvořit",
        detail: result.message
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save transaction ID to order
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from("orders")
      .update({
        payment_reference: result.transId,
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    console.log(`Comgate payment created: transId=${result.transId}, redirect=${result.redirect}`);

    return new Response(JSON.stringify({
      redirect: result.redirect,
      transId: result.transId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Comgate create error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
