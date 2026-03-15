import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: string;
  user_data: {
    em?: string[];
    ph?: string[];
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
    const FB_PIXEL_ID = Deno.env.get("FACEBOOK_PIXEL_ID") || "4296612473987786";
    const FB_ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");

    if (!FB_ACCESS_TOKEN) {
      console.warn("Facebook Pixel tracking disabled - FACEBOOK_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Facebook tracking not configured" }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { event_name, custom_data, user_data, event_source_url } = await req.json();

    const eventTime = Math.floor(Date.now() / 1000);

    const fbEvent: FacebookEvent = {
      event_name,
      event_time: eventTime,
      event_source_url: event_source_url || "https://botanika.com",
      action_source: "website",
      user_data: {
        client_ip_address: req.headers.get("x-forwarded-for") || undefined,
        client_user_agent: req.headers.get("user-agent") || undefined,
        ...user_data,
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
