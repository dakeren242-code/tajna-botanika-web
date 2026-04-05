/*
  # Add Missing Columns and Seed Products

  1. Schema Changes
    - Add `gram_options` integer array column to products (for frontend size selector)
    - Add `meta_catalog_id` text column to products (for Facebook catalog sync)

  2. Seed Data
    - 9 botanical products with full details (name, description, pricing, cannabinoid data, flavor profiles)
    - Product variants for each product (1g, 3g, 5g, 10g sizes with pricing)
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS gram_options integer[] DEFAULT ARRAY[1, 3, 5, 10];
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_catalog_id text;

INSERT INTO products (name, slug, description, price, stock, category, image_url, thc_content, cbd_content, thcx_content, thc_percentage, cbd_percentage, cbg_percentage, effects, flavor_profile, featured, is_popular, color_accent, glow_color, gram_options)
VALUES
  ('Golden Nugget', 'golden-nugget', 'Sladky a ovocny strain s vysokym obsahem THC-X. Intenzivni relaxace a euforie.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667731/pexels-photo-7667731.jpeg?auto=compress&cs=tinysrgb&w=600', '0.06%', '9.05%', 40, 0.06, 9.05, 0.1, 'relaxace, euforie, kreativita', 'Sladky, ovocny, zemity', true, true, '#FFD700', '#FFD700', ARRAY[1, 3, 5, 10]),
  ('Amnesia', 'amnesia', 'Legendarni sativa-dominantni strain. Silny cerebralni efekt a energizujici ucinky.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667911/pexels-photo-7667911.jpeg?auto=compress&cs=tinysrgb&w=600', '0.05%', '8.5%', 45, 0.05, 8.5, 0.15, 'energie, fokus, kreativita', 'Citrusovy, hazy, korenity', true, false, '#00FF88', '#00FF88', ARRAY[1, 3, 5, 10]),
  ('Pineapple Zkittlez', 'pineapple-zkittlez', 'Tropicky a ovocny hybrid s vyvazenymi ucinky. Idealni na odpoledni relaxaci.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667737/pexels-photo-7667737.jpeg?auto=compress&cs=tinysrgb&w=600', '0.04%', '10.2%', 38, 0.04, 10.2, 0.2, 'relaxace, nalada, chut', 'Ananas, bonbony, tropicke ovoce', true, false, '#FF6B35', '#FF6B35', ARRAY[1, 3, 5, 10]),
  ('Gelato', 'gelato', 'Premiovy hybrid znamy svou sladkou chuti a silnymi relaxacnimi ucinky.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667729/pexels-photo-7667729.jpeg?auto=compress&cs=tinysrgb&w=600', '0.06%', '11.0%', 42, 0.06, 11.0, 0.12, 'relaxace, euforie, spanek', 'Sladky, vanilkovy, kremovy', true, true, '#2ECC71', '#2ECC71', ARRAY[1, 3, 5, 10]),
  ('Lemon Cherry Gelato', 'lemon-cherry-gelato', 'Exkluzivni strain s jedinecnou kombinaci citrusovych a tresnovych tonu.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667735/pexels-photo-7667735.jpeg?auto=compress&cs=tinysrgb&w=600', '0.05%', '9.8%', 44, 0.05, 9.8, 0.18, 'relaxace, nalada, kreativita', 'Citron, tresen, kremovy', true, false, '#E74C3C', '#E74C3C', ARRAY[1, 3, 5, 10]),
  ('Bubble Gum', 'bubble-gum', 'Klasicky strain se sladkou zvykackovou chuti. Prijemna a vyrovnana relaxace.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667733/pexels-photo-7667733.jpeg?auto=compress&cs=tinysrgb&w=600', '0.04%', '8.0%', 35, 0.04, 8.0, 0.1, 'relaxace, nalada, socialni', 'Zvykacka, sladky, ovocny', true, false, '#FF69B4', '#FF69B4', ARRAY[1, 3, 5, 10]),
  ('Forbidden Fruit', 'forbidden-fruit', 'Exoticky indica strain s hlubokymi relaxacnimi ucinky a ovocnym aroma.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667739/pexels-photo-7667739.jpeg?auto=compress&cs=tinysrgb&w=600', '0.06%', '12.0%', 40, 0.06, 12.0, 0.25, 'hluboka relaxace, spanek, uleva', 'Tresen, mango, citrus', true, false, '#8B0000', '#8B0000', ARRAY[1, 3, 5, 10]),
  ('Wedding Cake', 'wedding-cake', 'Luxusni hybrid s bohatou chuti vanilky a pepre. Silna relaxace tela.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667741/pexels-photo-7667741.jpeg?auto=compress&cs=tinysrgb&w=600', '0.05%', '10.5%', 43, 0.05, 10.5, 0.15, 'relaxace, euforie, uleva od bolesti', 'Vanilka, pepr, zemity', true, false, '#F5F5DC', '#F5F5DC', ARRAY[1, 3, 5, 10]),
  ('Blue Dream', 'blue-dream', 'Popularni sativa hybrid s vyvazenymi ucinky. Jemna relaxace s cerebralni stimulaci.', 190, 100, 'flower', 'https://images.pexels.com/photos/7667743/pexels-photo-7667743.jpeg?auto=compress&cs=tinysrgb&w=600', '0.05%', '9.5%', 41, 0.05, 9.5, 0.14, 'relaxace, kreativita, fokus', 'Boruvka, sladky, vanilka', true, true, '#4169E1', '#4169E1', ARRAY[1, 3, 5, 10])
ON CONFLICT (slug) DO NOTHING;