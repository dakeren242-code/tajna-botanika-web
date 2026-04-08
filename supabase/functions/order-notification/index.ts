import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "tajnabotanika@seznam.cz";

interface OrderData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  items?: Array<{ name: string; quantity: number; gramAmount: string; price: number }>;
}

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: "Bankovni prevod",
  card: "Platba kartou",
  cash_on_delivery: "Dobirka",
};

const shippingMethodLabels: Record<string, string> = {
  zasilkovna: "Zasilkovna",
  personal_pickup: "Osobni prevzeti",
  personal_invoice: "Osobni po fakture",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const data: OrderData = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Store notification in database for admin dashboard
    await supabase.from("admin_notifications").insert({
      type: "new_order",
      title: `Nova objednavka #${data.orderNumber}`,
      message: `${data.customerName} - ${data.totalAmount} Kc (${paymentMethodLabels[data.paymentMethod] || data.paymentMethod})`,
      metadata: {
        order_id: data.orderId,
        order_number: data.orderNumber,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        total_amount: data.totalAmount,
        payment_method: data.paymentMethod,
        shipping_method: data.shippingMethod,
      },
      is_read: false,
    });

    // Send email notification via Supabase Auth (admin invite trick won't work)
    // Instead, use a simple SMTP-compatible webhook or store for polling
    // For now, we use Resend if available, otherwise just DB notification
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const itemsList = data.items
        ? data.items.map((i) => `  - ${i.name} (${i.gramAmount}) x${i.quantity} = ${i.price} Kc`).join("\n")
        : "Polozky nejsou k dispozici";

      const emailBody = `
Nova objednavka #${data.orderNumber}

Zakaznik: ${data.customerName}
Email: ${data.customerEmail}
Telefon: ${data.customerPhone}

Zpusob platby: ${paymentMethodLabels[data.paymentMethod] || data.paymentMethod}
Zpusob dopravy: ${shippingMethodLabels[data.shippingMethod] || data.shippingMethod}

Polozky:
${itemsList}

Celkova castka: ${data.totalAmount} Kc

---
Spravovat objednavky: https://tajnabotanika.online/admin
      `.trim();

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Tajna Botanika <objednavky@tajnabotanika.online>",
          to: [ADMIN_EMAIL],
          subject: `Nova objednavka #${data.orderNumber} - ${data.totalAmount} Kc`,
          text: emailBody,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: "Notification failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
