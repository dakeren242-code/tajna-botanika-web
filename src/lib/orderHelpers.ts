/**
 * Order helper functions for status management
 */

import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  FULFILLMENT_STATUS,
  PAYMENT_METHOD,
  type OrderStatus,
  type PaymentStatus,
  type FulfillmentStatus,
} from './constants';

// =============================================================================
// INITIAL STATUS HELPERS
// =============================================================================

/**
 * Get initial order status based on payment method
 *
 * @param paymentMethod - The payment method code
 * @returns Initial order status
 */
export const getInitialOrderStatus = (paymentMethod: string): OrderStatus => {
  switch (paymentMethod) {
    case PAYMENT_METHOD.BANK_TRANSFER:
      // Bank transfer: order is confirmed, waiting for payment
      return ORDER_STATUS.CONFIRMED;

    case PAYMENT_METHOD.CASH_ON_DELIVERY:
      // COD: order is confirmed, payment will be collected on delivery
      return ORDER_STATUS.CONFIRMED;

    case PAYMENT_METHOD.CARD:
      // Card: order is pending until payment is confirmed via webhook
      return ORDER_STATUS.PENDING;

    default:
      return ORDER_STATUS.CONFIRMED;
  }
};

/**
 * Get initial payment status based on payment method
 *
 * @param paymentMethod - The payment method code
 * @returns Initial payment status
 */
export const getInitialPaymentStatus = (paymentMethod: string): PaymentStatus => {
  switch (paymentMethod) {
    case PAYMENT_METHOD.BANK_TRANSFER:
      // Bank transfer: waiting for customer to make payment
      return PAYMENT_STATUS.PENDING;

    case PAYMENT_METHOD.CASH_ON_DELIVERY:
      // COD: payment will be collected on delivery
      return PAYMENT_STATUS.PENDING;

    case PAYMENT_METHOD.CARD:
      // Card: payment initiated, waiting for gateway confirmation
      return PAYMENT_STATUS.AWAITING_CONFIRMATION;

    default:
      return PAYMENT_STATUS.PENDING;
  }
};

/**
 * Get initial fulfillment status (always unfulfilled for new orders)
 */
export const getInitialFulfillmentStatus = (): FulfillmentStatus => {
  return FULFILLMENT_STATUS.UNFULFILLED;
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if order can be cancelled
 *
 * @param status - Current order status
 * @returns True if order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
  ].includes(status);
};

/**
 * Check if order can be refunded
 *
 * @param paymentStatus - Current payment status
 * @returns True if order can be refunded
 */
export const canRefund = (paymentStatus: PaymentStatus): boolean => {
  return paymentStatus === PAYMENT_STATUS.PAID;
};

/**
 * Check if order can be shipped
 *
 * @param status - Current order status
 * @param paymentStatus - Current payment status
 * @param paymentMethod - Payment method code
 * @returns True if order can be shipped
 */
export const canShipOrder = (
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  paymentMethod: string
): boolean => {
  // Order must be confirmed
  if (status !== ORDER_STATUS.CONFIRMED) {
    return false;
  }

  // For COD, can ship even if not paid yet
  if (paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY) {
    return true;
  }

  // For other payment methods, must be paid first
  return paymentStatus === PAYMENT_STATUS.PAID;
};

/**
 * Check if order can be marked as delivered
 *
 * @param status - Current order status
 * @returns True if order can be marked as delivered
 */
export const canMarkAsDelivered = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.SHIPPED;
};

// =============================================================================
// STATUS TRANSITION HELPERS
// =============================================================================

/**
 * Get next valid statuses for an order
 *
 * @param currentStatus - Current order status
 * @param paymentStatus - Current payment status
 * @returns Array of valid next statuses
 */
export const getNextValidStatuses = (
  currentStatus: OrderStatus,
  paymentStatus: PaymentStatus
): OrderStatus[] => {
  switch (currentStatus) {
    case ORDER_STATUS.PENDING:
      return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED];

    case ORDER_STATUS.CONFIRMED:
      // Can only ship if paid (or COD)
      if (paymentStatus === PAYMENT_STATUS.PAID || paymentStatus === PAYMENT_STATUS.PENDING) {
        return [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED];
      }
      return [ORDER_STATUS.CANCELLED];

    case ORDER_STATUS.PROCESSING:
      return [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED];

    case ORDER_STATUS.SHIPPED:
      return [ORDER_STATUS.DELIVERED];

    case ORDER_STATUS.DELIVERED:
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.FAILED:
      // Terminal states
      return [];

    default:
      return [];
  }
};

/**
 * Validate status transition
 *
 * @param fromStatus - Current status
 * @param toStatus - Desired status
 * @param paymentStatus - Current payment status
 * @returns True if transition is valid
 */
export const isValidStatusTransition = (
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  paymentStatus: PaymentStatus
): boolean => {
  const validNextStatuses = getNextValidStatuses(fromStatus, paymentStatus);
  return validNextStatuses.includes(toStatus);
};

// =============================================================================
// STATUS BADGE HELPERS (for UI)
// =============================================================================

/**
 * Get CSS classes for order status badge
 *
 * @param status - Order status
 * @returns Tailwind CSS classes
 */
export const getOrderStatusClasses = (status: OrderStatus): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

  switch (status) {
    case ORDER_STATUS.PENDING:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case ORDER_STATUS.CONFIRMED:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case ORDER_STATUS.PROCESSING:
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case ORDER_STATUS.SHIPPED:
      return `${baseClasses} bg-indigo-100 text-indigo-800`;
    case ORDER_STATUS.DELIVERED:
      return `${baseClasses} bg-green-100 text-green-800`;
    case ORDER_STATUS.CANCELLED:
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case ORDER_STATUS.FAILED:
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return baseClasses;
  }
};

/**
 * Get CSS classes for payment status badge
 *
 * @param status - Payment status
 * @returns Tailwind CSS classes
 */
export const getPaymentStatusClasses = (status: PaymentStatus): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case PAYMENT_STATUS.AWAITING_CONFIRMATION:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case PAYMENT_STATUS.PAID:
      return `${baseClasses} bg-green-100 text-green-800`;
    case PAYMENT_STATUS.FAILED:
      return `${baseClasses} bg-red-100 text-red-800`;
    case PAYMENT_STATUS.REFUNDED:
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case PAYMENT_STATUS.PARTIALLY_REFUNDED:
      return `${baseClasses} bg-orange-100 text-orange-800`;
    default:
      return baseClasses;
  }
};

/**
 * Get CSS classes for fulfillment status badge
 *
 * @param status - Fulfillment status
 * @returns Tailwind CSS classes
 */
export const getFulfillmentStatusClasses = (status: FulfillmentStatus): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

  switch (status) {
    case FULFILLMENT_STATUS.UNFULFILLED:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case FULFILLMENT_STATUS.PARTIAL:
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case FULFILLMENT_STATUS.FULFILLED:
      return `${baseClasses} bg-green-100 text-green-800`;
    case FULFILLMENT_STATUS.RETURNED:
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return baseClasses;
  }
};
