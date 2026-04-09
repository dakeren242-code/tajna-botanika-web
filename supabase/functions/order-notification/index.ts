import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "tajnabotanika@seznam.cz";
const BANK_ACCOUNT = "1234567890/0100"; // TODO: Replace with real account number
const BANK_IBAN = "CZ00 0100 0000 0012 3456 7890"; // TODO: Replace with real IBAN

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
  discountAmount?: number;
  shippingCost?: number;
}

const paymentLabels: Record<string, string> = {
  bank_transfer: "Bankovni prevod",
  card: "Platba kartou",
  cash_on_delivery: "Dobirka (+30 Kc)",
};

const paymentLabelsHtml: Record<string, string> = {
  bank_transfer: "Bankovni prevod",
  card: "Platba kartou",
  cash_on_delivery: "Dobirka (+30 Kc)",
};

const shippingLabels: Record<string, string> = {
  zasilkovna: "Zasilkovna",
  personal_pickup: "Osobni prevzeti",
  personal_invoice: "Osobni prevzeti",
  personal: "Osobni prevzeti",
};

// ─────────────────────────────────────────────
// ADMIN EMAIL TEMPLATE
// ─────────────────────────────────────────────
function buildAdminHtmlEmail(data: OrderData): string {
  const itemsHtml = data.items
    ? data.items.map((i) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#e5e5e5;font-size:14px;">${i.name} <span style="color:#4ade80;font-size:12px;">(${i.gramAmount})</span></td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#9ca3af;font-size:14px;text-align:center;">x${i.quantity}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a1a;color:#4ade80;font-size:14px;text-align:right;font-weight:700;">${i.price} Kc</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding:16px;color:#6b7280;text-align:center;font-size:13px;">Polozky nejsou k dispozici</td></tr>`;

  const now = new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague", dateStyle: "long", timeStyle: "short" });

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#030f03;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:32px 0 24px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#052e16,#14532d);border:1px solid #166534;border-radius:12px;padding:12px 24px;">
        <span style="color:#4ade80;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Tajna Botanika - ADMIN</span>
      </div>
      <div style="margin-top:16px;display:inline-block;background:#052e16;border:1px solid #16a34a;border-radius:8px;padding:6px 20px;">
        <span style="color:#86efac;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Nova objednavka</span>
      </div>
    </div>
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Cislo objednavky</p>
      <p style="margin:4px 0 0;color:#4ade80;font-size:24px;font-weight:800;">#${data.orderNumber}</p>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">${now}</p>
    </div>
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <p style="margin:0 0 14px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Zakaznik</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;width:100px;">Jmeno</td><td style="padding:4px 0;color:#e5e5e5;font-size:13px;font-weight:600;">${data.customerName}</td></tr>
        <tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;">Email</td><td style="padding:4px 0;"><a href="mailto:${data.customerEmail}" style="color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">${data.customerEmail}</a></td></tr>
        <tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;">Telefon</td><td style="padding:4px 0;"><a href="tel:${data.customerPhone}" style="color:#4ade80;font-size:13px;font-weight:600;text-decoration:none;">${data.customerPhone}</a></td></tr>
        <tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;">Platba</td><td style="padding:4px 0;color:#e5e5e5;font-size:13px;">${paymentLabelsHtml[data.paymentMethod] || data.paymentMethod}</td></tr>
        <tr><td style="padding:4px 0;color:#9ca3af;font-size:13px;">Doprava</td><td style="padding:4px 0;color:#e5e5e5;font-size:13px;">${shippingLabels[data.shippingMethod] || data.shippingMethod}</td></tr>
      </table>
    </div>
    <div style="background:#0a1a0a;border:1px solid #1a2a1a;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #1a2a1a;"><p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Objednane polozky</p></div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#060f06;">
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Produkt</th>
          <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Ks</th>
          <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Cena</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>
    <div style="background:linear-gradient(135deg,#052e16,#14532d);border:1px solid #16a34a;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <span style="color:#86efac;font-size:15px;font-weight:700;">CELKOVA CASTKA: </span>
      <span style="color:#4ade80;font-size:28px;font-weight:800;">${data.totalAmount} Kc</span>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://tajnabotanika.online/admin" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">Otevrit Admin Panel</a>
    </div>
    <div style="text-align:center;padding:16px 0;border-top:1px solid #1a2a1a;">
      <p style="margin:0;color:#374151;font-size:11px;">Tajna Botanika · tajnabotanika.online</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// CUSTOMER CONFIRMATION EMAIL TEMPLATE
// ─────────────────────────────────────────────
function buildCustomerHtmlEmail(data: OrderData): string {
  const itemsHtml = data.items
    ? data.items.map((i) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">${i.name} <span style="color:#16a34a;font-size:12px;font-weight:600;">(${i.gramAmount})</span></td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666;font-size:14px;text-align:center;">x${i.quantity}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#16a34a;font-size:14px;text-align:right;font-weight:700;">${i.price} Kc</td>
        </tr>`).join("")
    : "";

  const now = new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague", dateStyle: "long", timeStyle: "short" });

  // Payment-specific section
  let paymentSection = "";
  if (data.paymentMethod === "bank_transfer") {
    paymentSection = `
    <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 12px;color:#16a34a;font-size:15px;font-weight:800;">Platebni udaje</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#666;font-size:13px;width:140px;">Cislo uctu:</td><td style="padding:6px 0;color:#111;font-size:14px;font-weight:700;">${BANK_ACCOUNT}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Variabilni symbol:</td><td style="padding:6px 0;color:#16a34a;font-size:16px;font-weight:800;">${data.orderNumber}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Castka k uhrade:</td><td style="padding:6px 0;color:#111;font-size:16px;font-weight:800;">${data.totalAmount} Kc</td></tr>
      </table>
      <p style="margin:14px 0 0;color:#666;font-size:12px;line-height:1.5;">Objednavku expedujeme po prijeti platby na ucet. Platbu prosim proved'te do 3 pracovnich dnu.</p>
    </div>`;
  } else if (data.paymentMethod === "cash_on_delivery") {
    paymentSection = `
    <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#d97706;font-size:15px;font-weight:800;">Platba na dobirku</p>
      <p style="margin:0;color:#666;font-size:13px;line-height:1.5;">Castku <strong style="color:#111;">${data.totalAmount} Kc</strong> uhradite pri prevzeti zasilky. Dobirka obsahuje poplatek 30 Kc.</p>
    </div>`;
  }

  // Shipping section
  let shippingSection = "";
  if (data.shippingMethod === "zasilkovna") {
    shippingSection = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 24px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#334155;font-size:14px;font-weight:700;">Doruceni pres Zasilkovnu</p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">Ocekavana doba doruceni: <strong>1-2 pracovni dny</strong>. O odeslani vas budeme informovat emailem s trackovacim odkazem.</p>
    </div>`;
  } else {
    shippingSection = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 24px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#334155;font-size:14px;font-weight:700;">Osobni odber</p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">O moznosti vyzvednuti vas budeme kontaktovat na telefon nebo email.</p>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#030f03,#0a2a0a);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <div style="margin-bottom:16px;">
        <span style="color:#4ade80;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Tajna Botanika</span>
      </div>
      <div style="background:#16a34a;display:inline-block;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:12px;">&#10003;</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Dekujeme za objednavku!</h1>
      <p style="margin:8px 0 0;color:#86efac;font-size:14px;">Vase objednavka #${data.orderNumber} byla uspesne prijata</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

      <!-- Order info -->
      <div style="display:flex;justify-content:space-between;padding-bottom:16px;margin-bottom:20px;border-bottom:1px solid #f0f0f0;">
        <div>
          <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Cislo objednavky</p>
          <p style="margin:4px 0 0;color:#111;font-size:20px;font-weight:800;">#${data.orderNumber}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Datum</p>
          <p style="margin:4px 0 0;color:#666;font-size:13px;">${now}</p>
        </div>
      </div>

      ${paymentSection}
      ${shippingSection}

      <!-- Items -->
      <div style="margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#111;font-size:15px;font-weight:700;">Prehled objednavky</p>
        <table style="width:100%;border-collapse:collapse;">
          ${itemsHtml}
        </table>
      </div>

      <!-- Total -->
      <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:2px solid #16a34a;border-radius:12px;padding:16px 24px;margin-bottom:24px;text-align:center;">
        <span style="color:#15803d;font-size:14px;font-weight:700;">CELKEM K UHRADE: </span>
        <span style="color:#16a34a;font-size:26px;font-weight:800;">${data.totalAmount} Kc</span>
      </div>

      <!-- Support -->
      <div style="background:#f8fafc;border-radius:12px;padding:16px 24px;text-align:center;">
        <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:700;">Mate dotaz k objednavce?</p>
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
          Napiste nam na <a href="mailto:tajnabotanika@seznam.cz" style="color:#16a34a;font-weight:600;text-decoration:none;">tajnabotanika@seznam.cz</a><br>
          nebo zavolejte na <a href="tel:+420739385030" style="color:#16a34a;font-weight:600;text-decoration:none;">739 385 030</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;">
      <p style="margin:0;color:#999;font-size:12px;">Tajna Botanika · <a href="https://tajnabotanika.online" style="color:#16a34a;text-decoration:none;">tajnabotanika.online</a></p>
      <p style="margin:6px 0 0;color:#bbb;font-size:11px;">Tento email byl odeslan automaticky. Prosim neodpovidejte na nej.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildCustomerPlainEmail(data: OrderData): string {
  const itemsList = data.items
    ? data.items.map((i) => `  ${i.name} (${i.gramAmount}) x${i.quantity} = ${i.price} Kc`).join("\n")
    : "";

  let paymentInfo = "";
  if (data.paymentMethod === "bank_transfer") {
    paymentInfo = `
PLATEBNI UDAJE:
  Cislo uctu: ${BANK_ACCOUNT}
  Variabilni symbol: ${data.orderNumber}
  Castka: ${data.totalAmount} Kc
  Platbu prosim proved'te do 3 pracovnich dnu.`;
  } else if (data.paymentMethod === "cash_on_delivery") {
    paymentInfo = `
PLATBA NA DOBIRKU:
  Castku ${data.totalAmount} Kc uhradite pri prevzeti zasilky.`;
  }

  return `
DEKUJEME ZA OBJEDNAVKU!

Objednavka #${data.orderNumber} byla uspesne prijata.

VASE POLOZKY:
${itemsList}

CELKEM: ${data.totalAmount} Kc
${paymentInfo}

DOPRAVA: ${shippingLabels[data.shippingMethod] || data.shippingMethod}

Mate dotaz? Kontaktujte nas:
  Email: tajnabotanika@seznam.cz
  Telefon: 739 385 030

Tajna Botanika · tajnabotanika.online
  `.trim();
}

function buildAdminPlainEmail(data: OrderData): string {
  const itemsList = data.items
    ? data.items.map((i) => `  ${i.name} (${i.gramAmount}) x${i.quantity} = ${i.price} Kc`).join("\n")
    : "  Polozky nejsou k dispozici";

  return `
NOVA OBJEDNAVKA #${data.orderNumber}

Zakaznik: ${data.customerName}
Email: ${data.customerEmail}
Telefon: ${data.customerPhone}

Platba: ${paymentLabels[data.paymentMethod] || data.paymentMethod}
Doprava: ${shippingLabels[data.shippingMethod] || data.shippingMethod}

Polozky:
${itemsList}

CELKEM: ${data.totalAmount} Kc

Admin panel: https://tajnabotanika.online/admin
  `.trim();
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
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

    // 1. Store notification in DB (always works, even without email)
    await supabase.from("admin_notifications").upsert({
      type: "new_order",
      title: `Nova objednavka #${data.orderNumber}`,
      message: `${data.customerName} — ${data.totalAmount} Kc (${paymentLabels[data.paymentMethod] || data.paymentMethod})`,
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

    // 2. Send emails via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Tajna Botanika <onboarding@resend.dev>";

    if (resendKey) {
      // 2a. Admin notification email
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [ADMIN_EMAIL],
          subject: `Nova objednavka #${data.orderNumber} — ${data.totalAmount} Kc`,
          html: buildAdminHtmlEmail(data),
          text: buildAdminPlainEmail(data),
        }),
      });

      if (!adminRes.ok) {
        console.error("Resend admin email error:", await adminRes.text());
      }

      // 2b. Customer confirmation email
      if (data.customerEmail) {
        const customerSubject = data.paymentMethod === "bank_transfer"
          ? `Objednavka #${data.orderNumber} prijata — platebni udaje uvnitr`
          : `Objednavka #${data.orderNumber} prijata — dekujeme!`;

        const customerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [data.customerEmail],
            subject: customerSubject,
            html: buildCustomerHtmlEmail(data),
            text: buildCustomerPlainEmail(data),
            reply_to: "tajnabotanika@seznam.cz",
          }),
        });

        if (!customerRes.ok) {
          console.error("Resend customer email error:", await customerRes.text());
        }
      }
    } else {
      console.warn("RESEND_API_KEY not set — emails skipped, only DB notification stored");
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
