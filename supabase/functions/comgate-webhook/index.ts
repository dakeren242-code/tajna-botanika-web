import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Comgate payment status webhook.
 *
 * Comgate sends POST with application/x-www-form-urlencoded body:
 *   merchant, test, price, curr, label, refId, transId, secret, status, fee, email, ...
 *
 * Status values:
 *   PAID      — payment successful
 *   CANCELLED — payment cancelled by customer
 *   AUTHORIZED — payment authorized (for delayed capture)
 *
 * We verify the merchant + secret, then update the order.
 */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    // Parse form data
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("Comgate webhook received:", JSON.stringify({
      transId: data.transId,
      refId: data.refId,
      status: data.status,
      price: data.price,
    }));

    const merchantId = Deno.env.get("COMGATE_MERCHANT_ID");
    const secret = Deno.env.get("COMGATE_SECRET");

    if (!merchantId || !secret) {
      console.error("Comgate credentials not configured");
      return new Response("OK", { status: 200 }); // Return 200 to avoid retries
    }

    // Verify merchant and secret
    if (data.merchant !== merchantId || data.secret !== secret) {
      console.error("Invalid merchant or secret in webhook");
      return new Response("OK", { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderId = data.refId;
    const transId = data.transId;
    const status = data.status;

    if (!orderId) {
      console.error("No refId in webhook");
      return new Response("OK", { status: 200 });
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error("Order not found:", orderId, orderError);
      return new Response("OK", { status: 200 });
    }

    // Don't update if already in a final state
    if (order.payment_status === "paid" || order.payment_status === "refunded") {
      console.log(`Order ${orderId} already in final state: ${order.payment_status}`);
      return new Response("OK", { status: 200 });
    }

    if (status === "PAID" || status === "AUTHORIZED") {
      // Payment successful
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: order.status === "pending" ? "processing" : order.status,
          payment_reference: transId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order:", updateError);
      } else {
        console.log(`Order ${orderId} marked as PAID (transId: ${transId})`);
      }
    } else if (status === "CANCELLED") {
      // Payment cancelled
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          payment_reference: transId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order:", updateError);
      } else {
        console.log(`Order ${orderId} marked as CANCELLED (transId: ${transId})`);
      }
    }

    // Always return 200 OK — Comgate retries on non-200
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Comgate webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
