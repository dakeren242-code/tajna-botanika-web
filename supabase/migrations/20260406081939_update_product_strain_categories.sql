/*
  # Update Product Strain Categories

  Changes product categories from generic 'flower' to specific strain types:
  - sativa: Sativa-dominant strains (energizing, uplifting)
  - indica: Indica-dominant strains (relaxing, calming)
  - hybrid: Balanced hybrid strains

  Product assignments:
  - SATIVA: Amnesia, Blue Dream
  - INDICA: Bubble Gum, Forbidden Fruit, Gelato, Lemon Cherry Gelato, Wedding Cake
  - HYBRID: Golden Nugget, Pineapple Zkittlez
*/

UPDATE products SET category = 'sativa' WHERE name IN ('Amnesia', 'Blue Dream');

UPDATE products SET category = 'indica' WHERE name IN ('Bubble Gum', 'Forbidden Fruit', 'Gelato', 'Lemon Cherry Gelato', 'Wedding Cake');

UPDATE products SET category = 'hybrid' WHERE name IN ('Golden Nugget', 'Pineapple Zkittlez');
