#!/usr/bin/env node

const SUPABASE_URL = 'https://lifixfqilzqfkbrzycsg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZml4ZnFpbHpxZmticnp5Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwOTU2NDcsImV4cCI6MjA4OTY3MTY0N30.wpqKWH09ZcbnSgwn5XFPkM-WjcY5t1OnkZtRIhtRngY';

async function syncCatalog() {
  console.log('🚀 Starting Facebook Catalog sync...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/facebook-catalog-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sync' }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Sync failed:', data.error);
      process.exit(1);
    }

    if (data.success) {
      console.log('✅ Catalog sync completed!\n');
      console.log('📊 Results:');
      console.log(`  - Total products: ${data.total_products}`);
      console.log(`  - Successfully synced: ${data.results.success}`);
      console.log(`  - Failed: ${data.results.failed}\n`);

      if (data.results.synced_products.length > 0) {
        console.log('📦 Synced products:');
        data.results.synced_products.forEach((product) => {
          console.log(`  - ID: ${product.id} → Catalog ID: ${product.catalog_id}`);
        });
        console.log('');
      }

      if (data.results.errors.length > 0) {
        console.log('⚠️  Errors:');
        data.results.errors.forEach((error) => {
          console.log(`  - ${error.id}: ${error.error}`);
        });
        console.log('');
      }

      console.log('✨ All done! Your products are now in Facebook Catalog.');
    } else {
      console.error('❌ Sync failed:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncCatalog();
