import { v4 as uuidv4 } from 'uuid';
import { AdminStats, DiscountCode } from '../models/types';
import { store } from '../store/inMemoryStore';

export class AdminService {
  /**
   * Generates a new discount code if the nth-order condition is met
   * and no code has been generated for the current milestone yet.
   *
   * Throws if the condition is not satisfied (prevents gaming the system).
   */
  generateDiscountCode(): DiscountCode {
    if (!store.isDiscountGenerationPending()) {
      const next = store.nextCouponAtOrder();
      throw new Error(
        `Discount generation condition not met. Next coupon available after order #${next}.`
      );
    }

    // Generate a readable, unique code: SAVE10-XXXX
    const suffix = uuidv4().split('-')[0].toUpperCase();
    const code = `SAVE${store.config.discountPercent}-${suffix}`;

    const discountCode: DiscountCode = {
      code,
      discountPercent: store.config.discountPercent,
      isUsed: false,
      generatedAt: new Date(),
      usedAt: null,
      usedByOrderId: null,
    };

    store.discountCodes.set(code, discountCode);
    return discountCode;
  }

  /**
   * Returns aggregate stats for admin dashboard:
   * - total items purchased
   * - total revenue (after discounts)
   * - total discounts given
   * - all discount codes and their status
   */
  getStats(): AdminStats {
    const orders = store.orders;

    const totalItemsPurchased = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    const totalRevenueBeforeDiscounts = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscountGiven = orders.reduce((sum, o) => sum + o.discountAmount, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalItemsPurchased,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalRevenueBeforeDiscounts: parseFloat(totalRevenueBeforeDiscounts.toFixed(2)),
      totalDiscountGiven: parseFloat(totalDiscountGiven.toFixed(2)),
      totalOrders: orders.length,
      discountCodes: Array.from(store.discountCodes.values()),
      pendingDiscountGeneration: store.isDiscountGenerationPending(),
      nextCouponAtOrder: store.nextCouponAtOrder(),
    };
  }

  /** Update store config (nthOrder, discountPercent) */
  updateConfig(nthOrder?: number, discountPercent?: number): void {
    if (nthOrder !== undefined) {
      if (nthOrder < 1) throw new Error('nthOrder must be >= 1');
      store.config.nthOrder = nthOrder;
    }
    if (discountPercent !== undefined) {
      if (discountPercent < 1 || discountPercent > 100) throw new Error('discountPercent must be 1-100');
      store.config.discountPercent = discountPercent;
    }
  }

  getConfig() {
    return { ...store.config };
  }
}

export const adminService = new AdminService();
