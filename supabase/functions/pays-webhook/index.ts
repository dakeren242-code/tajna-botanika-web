import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function verifyHash(
  paymentOrderID: string,
  merchantOrderNumber: string,
  paymentOrderStatusID: string,
  currencyID: string,
  amount: string,
  currencyBaseUnits: string,
  providedHash: string,
  apiPassword: string
): boolean {
  const data2Hash =
    paymentOrderID +
    merchantOrderNumber +
    paymentOrderStatusID +
    currencyID +
    amount +
    currencyBaseUnits;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiPassword);
  const messageData = encoder.encode(data2Hash);

  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "MD5" },
    false,
    ["sign"]
  ).then(key => {
    return crypto.subtle.sign("HMAC", key, messageData);
  }).then(signature => {
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toLowerCase() === providedHash.toLowerCase();
  }).catch(() => false);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);

    const PaymentOrderID = url.searchParams.get("PaymentOrderID");
    const MerchantOrderNumber = url.searchParams.get("MerchantOrderNumber");
    const PaymentOrderStatusID = url.searchParams.get("PaymentOrderStatusID");
    const CurrencyID = url.searchParams.get("CurrencyID");
    const Amount = url.searchParams.get("Amount");
    const CurrencyBaseUnits = url.searchParams.get("CurrencyBaseUnits");
    const Hash = url.searchParams.get("Hash");

    if (!PaymentOrderID || !MerchantOrderNumber || !PaymentOrderStatusID || !Hash) {
      console.error("Missing required parameters");
      return new Response("Missing parameters", { status: 400 });
    }

    const apiPassword = Deno.env.get("PAYS_API_PASSWORD");
    if (!apiPassword) {
      console.error("PAYS_API_PASSWORD not configured");
      return new Response("Configuration error", { status: 500 });
    }

    const isValid = await verifyHash(
      PaymentOrderID,
      MerchantOrderNumber,
      PaymentOrderStatusID,
      CurrencyID || "",
      Amount || "",
      CurrencyBaseUnits || "",
      Hash,
      apiPassword
    );

    if (!isValid) {
      console.error("Invalid hash signature");
      return new Response("Invalid signature", { status: 403 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response("Configuration error", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (PaymentOrderStatusID === "3") {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", MerchantOrderNumber)
        .maybeSingle();

      if (orderError || !order) {
        console.error("Order not found:", orderError);
        return new Response("Order not found", { status: 404 });
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_id: PaymentOrderID,
          updated_at: new Date().toISOString(),
        })
        .eq("id", MerchantOrderNumber);

      if (updateError) {
        console.error("Failed to update order:", updateError);
        return new Response("Update failed", { status: 500 });
      }

      console.log(`Order ${MerchantOrderNumber} marked as paid`);
    } else {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_id: PaymentOrderID,
          updated_at: new Date().toISOString(),
        })
        .eq("id", MerchantOrderNumber);

      if (updateError) {
        console.error("Failed to update order:", updateError);
      }

      console.log(`Order ${MerchantOrderNumber} marked as failed`);
    }

    return new Response("OK", {
      status: 202,
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
