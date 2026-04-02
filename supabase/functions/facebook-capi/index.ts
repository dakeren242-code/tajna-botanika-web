import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function isValidEventData(eventName: string, customData: any): { valid: boolean; reason?: string } {
  if (!customData) return { valid: true };

  if (customData.content_ids && Array.isArray(customData.content_ids)) {
    const invalidIds = ['test', 'dummy', 'undefined', 'null', ''];
    for (const id of customData.content_ids) {
      if (!id || invalidIds.includes(String(id).toLowerCase())) {
        return { valid: false, reason: `Invalid content_id: ${id}` };
      }
      if (String(id).toLowerCase().includes('test') || String(id).toLowerCase().includes('dummy')) {
        return { valid: false, reason: `Test/dummy content_id detected: ${id}` };
      }
    }
  }

  if (customData.content_name) {
    const invalidNames = ['test', 'dummy', 'undefined', 'null'];
    if (invalidNames.includes(String(customData.content_name).toLowerCase())) {
      return { valid: false, reason: `Invalid content_name: ${customData.content_name}` };
    }
  }

  if (customData.value !== undefined && customData.value !== null) {
    if (customData.value <= 0 || !isFinite(customData.value)) {
      return { valid: false, reason: `Invalid value: ${customData.value}` };
    }
  }

  if (customData.contents && Array.isArray(customData.contents)) {
    for (const item of customData.contents) {
      if (!item.id || item.id === 'undefined' || item.id === 'null') {
        return { valid: false, reason: `Invalid content item id: ${item.id}` };
      }
      if (item.quantity <= 0 || !isFinite(item.quantity)) {
        return { valid: false, reason: `Invalid quantity: ${item.quantity}` };
      }
    }
  }

  if (eventName === 'Purchase' && !customData.value) {
    return { valid: false, reason: 'Purchase event requires a value' };
  }

  return { valid: true };
}

async function hashValue(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashIfPresent(value?: string): Promise<string[] | undefined> {
  if (!value) return undefined;
  return [await hashValue(value)];
}

interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url: string;
  action_source: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    zp?: string[];
    country?: string[];
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: Array<{ id: string; quantity: number; item_price?: number }>;
    num_items?: number;
    order_id?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const FB_PIXEL_ID = Deno.env.get("FACEBOOK_PIXEL_ID");
    const FB_ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");

    if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
      console.error("Facebook tracking not configured:", {
        hasPixelId: !!FB_PIXEL_ID,
        hasAccessToken: !!FB_ACCESS_TOKEN
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Facebook tracking not configured. Please set FACEBOOK_PIXEL_ID and FACEBOOK_ACCESS_TOKEN in Supabase edge function secrets."
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { event_name, custom_data, user_data, event_source_url, event_id } = await req.json();

    const validation = isValidEventData(event_name, custom_data);
    if (!validation.valid) {
      console.warn(`🚫 Blocked invalid event: ${event_name} - ${validation.reason}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid event data: ${validation.reason}`
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const eventTime = Math.floor(Date.now() / 1000);

    const fbEvent: FacebookEvent = {
      event_name,
      event_time: eventTime,
      event_id: event_id || undefined,
      event_source_url: event_source_url || "https://botanika.com",
      action_source: "website",
      user_data: {
        client_ip_address: req.headers.get("x-forwarded-for") || undefined,
        client_user_agent: req.headers.get("user-agent") || undefined,
        fbp: user_data?.fbp,
        fbc: user_data?.fbc,
        em: await hashIfPresent(user_data?.em),
        ph: await hashIfPresent(user_data?.ph),
        fn: await hashIfPresent(user_data?.fn),
        ln: await hashIfPresent(user_data?.ln),
        ct: await hashIfPresent(user_data?.ct),
        zp: await hashIfPresent(user_data?.zp),
        country: await hashIfPresent(user_data?.country),
        external_id: await hashIfPresent(user_data?.external_id),
      },
      custom_data: custom_data || {},
    };

    const apiUrl = `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [fbEvent],
        access_token: FB_ACCESS_TOKEN,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Facebook API Error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send event to Facebook", details: result }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`✅ Successfully sent ${event_name} event to Facebook CAPI`);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
