import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Tajna Botanika <onboarding@resend.dev>";

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get abandoned carts (1-24 hours old, not reminded yet)
    const { data: carts, error } = await supabase.rpc("get_abandoned_carts");

    if (error) {
      console.error("Error fetching abandoned carts:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!carts || carts.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No abandoned carts found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const cart of carts) {
      const emailHtml = buildAbandonedCartEmail(cart.total_value, cart.item_count);
      const emailText = buildAbandonedCartPlainEmail(cart.total_value, cart.item_count);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [cart.email],
          subject: `Zapomnel/a jsi na svuj kosik — dokoncit objednavku`,
          html: emailHtml,
          text: emailText,
          reply_to: "tajnabotanika@seznam.cz",
        }),
      });

      if (res.ok) {
        // Mark as sent
        await supabase.rpc("mark_cart_reminder_sent", { session_id_input: cart.session_id });
        sentCount++;
      } else {
        console.error(`Failed to send to ${cart.email}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ sent: sentCount, total: carts.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Abandoned cart reminder error:", error);
    return new Response(JSON.stringify({ error: "Failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function buildAbandonedCartEmail(totalValue: number, itemCount: number): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px 16px;">

    <div style="background:linear-gradient(135deg,#030f03,#0a2a0a);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <span style="color:#4ade80;font-size:26px;font-weight:800;">Tajna Botanika</span>
    </div>

    <div style="background:#fff;padding:32px 24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:12px;">&#128722;</div>
        <h1 style="margin:0;color:#111;font-size:24px;font-weight:800;">Zapomnel/a jsi na svuj kosik!</h1>
        <p style="margin:8px 0 0;color:#666;font-size:15px;">
          Mas v kosiku <strong>${itemCount}</strong> ${itemCount === 1 ? 'polozku' : itemCount < 5 ? 'polozky' : 'polozek'}
          v hodnote <strong style="color:#16a34a;">${Math.round(totalValue)} Kc</strong>
        </p>
      </div>

      <!-- Urgency -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;color:#dc2626;font-size:14px;font-weight:700;">
          Tvoje polozky cekaji, ale nemohou cekat vecne!
        </p>
        <p style="margin:6px 0 0;color:#991b1b;font-size:12px;">
          Nase produkty jsou omezene — dokonci objednavku, nez se vyprodaji.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://tajnabotanika.online/cart" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:16px;font-weight:800;padding:16px 40px;border-radius:14px;text-decoration:none;letter-spacing:0.5px;">
          Dokoncit objednavku
        </a>
      </div>

      <!-- Trust -->
      <div style="text-align:center;padding-top:16px;border-top:1px solid #f0f0f0;">
        <p style="margin:0;color:#999;font-size:12px;">
          &#10003; Doprava zdarma nad 1000 Kc &nbsp;&nbsp; &#10003; Diskretni baleni &nbsp;&nbsp; &#10003; Odeslani do 24h
        </p>
      </div>
    </div>

    <div style="text-align:center;padding:24px 0;">
      <p style="margin:0;color:#999;font-size:12px;">Tajna Botanika · <a href="https://tajnabotanika.online" style="color:#16a34a;text-decoration:none;">tajnabotanika.online</a></p>
      <p style="margin:6px 0 0;color:#bbb;font-size:11px;">Nechcete tyto emaily? Ignorujte tuto zpravu — posilame je jen jednou.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAbandonedCartPlainEmail(totalValue: number, itemCount: number): string {
  return `
ZAPOMNEL/A JSI NA SVUJ KOSIK!

Mas v kosiku ${itemCount} polozek v hodnote ${Math.round(totalValue)} Kc.

Tvoje polozky cekaji — dokonci objednavku nez se vyprodaji!

Dokoncit objednavku: https://tajnabotanika.online/cart

Doprava zdarma nad 1000 Kc | Diskretni baleni | Odeslani do 24h

Tajna Botanika · tajnabotanika.online
  `.trim();
}
