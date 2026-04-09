import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
  STRATEGIC ABANDONED CART EMAIL SEQUENCE:

  Wave 1 (1 hour):  "Zapomnel/a jsi na kosik" - gentle reminder
  Wave 2 (24 hours): "Tvoje polozky se vyprodavaji" + 5% discount code
  Wave 3 (3 days):   "Posledni sance" + 10% discount code (expires in 24h)

  Call this function via cron every 30 minutes.
  It processes all 3 waves in a single call.
*/

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Tajna Botanika <onboarding@resend.dev>";

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const results = { wave1: 0, wave2: 0, wave3: 0 };

    // Process all 3 waves
    for (const wave of [1, 2, 3]) {
      const { data: carts } = await supabase.rpc("get_abandoned_carts_by_wave", { wave_number: wave });
      if (!carts || carts.length === 0) continue;

      for (const cart of carts) {
        let discountCode: string | null = null;

        // Wave 2: Generate 5% discount code
        if (wave === 2) {
          discountCode = "KOSIK5-" + Math.random().toString(36).substring(2, 7).toUpperCase();
          await supabase.from("discount_codes").insert({
            code: discountCode,
            discount_percent: 5,
            expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          });
        }

        // Wave 3: Generate 10% discount code (24h urgency)
        if (wave === 3) {
          discountCode = "FINAL10-" + Math.random().toString(36).substring(2, 7).toUpperCase();
          await supabase.from("discount_codes").insert({
            code: discountCode,
            discount_percent: 10,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours only!
          });
        }

        const html = buildEmail(wave, cart.total_value, cart.item_count, discountCode);
        const subject = wave === 1
          ? "Zapomnel/a jsi na svuj kosik"
          : wave === 2
          ? "Tvoje polozky se vyprodavaji — mame pro tebe slevu 5%"
          : "Posledni sance: 10% sleva na tvuj kosik (plati jen 24h)";

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: senderEmail,
            to: [cart.email],
            subject,
            html,
            reply_to: "tajnabotanika@seznam.cz",
          }),
        });

        if (res.ok) {
          await supabase.rpc("mark_cart_reminder_sent", { session_id_input: cart.session_id, wave_input: wave });
          if (wave === 1) results.wave1++;
          else if (wave === 2) results.wave2++;
          else results.wave3++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Abandoned cart error:", error);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

function buildEmail(wave: number, totalValue: number, itemCount: number, discountCode: string | null): string {
  const headline = wave === 1
    ? "Zapomnel/a jsi na svuj kosik!"
    : wave === 2
    ? "Tvoje polozky se vyprodavaji!"
    : "Posledni sance — zitra uz bude pozde!";

  const subtext = wave === 1
    ? `Mas v kosiku <strong>${itemCount}</strong> polozek v hodnote <strong style="color:#16a34a;">${Math.round(totalValue)} Kc</strong>`
    : wave === 2
    ? `Nechceme aby ti utekly! Mame pro tebe <strong style="color:#16a34a;">slevu 5%</strong> na dokonceni objednavky.`
    : `Tvuj exkluzivni kod na <strong style="color:#dc2626;">10% slevu</strong> vyprsi za 24 hodin. Potom uz bude pozde.`;

  const urgencyColor = wave === 3 ? "#dc2626" : wave === 2 ? "#f59e0b" : "#16a34a";

  let discountSection = "";
  if (discountCode) {
    const percent = wave === 2 ? "5%" : "10%";
    const expiry = wave === 3 ? "24 hodin" : "3 dny";
    discountSection = `
      <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="margin:0 0 8px;color:#666;font-size:13px;">Tvuj exkluzivni slevovy kod na <strong>${percent}</strong>:</p>
        <div style="background:#fff;border:2px solid #16a34a;border-radius:8px;padding:12px 24px;display:inline-block;margin-bottom:8px;">
          <span style="color:#16a34a;font-size:24px;font-weight:900;letter-spacing:3px;">${discountCode}</span>
        </div>
        <p style="margin:0;color:#999;font-size:11px;">Platnost: ${expiry}</p>
      </div>`;
  }

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
        <div style="font-size:48px;margin-bottom:12px;">${wave === 3 ? '&#9200;' : '&#128722;'}</div>
        <h1 style="margin:0;color:#111;font-size:22px;font-weight:800;">${headline}</h1>
        <p style="margin:10px 0 0;color:#666;font-size:15px;line-height:1.5;">${subtext}</p>
      </div>
      ${discountSection}
      <div style="background:${wave === 3 ? '#fef2f2' : '#fffbeb'};border:1px solid ${wave === 3 ? '#fecaca' : '#fde68a'};border-radius:12px;padding:14px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;color:${urgencyColor};font-size:13px;font-weight:700;">
          ${wave === 1 ? 'Nase produkty jsou omezene — nenechte si je utect!' : wave === 2 ? 'Ostatni zakaznici nakupuji — nenechte si polozky ujit!' : 'Kod vyprsi za 24 hodin. Toto je posledni pripominka.'}
        </p>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://tajnabotanika.online/cart" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:16px;font-weight:800;padding:16px 40px;border-radius:14px;text-decoration:none;">
          ${discountCode ? 'Uplatnit slevu a dokoncit' : 'Dokoncit objednavku'}
        </a>
      </div>
      <div style="text-align:center;padding-top:16px;border-top:1px solid #f0f0f0;">
        <p style="margin:0;color:#999;font-size:12px;">Doprava zdarma nad 1000 Kc | Diskretni baleni | Odeslani do 24h</p>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0;">
      <p style="margin:0;color:#999;font-size:12px;">Tajna Botanika</p>
      <p style="margin:6px 0 0;color:#bbb;font-size:11px;">Toto je posledni email v teto serii. Nechcete-li tyto emaily, ignorujte je.</p>
    </div>
  </div>
</body>
</html>`;
}
