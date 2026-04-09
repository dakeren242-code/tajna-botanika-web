import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `Si zákaznická podpora pro Tajná Botanika (tajnabotanika.online) - český prémiový e-shop s THC-X produkty.

Pravidla:
- Odpovídej VŽDY v češtině, přátelsky a stručně (max 2-3 věty)
- Používej emoji umírněně
- Nikdy nevymýšlej ceny ani produkty, které neznáš
- Pokud nevíš přesnou odpověď, nabídni kontakt na email tajnabotanika@seznam.cz

Klíčové informace o eshopu:
- THC-X je plně legální kanabinoid v České republice, produkty jsou sběratelské předměty
- Všechny produkty jsou laboratorně testované a mají certifikáty
- Doprava: Zásilkovna 79 Kč, ZDARMA nad 1000 Kč, osobní převzetí Praha-Beroun ZDARMA
- Platba: bankovní převod nebo dobírka (+30 Kč)
- Registrovaní zákazníci mají 15% slevu na první objednávku (slevový kód v profilu)
- Pro potvrzení bankovního převodu zákazník POŠLE SCREENSHOT platby do tohoto chatu
- Recenze jsou skutečné od reálných zákazníků
- Email: tajnabotanika@seznam.cz

Ohledně recenzí: Pokud někdo zpochybňuje autenticitu recenzí, zdvořile vysvětli, že jsou od skutečných zákazníků.`;

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
    const { conversation_id, message, user_email, user_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch conversation history for context
    const { data: history } = await supabase
      .from("support_messages")
      .select("sender, message, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false })
      .limit(12);

    const historyMessages = (history || [])
      .reverse()
      .filter((m: any) => m.sender === "user" || m.sender === "bot")
      .map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
      }));

    // Ensure conversation ends with current user message
    if (
      historyMessages.length === 0 ||
      historyMessages[historyMessages.length - 1].role !== "user"
    ) {
      historyMessages.push({ role: "user", content: message });
    }

    let aiReply =
      "Děkujeme za zprávu! 💚 Brzy vám odpovíme. Pro rychlejší pomoc nás kontaktujte na tajnabotanika@seznam.cz";

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 350,
          system: SYSTEM_PROMPT,
          messages: historyMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (text) aiReply = text;
      } else {
        console.error("Anthropic API error:", response.status, await response.text());
      }
    } else {
      console.warn("ANTHROPIC_API_KEY not set, using fallback reply");
    }

    // Save AI reply to DB as 'bot' (admin can still send their own 'admin' reply on top)
    await supabase.from("support_messages").insert({
      conversation_id,
      sender: "bot",
      message: aiReply,
      user_email: null,
      user_id: null,
    });

    return new Response(JSON.stringify({ reply: aiReply, success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("AI reply error:", error);
    return new Response(
      JSON.stringify({ error: "AI reply failed", success: false }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
