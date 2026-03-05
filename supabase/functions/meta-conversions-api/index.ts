import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * =========================
 * ENV VARIABLES REQUIRED
 * =========================
 * META_PIXEL_ID          — Dataset / Pixel ID (napr. 1323004113206297)
 * META_ACCESS_TOKEN      — CAPI Access Token (zacina EAAC...) — NIKDY nesdilej
 * INTERNAL_API_KEY       — Interni klic pro autentizaci z frontendu
 * META_TEST_EVENT_CODE   — Volitelne, pro testovaci rezim v Events Manageru
 * META_DEBUG             — Volitelne, nastav na "true" pro debug logy (bez citlivych dat)
 * ALLOWED_ORIGIN         — Volitelne, CORS origin (default *)
 */

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
const DEBUG = Deno.env.get("META_DEBUG") === "true";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key, X-Client-Info, Apikey",
};

function debugLog(message: string, data?: Record<string, unknown>): void {
  if (!DEBUG) return;
  if (data) {
    console.log(`[META_DEBUG] ${message}`, JSON.stringify(data));
  } else {
    console.log(`[META_DEBUG] ${message}`);
  }
}

interface MetaEventData {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source: "website";
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string;
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    num_items?: number;
    order_id?: string;
    payment_method?: string;
    shipping_method?: string;
    session_id?: string;
    scroll_depth?: number;
    time_on_page?: number;
    search_string?: string;
    registration_method?: string;
    [key: string]: unknown;
  };
}

interface ConversionsAPIPayload {
  data: MetaEventData[];
  test_event_code?: string;
}

async function sha256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const encoded = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isHashed(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

async function maybeHash(value: string): Promise<string> {
  return isHashed(value) ? value : await sha256(value);
}

async function enrichLocationFromIP(ip: string): Promise<{
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
}> {
  if (!ip || ip === "unknown") return {};

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) return {};

    const data = await res.json();
    if (data.error) return {};

    // Normalizace: lowercase + trim pro konzistentní SHA-256
    return {
      ct: data.city ? data.city.trim().toLowerCase() : undefined,
      st: data.region_code ? data.region_code.toLowerCase() : undefined,
      zp: data.postal ? String(data.postal).replace(/\s/g, "") : undefined,
      country: data.country_code ? data.country_code.toLowerCase() : undefined,
    };
  } catch {
    return {};
  }
}

async function sendToMetaCAPI(
  pixelId: string,
  accessToken: string,
  eventData: MetaEventData,
  testEventCode?: string
): Promise<Response> {
  const payload: ConversionsAPIPayload = {
    data: [eventData],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  debugLog("Sending to Meta CAPI", {
    event_name: eventData.event_name,
    event_id: eventData.event_id,
    pixel_id: pixelId,
    test_mode: !!testEventCode,
    has_email: !!eventData.user_data.em?.length,
    has_phone: !!eventData.user_data.ph?.length,
    has_fbp: !!eventData.user_data.fbp,
    has_geo: !!eventData.user_data.country,
    value: eventData.custom_data?.value,
    currency: eventData.custom_data?.currency,
    order_id: eventData.custom_data?.order_id,
  });

  return await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: accessToken }),
    }
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const META_TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE");
    const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");

    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.error("[CAPI] META_PIXEL_ID nebo META_ACCESS_TOKEN neni nastaveno v secrets");
      throw new Error("Meta credentials not configured");
    }

    const requestApiKey = req.headers.get("x-api-key");
    if (!INTERNAL_API_KEY || requestApiKey !== INTERNAL_API_KEY) {
      debugLog("Unauthorized request — invalid x-api-key");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Content-Type must be application/json");
    }

    const body = await req.text();
    if (!body) throw new Error("Request body is empty");

    const eventData: MetaEventData = JSON.parse(body);

    if (!eventData.event_name || !eventData.event_id) {
      throw new Error("Missing required fields: event_name or event_id");
    }

    debugLog("Event received", {
      event_name: eventData.event_name,
      event_id: eventData.event_id,
    });

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rawUserData = eventData.user_data;

    const geoData = (rawUserData.ct || rawUserData.country)
      ? {}
      : await enrichLocationFromIP(clientIp);

    const hashedEm = rawUserData.em?.length
      ? await Promise.all(rawUserData.em.map(maybeHash))
      : undefined;

    const hashedPh = rawUserData.ph?.length
      ? await Promise.all(rawUserData.ph.map(maybeHash))
      : undefined;

    const hashedFn = rawUserData.fn ? await maybeHash(rawUserData.fn) : undefined;
    const hashedLn = rawUserData.ln ? await maybeHash(rawUserData.ln) : undefined;

    const hashedCt = rawUserData.ct
      ? await maybeHash(rawUserData.ct)
      : geoData.ct ? await sha256(geoData.ct) : undefined;
    const hashedSt = rawUserData.st
      ? await maybeHash(rawUserData.st)
      : geoData.st ? await sha256(geoData.st) : undefined;
    const hashedZp = rawUserData.zp
      ? await maybeHash(rawUserData.zp)
      : geoData.zp ? await sha256(geoData.zp) : undefined;
    const hashedCountry = rawUserData.country
      ? await maybeHash(rawUserData.country)
      : geoData.country ? await sha256(geoData.country) : undefined;

    const hashedExternalId = rawUserData.external_id
      ? await maybeHash(rawUserData.external_id)
      : undefined;

    const enrichedEvent: MetaEventData = {
      ...eventData,
      event_time:
        typeof eventData.event_time === "number"
          ? eventData.event_time
          : Math.floor(Date.now() / 1000),
      user_data: {
        ...(rawUserData.fbp ? { fbp: rawUserData.fbp } : {}),
        ...(rawUserData.fbc ? { fbc: rawUserData.fbc } : {}),
        client_user_agent: rawUserData.client_user_agent,
        client_ip_address: clientIp,
        ...(hashedEm ? { em: hashedEm } : {}),
        ...(hashedPh ? { ph: hashedPh } : {}),
        ...(hashedFn ? { fn: hashedFn } : {}),
        ...(hashedLn ? { ln: hashedLn } : {}),
        ...(hashedCt ? { ct: hashedCt } : {}),
        ...(hashedSt ? { st: hashedSt } : {}),
        ...(hashedZp ? { zp: hashedZp } : {}),
        ...(hashedCountry ? { country: hashedCountry } : {}),
        ...(hashedExternalId ? { external_id: hashedExternalId } : {}),
      },
    };

    const metaResponse = await sendToMetaCAPI(
      META_PIXEL_ID,
      META_ACCESS_TOKEN,
      enrichedEvent,
      META_TEST_EVENT_CODE || undefined
    );

    const text = await metaResponse.text();
    let responseData: Record<string, unknown> = {};

    try {
      responseData = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid response from Meta API");
    }

    if (!metaResponse.ok) {
      console.error("[CAPI] Meta API error:", {
        status: metaResponse.status,
        event_name: eventData.event_name,
        event_id: eventData.event_id,
        error_code: (responseData?.error as any)?.code,
        error_message: (responseData?.error as any)?.message,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData,
          event_id: eventData.event_id,
        }),
        { status: metaResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[CAPI] Event sent successfully:", {
      event_name: eventData.event_name,
      event_id: eventData.event_id,
      events_received: responseData.events_received,
      fbtrace_id: responseData.fbtrace_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        event_id: eventData.event_id,
        events_received: responseData.events_received || 0,
        fbtrace_id: responseData.fbtrace_id || "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CAPI] Unhandled error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
