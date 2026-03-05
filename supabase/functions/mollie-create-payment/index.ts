import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  description: string;
  redirectUrl: string;
}

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

    if (!mollieApiKey) {
      throw new Error("MOLLIE_API_KEY not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, amount, description, redirectUrl }: CreatePaymentRequest = await req.json();

    if (!orderId || !amount || !description || !redirectUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );

      if (!authError && authUser) {
        user = authUser;
      }
    }

    if (order.user_id && (!user || order.user_id !== user.id)) {
      return new Response(JSON.stringify({ error: "Unauthorized to access this order" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "CZK",
          value: amount.toFixed(2),
        },
        description: description,
        redirectUrl: redirectUrl,
        webhookUrl: webhookUrl,
        metadata: {
          orderId: orderId,
        },
      }),
    });

    if (!mollieResponse.ok) {
      const errorData = await mollieResponse.text();
      console.error("Mollie API error:", errorData);
      throw new Error(`Mollie API error: ${mollieResponse.status}`);
    }

    const payment = await mollieResponse.json();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        mollie_payment_id: payment.id,
        status: "pending",
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      throw new Error("Failed to update order with payment ID");
    }

    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        order_id: orderId,
        amount: amount,
        currency: "EUR",
        status: "pending",
        gateway_transaction_id: payment.id,
        gateway_response: payment,
      });

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
    }

    return new Response(JSON.stringify({
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout.href,
      status: payment.status,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
