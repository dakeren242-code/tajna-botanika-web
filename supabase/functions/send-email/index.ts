import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variant: string;
  }>;
  subtotal: number;
  shippingCost: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  bankAccount?: string;
  variableSymbol?: string;
}

interface StatusUpdateEmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
}

interface EmailRequest {
  type: 'order_confirmation' | 'order_status_update';
  data: OrderEmailData | StatusUpdateEmailData;
}

function generateStatusUpdateEmail(data: StatusUpdateEmailData): string {
  const statusMessages: Record<string, { title: string; description: string; color: string }> = {
    confirmed: {
      title: 'Objednávka potvrzena',
      description: 'Vaše objednávka byla potvrzena a připravujeme ji k odeslání.',
      color: '#10b981'
    },
    processing: {
      title: 'Zpracování objednávky',
      description: 'Vaše objednávka se právě zpracovává.',
      color: '#3b82f6'
    },
    shipped: {
      title: 'Objednávka odeslána',
      description: 'Vaše objednávka byla odeslána a je na cestě k vám.',
      color: '#f59e0b'
    },
    delivered: {
      title: 'Objednávka doručena',
      description: 'Vaše objednávka byla úspěšně doručena. Děkujeme za nákup!',
      color: '#10b981'
    },
    cancelled: {
      title: 'Objednávka zrušena',
      description: 'Vaše objednávka byla zrušena.',
      color: '#ef4444'
    },
    paid: {
      title: 'Platba přijata',
      description: 'Platba byla přijata a objednávka bude brzy odeslána.',
      color: '#10b981'
    }
  };

  const statusInfo = statusMessages[data.newStatus] || {
    title: 'Změna stavu objednávky',
    description: 'Stav vaší objednávky byl aktualizován.',
    color: '#6b7280'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktualizace objednávky ${data.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #064e3b 50%, #000000 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); border-bottom: 2px solid rgba(16, 185, 129, 0.3);">
            <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 3px solid rgba(255, 255, 255, 0.3);">
              <span style="font-size: 40px;">📦</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${statusInfo.title}</h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">Objednávka ${data.orderNumber}</p>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">Dobrý den ${data.customerName},</h2>

            <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 24px 0;">
              ${statusInfo.description}
            </p>

            ${data.message ? `
              <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #d1d5db; margin: 0; line-height: 1.6;">${data.message}</p>
              </div>
            ` : ''}

            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 95, 70, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
              <div style="color: #9ca3af; font-size: 13px; margin-bottom: 6px;">Číslo objednávky</div>
              <div style="color: #10b981; font-size: 24px; font-weight: bold;">${data.orderNumber}</div>
            </div>

            <div style="margin-top: 32px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-left: 4px solid #10b981; border-radius: 8px;">
              <p style="color: #d1d5db; margin: 0; line-height: 1.6; font-size: 14px;">
                <strong style="color: #10b981;">📧 Potřebujete pomoc?</strong><br>
                Neváhejte nás kontaktovat na emailu <a href="mailto:info@tajnabotanika.com" style="color: #10b981; text-decoration: none;">info@tajnabotanika.com</a>
              </p>
            </div>
          </div>

          <div style="padding: 24px; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(16, 185, 129, 0.2); text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">
              © 2024 Tajná Botanika. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const isBankTransfer = data.paymentMethod === 'bank_transfer';
  const bankDetails = isBankTransfer ? `
    <div style="background: linear-gradient(135deg, #047857 0%, #065f46 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid #10b981;">
      <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; margin-bottom: 16px;">💳 Platební instrukce</h2>
      <p style="color: #d1fae5; margin-bottom: 20px;">Proveďte prosím platbu na následující účet:</p>

      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Číslo účtu</div>
        <div style="color: #ffffff; font-size: 20px; font-weight: bold;">${data.bankAccount || '2001645045/2010'}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px;">
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Částka</div>
          <div style="color: #10b981; font-size: 18px; font-weight: bold;">${data.totalAmount.toFixed(2)} Kč</div>
        </div>

        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px;">
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Variabilní symbol</div>
          <div style="color: #ffffff; font-size: 18px; font-weight: bold;">${data.variableSymbol || data.orderNumber}</div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px;">
        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Zpráva pro příjemce</div>
        <div style="color: #ffffff; font-size: 16px; font-weight: bold;">Objednávka ${data.orderNumber}</div>
      </div>

      <div style="background: rgba(59, 130, 246, 0.2); border-radius: 8px; padding: 16px; margin-top: 16px; border-left: 4px solid #3b82f6;">
        <p style="color: #93c5fd; margin: 0; font-size: 14px;"><strong>⚠️ Důležité:</strong></p>
        <ul style="color: #dbeafe; margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">
          <li>Platbu proveďte do <strong style="color: #ffffff;">3 pracovních dnů</strong></li>
          <li>Nezapomeňte uvést <strong style="color: #ffffff;">variabilní symbol ${data.variableSymbol || data.orderNumber}</strong></li>
          <li>Po přijetí platby vám zašleme potvrzení na email</li>
          <li>Objednávka bude expedována po připsání platby</li>
        </ul>
      </div>
    </div>
  ` : '';

  const shippingInfo = data.shippingMethod === 'zasilkovna' ? 'Zásilkovna' :
                       data.shippingMethod === 'personal_pickup' ? 'Osobní odběr' :
                       data.shippingMethod === 'personal_invoice' ? 'Osobní odběr po uhrazení faktury' : 'Doprava';

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #374151;">
        <div style="color: #ffffff; font-weight: 600;">${item.name}</div>
        <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">${item.variant}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #374151; text-align: center; color: #d1d5db;">${item.quantity}×</td>
      <td style="padding: 12px; border-bottom: 1px solid #374151; text-align: right; color: #10b981; font-weight: 600;">${(item.price * item.quantity).toFixed(2)} Kč</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potvrzení objednávky ${data.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #064e3b 50%, #000000 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-bottom: 2px solid rgba(16, 185, 129, 0.3);">
            <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 3px solid rgba(255, 255, 255, 0.3);">
              <span style="font-size: 40px;">✓</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Děkujeme za objednávku!</h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">Vaše objednávka byla úspěšně přijata</p>
          </div>

          <div style="padding: 32px 24px;">
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 95, 70, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="color: #9ca3af; font-size: 13px; margin-bottom: 6px;">Číslo objednávky</div>
              <div style="color: #10b981; font-size: 28px; font-weight: bold;">${data.orderNumber}</div>
            </div>

            <h2 style="color: #ffffff; font-size: 18px; margin: 24px 0 16px 0;">Dobrý den ${data.customerName},</h2>
            <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 24px 0;">
              Děkujeme za vaši objednávku! ${isBankTransfer ? 'Po přijetí platby' : 'Brzy'} vám zašleme další informace o zpracování a doručení.
            </p>

            ${bankDetails}

            <h3 style="color: #ffffff; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #374151; padding-bottom: 8px;">📦 Objednané položky</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: rgba(16, 185, 129, 0.1);">
                  <th style="padding: 12px; text-align: left; color: #10b981; font-size: 13px; font-weight: 600; border-bottom: 2px solid #374151;">PRODUKT</th>
                  <th style="padding: 12px; text-align: center; color: #10b981; font-size: 13px; font-weight: 600; border-bottom: 2px solid #374151;">MNOŽSTVÍ</th>
                  <th style="padding: 12px; text-align: right; color: #10b981; font-size: 13px; font-weight: 600; border-bottom: 2px solid #374151;">CENA</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #374151;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">Mezisoučet:</td>
                  <td style="padding: 8px 0; text-align: right; color: #d1d5db; font-weight: 600;">${data.subtotal.toFixed(2)} Kč</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">Doprava (${shippingInfo}):</td>
                  <td style="padding: 8px 0; text-align: right; color: #d1d5db; font-weight: 600;">${data.shippingCost > 0 ? data.shippingCost.toFixed(2) + ' Kč' : 'ZDARMA'}</td>
                </tr>
                ${data.codFee > 0 ? `
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">Dobírka:</td>
                  <td style="padding: 8px 0; text-align: right; color: #d1d5db; font-weight: 600;">${data.codFee.toFixed(2)} Kč</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #10b981;">
                  <td style="padding: 16px 0 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">Celkem:</td>
                  <td style="padding: 16px 0 0 0; text-align: right; color: #10b981; font-size: 24px; font-weight: bold;">${data.totalAmount.toFixed(2)} Kč</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 32px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-left: 4px solid #10b981; border-radius: 8px;">
              <p style="color: #d1d5db; margin: 0; line-height: 1.6; font-size: 14px;">
                <strong style="color: #10b981;">📧 Potřebujete pomoc?</strong><br>
                Neváhejte nás kontaktovat na emailu <a href="mailto:info@tajnabotanika.com" style="color: #10b981; text-decoration: none;">info@tajnabotanika.com</a>
              </p>
            </div>
          </div>

          <div style="padding: 24px; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(16, 185, 129, 0.2); text-align: center;">
            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: left;">
              <p style="color: #fbbf24; margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">⚠️ Důležité upozornění</p>
              <p style="color: #d1d5db; margin: 0; font-size: 12px; line-height: 1.5;">
                Všechny produkty jsou botanické materiály určené výhradně ke sběratelským, studijním a analytickým účelům.
                Produkty nejsou určeny ke konzumaci. Prodej probíhá v souladu s platnou legislativou EU.
              </p>
            </div>
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">
              © 2024 Tajná Botanika. Všechna práva vyhrazena.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">
              Tento email byl odeslán automaticky. Prosím neodpovídejte na něj.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { type, data }: EmailRequest = await req.json();

    if (!data.to || !data.orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let subject = "";
    let html = "";

    if (type === "order_confirmation") {
      subject = `Potvrzení objednávky ${data.orderNumber} - Tajná Botanika`;
      html = generateOrderConfirmationEmail(data as OrderEmailData);
    } else if (type === "order_status_update") {
      const statusData = data as StatusUpdateEmailData;
      subject = `Aktualizace objednávky ${statusData.orderNumber} - Tajná Botanika`;
      html = generateStatusUpdateEmail(statusData);
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown email type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailApiKey = Deno.env.get("RESEND_API_KEY");

    if (!emailApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured", success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        from: "Tajná Botanika <objednavky@tajnabotanika.com>",
        to: [data.to],
        subject: subject,
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Email sending failed:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: errorData,
          success: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await emailResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
