/**
 * Shared constants for the e-commerce application
 * These values must match the database CHECK constraints
 */

// =============================================================================
// ORDER STATUSES - Order lifecycle
// =============================================================================
export const ORDER_STATUS = {
  PENDING: 'pending',         // Waiting for confirmation
  CONFIRMED: 'confirmed',     // Confirmed by customer
  PROCESSING: 'processing',   // Being prepared/packed
  SHIPPED: 'shipped',         // Sent to customer
  DELIVERED: 'delivered',     // Delivered to customer
  CANCELLED: 'cancelled',     // Cancelled
  FAILED: 'failed',           // Failed (technical error, out of stock)
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// =============================================================================
// PAYMENT STATUSES - Payment state
// =============================================================================
export const PAYMENT_STATUS = {
  PENDING: 'pending',                           // Waiting for payment
  AWAITING_CONFIRMATION: 'awaiting_confirmation', // Payment initiated, waiting for confirmation
  PAID: 'paid',                                 // Paid
  FAILED: 'failed',                             // Payment failed
  REFUNDED: 'refunded',                         // Refunded
  PARTIALLY_REFUNDED: 'partially_refunded',     // Partially refunded
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// =============================================================================
// FULFILLMENT STATUSES - Fulfillment state
// =============================================================================
export const FULFILLMENT_STATUS = {
  UNFULFILLED: 'unfulfilled',  // Not fulfilled
  PARTIAL: 'partial',          // Partially fulfilled
  FULFILLED: 'fulfilled',      // Fully fulfilled
  RETURNED: 'returned',        // Returned by customer
} as const;

export type FulfillmentStatus = typeof FULFILLMENT_STATUS[keyof typeof FULFILLMENT_STATUS];

// =============================================================================
// PAYMENT METHODS
// =============================================================================
export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  CASH_ON_DELIVERY: 'cash_on_delivery',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// =============================================================================
// SHIPPING METHODS
// =============================================================================
export const SHIPPING_METHOD = {
  ZASILKOVNA: 'zasilkovna',
  PERSONAL_PICKUP: 'personal_pickup',
  PERSONAL_INVOICE: 'personal_invoice',
} as const;

export type ShippingMethod = typeof SHIPPING_METHOD[keyof typeof SHIPPING_METHOD];

// =============================================================================
// HELPER ARRAYS (for UI rendering, validation)
// =============================================================================
export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS);
export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);
export const FULFILLMENT_STATUS_LIST = Object.values(FULFILLMENT_STATUS);
export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHOD);
export const SHIPPING_METHOD_LIST = Object.values(SHIPPING_METHOD);

// =============================================================================
// STATUS LABELS (for UI display)
// =============================================================================
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'Čeká na potvrzení',
  [ORDER_STATUS.CONFIRMED]: 'Potvrzena',
  [ORDER_STATUS.PROCESSING]: 'Zpracovává se',
  [ORDER_STATUS.SHIPPED]: 'Odesláno',
  [ORDER_STATUS.DELIVERED]: 'Doručeno',
  [ORDER_STATUS.CANCELLED]: 'Zrušeno',
  [ORDER_STATUS.FAILED]: 'Selhalo',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'Čeká na platbu',
  [PAYMENT_STATUS.AWAITING_CONFIRMATION]: 'Čeká na potvrzení',
  [PAYMENT_STATUS.PAID]: 'Zaplaceno',
  [PAYMENT_STATUS.FAILED]: 'Platba selhala',
  [PAYMENT_STATUS.REFUNDED]: 'Vráceno',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Částečně vráceno',
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  [FULFILLMENT_STATUS.UNFULFILLED]: 'Neexpedováno',
  [FULFILLMENT_STATUS.PARTIAL]: 'Částečně expedováno',
  [FULFILLMENT_STATUS.FULFILLED]: 'Expedováno',
  [FULFILLMENT_STATUS.RETURNED]: 'Vráceno',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.BANK_TRANSFER]: 'Bankovní převod',
  [PAYMENT_METHOD.CARD]: 'Platba kartou',
  [PAYMENT_METHOD.CASH_ON_DELIVERY]: 'Dobírka',
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  [SHIPPING_METHOD.ZASILKOVNA]: 'Zásilkovna',
  [SHIPPING_METHOD.PERSONAL_PICKUP]: 'Osobní odběr - Praha',
  [SHIPPING_METHOD.PERSONAL_INVOICE]: 'Osobní odběr - Fakturace',
};
