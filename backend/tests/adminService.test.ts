import { AdminService } from '../src/services/adminService';
import { CartService } from '../src/services/cartService';
import { CheckoutService } from '../src/services/checkoutService';
import { store } from '../src/store/inMemoryStore';

let adminService: AdminService;
let cartService: CartService;
let checkoutService: CheckoutService;

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.discountCodes.clear();
  store.config = { nthOrder: 5, discountPercent: 10 };
  adminService = new AdminService();
  cartService = new CartService();
  checkoutService = new CheckoutService();
});

const placeOrders = (count: number) => {
  const product = Array.from(store.products.values())[0];
  for (let i = 0; i < count; i++) {
    const cart = cartService.getOrCreateCart(`user${i}`);
    cartService.addItem(cart.id, product.id, 1);
    checkoutService.checkout({ userId: `user${i}`, cartId: cart.id });
  }
};

describe('AdminService', () => {
  describe('generateDiscountCode', () => {
    it('throws when condition not met (no orders)', () => {
      expect(() => adminService.generateDiscountCode()).toThrow('condition not met');
    });

    it('throws when order count is not a multiple of nthOrder', () => {
      placeOrders(3);
      expect(() => adminService.generateDiscountCode()).toThrow('condition not met');
    });

    it('generates a code when nth order condition is met', () => {
      placeOrders(5);
      const code = adminService.generateDiscountCode();
      expect(code.code).toMatch(/^SAVE10-/);
      expect(code.discountPercent).toBe(10);
      expect(code.isUsed).toBe(false);
      expect(store.discountCodes.has(code.code)).toBe(true);
    });

    it('throws if code already generated for this milestone', () => {
      placeOrders(5);
      adminService.generateDiscountCode(); // first generation OK
      expect(() => adminService.generateDiscountCode()).toThrow('condition not met');
    });

    it('allows generation again after next milestone (10th order)', () => {
      placeOrders(10);
      adminService.generateDiscountCode(); // for 5th milestone
      adminService.generateDiscountCode(); // for 10th milestone
      expect(store.discountCodes.size).toBe(2);
    });
  });

  describe('getStats', () => {
    it('returns zero stats initially', () => {
      const stats = adminService.getStats();
      expect(stats.totalOrders).toBe(0);
      expect(stats.totalItemsPurchased).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.totalDiscountGiven).toBe(0);
      expect(stats.discountCodes).toHaveLength(0);
    });

    it('counts items and revenue correctly', () => {
      placeOrders(3);
      const product = Array.from(store.products.values())[0];
      const stats = adminService.getStats();
      expect(stats.totalOrders).toBe(3);
      expect(stats.totalItemsPurchased).toBe(3);
      expect(stats.totalRevenue).toBeCloseTo(product.price * 3, 2);
      expect(stats.totalDiscountGiven).toBe(0);
    });

    it('reflects discounts in stats', () => {
      store.discountCodes.set('TEST10', {
        code: 'TEST10',
        discountPercent: 10,
        isUsed: false,
        generatedAt: new Date(),
        usedAt: null,
        usedByOrderId: null,
      });
      const product = Array.from(store.products.values())[0];
      const cart = cartService.getOrCreateCart('user1');
      cartService.addItem(cart.id, product.id, 1);
      checkoutService.checkout({ userId: 'user1', cartId: cart.id, discountCode: 'TEST10' });

      const stats = adminService.getStats();
      expect(stats.totalDiscountGiven).toBeGreaterThan(0);
      expect(stats.totalRevenue).toBeLessThan(stats.totalRevenueBeforeDiscounts);
    });

    it('reports pendingDiscountGeneration correctly', () => {
      placeOrders(5);
      const statsBefore = adminService.getStats();
      expect(statsBefore.pendingDiscountGeneration).toBe(true);

      adminService.generateDiscountCode();
      const statsAfter = adminService.getStats();
      expect(statsAfter.pendingDiscountGeneration).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('updates nthOrder', () => {
      adminService.updateConfig(3);
      expect(store.config.nthOrder).toBe(3);
    });

    it('updates discountPercent', () => {
      adminService.updateConfig(undefined, 20);
      expect(store.config.discountPercent).toBe(20);
    });

    it('throws for invalid nthOrder', () => {
      expect(() => adminService.updateConfig(0)).toThrow();
    });

    it('throws for invalid discountPercent', () => {
      expect(() => adminService.updateConfig(undefined, 0)).toThrow();
      expect(() => adminService.updateConfig(undefined, 101)).toThrow();
    });
  });
});
