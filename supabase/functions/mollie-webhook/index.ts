import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mollieApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get("id");

    if (!paymentId) {
      return new Response("Missing payment ID", { status: 400 });
    }

    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${mollieApiKey}`,
      },
    });

    if (!paymentResponse.ok) {
      console.error("Failed to fetch payment from Mollie:", paymentResponse.status);
      return new Response("Failed to verify payment", { status: 400 });
    }

    const payment = await paymentResponse.json();
    console.log("Webhook received for payment:", payment.id, "Status:", payment.status);

    if (payment.metadata?.orderId) {
      await handleOrderPayment(supabase, payment);
    } else if (payment.metadata?.type === "first_subscription_payment") {
      await handleFirstSubscriptionPayment(supabase, payment, mollieApiKey);
    } else if (payment.subscriptionId) {
      await handleRecurringPayment(supabase, payment);
    }

    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function handleOrderPayment(supabase: any, payment: any) {
  const orderId = payment.metadata.orderId;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    console.error("Order not found:", orderId);
    return;
  }

  let orderStatus = order.status;
  let paymentStatus = order.payment_status;

  if (payment.status === "paid") {
    orderStatus = "confirmed";
    paymentStatus = "paid";

    await supabase
      .from("payment_transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        gateway_response: payment,
      })
      .eq("gateway_transaction_id", payment.id);

    console.log(`Order ${orderId} marked as paid`);
  } else if (payment.status === "failed" || payment.status === "expired" || payment.status === "canceled") {
    orderStatus = "failed";
    paymentStatus = "failed";

    await supabase
      .from("payment_transactions")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        gateway_response: payment,
      })
      .eq("gateway_transaction_id", payment.id);

    console.log(`Order ${orderId} marked as failed`);
  }

  await supabase
    .from("orders")
    .update({
      status: orderStatus,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
      ...(payment.status === "paid" && { paid_at: new Date().toISOString() }),
    })
    .eq("id", orderId);
}

async function handleFirstSubscriptionPayment(supabase: any, payment: any, mollieApiKey: string) {
  const { userId, packId } = payment.metadata;

  if (payment.status !== "paid") {
    console.log("First payment not successful yet:", payment.status);
    return;
  }

  const { data: pack } = await supabase
    .from("packs")
    .select("*")
    .eq("id", packId)
    .maybeSingle();

  if (!pack) {
    console.error("Pack not found:", packId);
    return;
  }

  const subscriptionResponse = await fetch(`https://api.mollie.com/v2/customers/${payment.customerId}/subscriptions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${mollieApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        currency: pack.currency || "EUR",
        value: pack.price.toFixed(2),
      },
      interval: `${pack.interval_count || 1} ${pack.interval}${(pack.interval_count || 1) > 1 ? 's' : ''}`,
      description: pack.name,
      webhookUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mollie-webhook`,
      metadata: {
        userId: userId,
        packId: packId,
      },
    }),
  });

  if (!subscriptionResponse.ok) {
    const errorData = await subscriptionResponse.text();
    console.error("Failed to create Mollie subscription:", errorData);
    return;
  }

  const subscription = await subscriptionResponse.json();

  await supabase
    .from("subscriptions")
    .update({
      mollie_subscription_id: subscription.id,
      status: "active",
      next_payment_at: subscription.nextPaymentDate,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("pack_id", packId)
    .eq("mollie_customer_id", payment.customerId);

  console.log(`Subscription ${subscription.id} created and activated for user ${userId}`);
}

async function handleRecurringPayment(supabase: any, payment: any) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("mollie_subscription_id", payment.subscriptionId)
    .maybeSingle();

  if (!subscription) {
    console.error("Subscription not found:", payment.subscriptionId);
    return;
  }

  if (payment.status === "paid") {
    console.log(`Recurring payment successful for subscription ${payment.subscriptionId}`);
  } else if (payment.status === "failed") {
    await supabase
      .from("subscriptions")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("mollie_subscription_id", payment.subscriptionId);

    console.log(`Recurring payment failed for subscription ${payment.subscriptionId}`);
  }
}
