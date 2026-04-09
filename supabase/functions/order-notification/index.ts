import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "tajnabotanika@seznam.cz";

interface OrderItem {
  name: string;
  quantity: number;
  gramAmount: string;
  price: number;
}

interface OrderData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  items?: OrderItem[];
}

const paymentLabels: Record<string, string> = {
  bank_transfer: "💳 Bankovní převod",
  card: "💳 Platba kartou",
  cash_on_delivery: "📦 Dobírka (+30 Kč)",
};

const shippingLabels: Record<string, string> = {
  zasilkovna: "📦 Zásilkovna",
  personal_pickup: "🤝 Osobní převzetí",
  personal_invoice: "🤝 Osobní převzetí",
  personal: "🤝 Osobní převzetí",
};

function buildHtmlEmail(data: OrderData): string {
  const itemsHtml = data.items
    ? data.items.map((i) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#e5e5e5;font-size:14px;">${i.name} <span style="color:#4ade80;font-size:12px;">(${i.gramAmount})</span></td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#9ca3af;font-size:14px;text-align:center;">×${i.quantity}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#4ade80;font-size:14px;text-align:right;font-weight:700;">${i.price} Kč</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding:16px;color:#6b7280;text-align:center;font-size:13px;">Položky nejsou k dispozici</td></tr>`;

  const now = new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague", dateStyle: "long", timeStyle: "short" });

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#030f03;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#052e16,#14532d);border:1px solid #166534;border-radius:12px;padding:12px 24px;">
        <span style="color:#4ade80;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🌿 Tajná Botanika</span>
      </div>
      <div style="margin-top:16px;display:inline-block;background:#052e16;border:1px solid #16a34a;border-radius:8px;padding:6px 20px;">
        <span style="color:#86efac;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">✅ Nová objednávka</span>
      </div>
    </div>

    <!-- Order number + time -->
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;padding:20px 24px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Číslo objednávky</p>
        <p style="margin:4px 0 0;color:#4ade80;font-size:24px;font-weight:800;letter-spacing:-1px;">#${data.orderNumber}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Čas</p>
        <p style="margin:4px 0 0;color:#e5e5e5;font-size:13px;font-weight:600;">${now}</p>
      </div>
    </div>

    <!-- Customer info -->
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <p style="margin:0 0 14px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">👤 Zákazník</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;color:#9ca3af;font-size:13px;width:100px;">Jméno</td>
          <td style="padding:4px 0;color:#e5e5e5;font-size:13px;font-weight:600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;font-size:13px;">Email</td>
          <td style="padding:4px 0;"><a href="mailto:${data.customerEmail}" style="color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">${data.customerEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;font-size:13px;">Telefon</td>
          <td style="padding:4px 0;"><a href="tel:${data.customerPhone}" style="color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">${data.customerPhone}</a></td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;font-size:13px;">Platba</td>
          <td style="padding:4px 0;color:#e5e5e5;font-size:13px;">${paymentLabels[data.paymentMethod] || data.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;font-size:13px;">Doprava</td>
          <td style="padding:4px 0;color:#e5e5e5;font-size:13px;">${shippingLabels[data.shippingMethod] || data.shippingMethod}</td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #1a2a1a;">
        <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">🛍️ Objednané položky</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#060f06;">
            <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Produkt</th>
            <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Ks</th>
            <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div style="background:linear-gradient(135deg,#052e16,#14532d);border:1px solid #16a34a;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#86efac;font-size:15px;font-weight:700;">CELKOVÁ ČÁSTKA</span>
      <span style="color:#4ade80;font-size:28px;font-weight:800;letter-spacing:-1px;">${data.totalAmount} Kč</span>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://tajnabotanika.online/admin" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        🔑 Otevřít Admin Panel
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;border-top:1px solid #1a2a1a;">
      <p style="margin:0;color:#374151;font-size:11px;">Tajná Botanika · tajnabotanika.online</p>
      <p style="margin:4px 0 0;color:#374151;font-size:11px;">Tato zpráva byla odeslána automaticky při přijetí objednávky.</p>
    </div>

  </div>
</body>
</html>`;
}

function buildPlainEmail(data: OrderData): string {
  const itemsList = data.items
    ? data.items.map((i) => `  • ${i.name} (${i.gramAmount}) ×${i.quantity} = ${i.price} Kč`).join("\n")
    : "  Položky nejsou k dispozici";

  return `
NOVÁ OBJEDNÁVKA #${data.orderNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Zákazník: ${data.customerName}
Email: ${data.customerEmail}
Telefon: ${data.customerPhone}

Platba: ${paymentLabels[data.paymentMethod] || data.paymentMethod}
Doprava: ${shippingLabels[data.shippingMethod] || data.shippingMethod}

Položky:
${itemsList}

CELKEM: ${data.totalAmount} Kč

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin panel: https://tajnabotanika.online/admin
  `.trim();
}

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

    // Store notification in DB (always — works even without email)
    await supabase.from("admin_notifications").upsert({
      type: "new_order",
      title: `Nová objednávka #${data.orderNumber}`,
      message: `${data.customerName} — ${data.totalAmount} Kč (${paymentLabels[data.paymentMethod] || data.paymentMethod})`,
      metadata: {
        order_id: data.orderId,
        order_number: data.orderNumber,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        total_amount: data.totalAmount,
        payment_method: data.paymentMethod,
        shipping_method: data.shippingMethod,
        items: data.items,
      },
      is_read: false,
    }, { onConflict: "type,title", ignoreDuplicates: false }).catch(() => {});

    // Send email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const htmlBody = buildHtmlEmail(data);
      const textBody = buildPlainEmail(data);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Tajná Botanika <objednavky@tajnabotanika.online>",
          to: [ADMIN_EMAIL],
          subject: `🌿 Nová objednávka #${data.orderNumber} — ${data.totalAmount} Kč`,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
      }
    } else {
      console.warn("RESEND_API_KEY not set — email skipped, only DB notification stored");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: "Notification failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
