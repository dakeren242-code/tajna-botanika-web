/*
  # Deaktivace platby dobírkou

  Vypne možnost platby dobírkou, ponechává pouze bankovní převod jako jediný aktivní způsob platby.

  1. Změny
    - Deaktivuje platební metodu "cash_on_delivery" (dobírka)
    - Ponechává aktivní pouze "bank_transfer" (bankovní převod)
*/

-- Deaktivace dobírky
UPDATE payment_methods
SET is_active = false
WHERE code = 'cash_on_delivery';
