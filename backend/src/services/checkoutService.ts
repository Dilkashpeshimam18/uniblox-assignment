import { v4 as uuidv4 } from 'uuid';
import { CheckoutRequest, CheckoutResponse, Order } from '../models/types';
import { store } from '../store/inMemoryStore';
import { cartService } from './cartService';

export class CheckoutService {
  /**
   * Processes checkout:
   * 1. Validates cart is non-empty
   * 2. Validates and applies discount code (if provided)
   * 3. Creates order record
   * 4. Clears cart
   */
  checkout(req: CheckoutRequest): CheckoutResponse {
    const { userId, cartId, discountCode } = req;

    // --- Validate cart ---
    const cart = store.carts.get(cartId);
    if (!cart) throw new Error('Cart not found');
    if (cart.userId !== userId) throw new Error('Cart does not belong to this user');
    if (cart.items.length === 0) throw new Error('Cart is empty');

    const subtotal = cartService.getSubtotal(cart);

    // --- Validate discount code ---
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedCode: string | null = null;

    if (discountCode) {
      const code = store.discountCodes.get(discountCode.toUpperCase());
      if (!code) throw new Error(`Discount code "${discountCode}" is invalid`);
      if (code.isUsed) throw new Error(`Discount code "${discountCode}" has already been used`);

      discountPercent = code.discountPercent;
      discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
      appliedCode = code.code;
    }

    const total = parseFloat((subtotal - discountAmount).toFixed(2));
    const orderNumber = store.orderCount + 1;

    // --- Create order ---
    const order: Order = {
      id: uuidv4(),
      userId,
      cartId,
      items: [...cart.items],
      subtotal,
      discountCode: appliedCode,
      discountPercent,
      discountAmount,
      total,
      orderNumber,
      createdAt: new Date(),
    };

    store.orders.push(order);

    // --- Mark discount code as used ---
    if (appliedCode) {
      const code = store.discountCodes.get(appliedCode)!;
      code.isUsed = true;
      code.usedAt = new Date();
      code.usedByOrderId = order.id;
    }

    // --- Clear cart ---
    cartService.clearCart(cartId);

    const newDiscountEligible = store.isDiscountGenerationPending();

    return {
      order,
      message: `Order #${orderNumber} placed successfully!`,
      newDiscountEligible,
    };
  }
}

export const checkoutService = new CheckoutService();
