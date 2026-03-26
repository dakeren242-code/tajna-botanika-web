import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  meta_catalog_id?: string;
}

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new";
  price: string;
  link: string;
  image_link: string;
  brand: string;
  google_product_category?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const FACEBOOK_CATALOG_ID = Deno.env.get("FACEBOOK_CATALOG_ID");
    const FACEBOOK_ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://botanika.com";

    if (!FACEBOOK_CATALOG_ID || !FACEBOOK_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Facebook catalog not configured. Please set FACEBOOK_CATALOG_ID and FACEBOOK_ACCESS_TOKEN.",
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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Supabase not configured.",
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action } = await req.json();

    // Fetch all products from database
    const { data: products, error: dbError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No products found in database",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Convert products to Facebook catalog format
    const catalogItems: CatalogItem[] = products.map((product: Product) => ({
      id: product.meta_catalog_id || product.id,
      title: product.name,
      description: product.description || product.name,
      availability: product.stock_quantity > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: `${product.price} CZK`,
      link: `${SITE_URL}/products/${product.id}`,
      image_link: product.image_url || `${SITE_URL}/placeholder.jpg`,
      brand: "Botanika",
      google_product_category: "Health & Beauty > Personal Care > Cosmetics",
    }));

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
      synced_products: [] as Array<{ id: string; catalog_id: string }>,
    };

    if (action === "sync" || action === "create") {
      // Sync/Create products in Facebook catalog
      for (const item of catalogItems) {
        try {
          const apiUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/products`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: FACEBOOK_ACCESS_TOKEN,
              requests: [
                {
                  method: "UPDATE",
                  retailer_id: item.id,
                  data: {
                    title: item.title,
                    description: item.description,
                    availability: item.availability,
                    condition: item.condition,
                    price: item.price,
                    link: item.link,
                    image_link: item.image_link,
                    brand: item.brand,
                  },
                },
              ],
            }),
          });

          const result = await response.json();

          if (response.ok && result.handles) {
            results.success++;
            results.synced_products.push({
              id: item.id,
              catalog_id: result.handles[0],
            });

            // Update meta_catalog_id in database if it was created
            const product = products.find((p: Product) =>
              p.meta_catalog_id === item.id || p.id === item.id
            );

            if (product && !product.meta_catalog_id) {
              await supabase
                .from("products")
                .update({ meta_catalog_id: item.id })
                .eq("id", product.id);
            }
          } else {
            results.failed++;
            results.errors.push({
              id: item.id,
              error: JSON.stringify(result),
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } else if (action === "delete") {
      // Delete all products from catalog
      for (const item of catalogItems) {
        try {
          const apiUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/products`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: FACEBOOK_ACCESS_TOKEN,
              requests: [
                {
                  method: "DELETE",
                  retailer_id: item.id,
                },
              ],
            }),
          });

          const result = await response.json();

          if (response.ok) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push({
              id: item.id,
              error: JSON.stringify(result),
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } else if (action === "fetch") {
      // Fetch products from catalog and update database
      try {
        const apiUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/products?fields=id,retailer_id,name,price,availability&access_token=${FACEBOOK_ACCESS_TOKEN}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (response.ok && result.data) {
          const catalogProducts = result.data;

          // Update database with catalog IDs
          for (const catalogProduct of catalogProducts) {
            const dbProduct = products.find((p: Product) =>
              p.id === catalogProduct.retailer_id
            );

            if (dbProduct && !dbProduct.meta_catalog_id) {
              await supabase
                .from("products")
                .update({ meta_catalog_id: catalogProduct.retailer_id })
                .eq("id", dbProduct.id);

              results.success++;
              results.synced_products.push({
                id: dbProduct.id,
                catalog_id: catalogProduct.retailer_id,
              });
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              catalog_products: catalogProducts,
              results,
            }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          throw new Error(JSON.stringify(result));
        }
      } catch (error) {
        throw new Error(`Failed to fetch catalog: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    console.log(`✅ Catalog sync completed: ${results.success} success, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        total_products: catalogItems.length,
      }),
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
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
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
