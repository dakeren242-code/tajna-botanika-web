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
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  meta_catalog_id?: string;
}

interface BatchRequest {
  method: string;
  retailer_id: string;
  data?: Record<string, unknown>;
}

interface BatchResponse {
  handles?: string[];
  errors?: Array<{ retailer_id: string; error: { message: string; code: number } }>;
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
    const SITE_URL = Deno.env.get("SITE_URL") || "https://lifixfqilzqfkbrzycsg.supabase.co";

    console.log(`🔍 Config check - Catalog ID: ${FACEBOOK_CATALOG_ID ? 'SET' : 'MISSING'}, Token: ${FACEBOOK_ACCESS_TOKEN ? 'SET' : 'MISSING'}`);

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

    const body = await req.json();
    const { action } = body;

    console.log(`📋 Action requested: ${action}`);

    // First, verify the catalog exists and we have access
    console.log(`🔍 Verifying catalog access...`);
    const verifyUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}?fields=id,name,product_count&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error(`❌ Catalog verification failed:`, verifyResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Cannot access catalog ${FACEBOOK_CATALOG_ID}. Error: ${verifyResult.error?.message || 'Unknown error'}`,
          details: verifyResult,
          troubleshooting: [
            "1. Verify Catalog ID is correct (check Facebook Commerce Manager)",
            "2. Ensure Access Token has 'catalog_management' permission",
            "3. Confirm you have admin access to this catalog",
            "4. Check if the token hasn't expired",
          ],
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

    console.log(`✅ Catalog verified:`, verifyResult);

    // Fetch all products from database
    console.log(`📦 Fetching products from database...`);
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

    console.log(`✅ Found ${products.length} products in database`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ id: string; product_name: string; error: string; rejection_reason?: string }>,
      synced_products: [] as Array<{ id: string; product_name: string; catalog_id: string }>,
    };

    if (action === "sync" || action === "create") {
      console.log(`🔄 Starting product sync...`);

      // Use batch API to sync products
      const batch_requests: BatchRequest[] = products.map((product: Product) => {
        const priceInCents = Math.round(Number(product.price) * 100);
        const retailer_id = product.meta_catalog_id || product.id;

        return {
          method: "UPDATE",
          retailer_id: retailer_id,
          data: {
            name: product.name,
            description: product.description || product.name,
            availability: product.stock_quantity > 0 ? "in stock" : "out of stock",
            condition: "new",
            price: priceInCents,
            currency: "CZK",
            url: `${SITE_URL}/product/${product.slug || product.id}`,
            image_url: product.image_url || `${SITE_URL}/placeholder.jpg`,
            brand: "Botanika",
          },
        };
      });

      // Process in batches of 50 (Facebook limit)
      const batchSize = 50;
      for (let i = 0; i < batch_requests.length; i += batchSize) {
        const batch = batch_requests.slice(i, i + batchSize);
        console.log(`📤 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(batch_requests.length / batchSize)} (${batch.length} products)`);

        try {
          const batchUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/batch`;
          const response = await fetch(batchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: FACEBOOK_ACCESS_TOKEN,
              requests: batch,
            }),
          });

          const result: BatchResponse = await response.json();
          console.log(`📥 Batch response:`, JSON.stringify(result).substring(0, 500));

          if (response.ok) {
            // Check if we have handles (successful uploads)
            if (result.handles && result.handles.length > 0) {
              for (let j = 0; j < batch.length; j++) {
                const retailer_id = batch[j].retailer_id;
                const handle = result.handles[j];
                const product = products.find((p: Product) =>
                  p.id === retailer_id || p.meta_catalog_id === retailer_id
                );

                if (handle && handle !== "") {
                  results.success++;
                  results.synced_products.push({
                    id: retailer_id,
                    product_name: product?.name || "Unknown",
                    catalog_id: handle,
                  });

                  // Update meta_catalog_id in database if needed
                  if (product && !product.meta_catalog_id) {
                    await supabase
                      .from("products")
                      .update({ meta_catalog_id: retailer_id })
                      .eq("id", product.id);
                  }
                  console.log(`✅ Product synced: ${product?.name} (${retailer_id})`);
                } else {
                  results.failed++;
                  const errorInfo = result.errors?.find(e => e.retailer_id === retailer_id);
                  results.errors.push({
                    id: retailer_id,
                    product_name: product?.name || "Unknown",
                    error: errorInfo?.error?.message || "No handle returned from Facebook",
                    rejection_reason: errorInfo?.error?.message,
                  });
                  console.log(`❌ Product failed: ${product?.name} (${retailer_id})`);
                }
              }
            }

            // Check for specific errors in response
            if (result.errors && result.errors.length > 0) {
              for (const error of result.errors) {
                const product = products.find((p: Product) =>
                  p.id === error.retailer_id || p.meta_catalog_id === error.retailer_id
                );

                if (!results.errors.find(e => e.id === error.retailer_id)) {
                  results.failed++;
                  results.errors.push({
                    id: error.retailer_id,
                    product_name: product?.name || "Unknown",
                    error: error.error.message,
                    rejection_reason: `Code ${error.error.code}: ${error.error.message}`,
                  });
                  console.log(`❌ Product error: ${product?.name} - ${error.error.message}`);
                }
              }
            }
          } else {
            console.error(`❌ Batch request failed:`, result);
            // Batch failed entirely
            for (const req of batch) {
              const product = products.find((p: Product) =>
                p.id === req.retailer_id || p.meta_catalog_id === req.retailer_id
              );
              results.failed++;
              results.errors.push({
                id: req.retailer_id,
                product_name: product?.name || "Unknown",
                error: JSON.stringify(result),
                rejection_reason: (result as unknown as { error?: { message: string } }).error?.message || "Batch request failed",
              });
            }
          }
        } catch (error) {
          console.error(`❌ Batch processing error:`, error);
          for (const req of batch) {
            const product = products.find((p: Product) =>
              p.id === req.retailer_id || p.meta_catalog_id === req.retailer_id
            );
            results.failed++;
            results.errors.push({
              id: req.retailer_id,
              product_name: product?.name || "Unknown",
              error: error instanceof Error ? error.message : "Unknown error",
              rejection_reason: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    } else if (action === "delete") {
      console.log(`🗑️ Starting product deletion...`);

      // Delete products using batch API
      const batch_requests: BatchRequest[] = products.map((product: Product) => ({
        method: "DELETE",
        retailer_id: product.meta_catalog_id || product.id,
      }));

      const batchSize = 50;
      for (let i = 0; i < batch_requests.length; i += batchSize) {
        const batch = batch_requests.slice(i, i + batchSize);

        try {
          const batchUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/batch`;
          const response = await fetch(batchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: FACEBOOK_ACCESS_TOKEN,
              requests: batch,
            }),
          });

          const result = await response.json();

          if (response.ok) {
            results.success += batch.length;
            console.log(`✅ Deleted ${batch.length} products`);
          } else {
            for (const req of batch) {
              const product = products.find((p: Product) =>
                p.id === req.retailer_id || p.meta_catalog_id === req.retailer_id
              );
              results.failed++;
              results.errors.push({
                id: req.retailer_id,
                product_name: product?.name || "Unknown",
                error: JSON.stringify(result),
              });
            }
          }
        } catch (error) {
          for (const req of batch) {
            const product = products.find((p: Product) =>
              p.id === req.retailer_id || p.meta_catalog_id === req.retailer_id
            );
            results.failed++;
            results.errors.push({
              id: req.retailer_id,
              product_name: product?.name || "Unknown",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    } else if (action === "fetch") {
      console.log(`📥 Fetching products from catalog...`);

      // Fetch products from catalog and update database
      try {
        const apiUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_CATALOG_ID}/products?fields=id,retailer_id,name,price,availability&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=1000`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (response.ok && result.data) {
          const catalogProducts = result.data;
          console.log(`✅ Found ${catalogProducts.length} products in catalog`);

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
                product_name: dbProduct.name,
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

    console.log(`✅ Sync completed: ${results.success} success, ${results.failed} failed`);

    const responseData = {
      success: results.failed === 0,
      results,
      total_products: products.length,
      summary: `Successfully synced ${results.success}/${products.length} products. ${results.failed} failed.`,
    };

    // Log the full response for debugging
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
