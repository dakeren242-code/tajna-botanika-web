import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateSubscriptionRequest {
  packId: string;
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { packId, redirectUrl }: CreateSubscriptionRequest = await req.json();

    if (!packId || !redirectUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pack, error: packError } = await supabase
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .maybeSingle();

    if (packError || !pack) {
      return new Response(JSON.stringify({ error: "Pack not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pack.type !== "subscription") {
      return new Response(JSON.stringify({ error: "Pack is not a subscription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("mollie_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingSubscription?.mollie_customer_id;

    if (!customerId) {
      const customerResponse = await fetch("https://api.mollie.com/v2/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mollieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.email,
          email: user.email,
          metadata: {
            userId: user.id,
          },
        }),
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.text();
        console.error("Mollie customer creation error:", errorData);
        throw new Error(`Failed to create Mollie customer: ${customerResponse.status}`);
      }

      const customer = await customerResponse.json();
      customerId = customer.id;
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    const firstPaymentResponse = await fetch("https://api.mollie.com/v2/payments", {
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
        customerId: customerId,
        sequenceType: "first",
        description: `First payment for ${pack.name}`,
        redirectUrl: redirectUrl,
        webhookUrl: webhookUrl,
        metadata: {
          userId: user.id,
          packId: packId,
          type: "first_subscription_payment",
        },
      }),
    });

    if (!firstPaymentResponse.ok) {
      const errorData = await firstPaymentResponse.text();
      console.error("Mollie first payment error:", errorData);
      throw new Error(`Failed to create first payment: ${firstPaymentResponse.status}`);
    }

    const firstPayment = await firstPaymentResponse.json();

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        pack_id: packId,
        mollie_customer_id: customerId,
        status: "pending",
        metadata: {
          first_payment_id: firstPayment.id,
        },
      });

    if (subscriptionError) {
      console.error("Failed to create subscription record:", subscriptionError);
      throw new Error("Failed to create subscription record");
    }

    return new Response(JSON.stringify({
      customerId: customerId,
      firstPaymentId: firstPayment.id,
      checkoutUrl: firstPayment._links.checkout.href,
      status: firstPayment.status,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
