import { CheckoutService } from '../src/services/checkoutService';
import { CartService } from '../src/services/cartService';
import { store } from '../src/store/inMemoryStore';

let checkoutService: CheckoutService;
let cartService: CartService;

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.discountCodes.clear();
  store.config = { nthOrder: 5, discountPercent: 10 };
  checkoutService = new CheckoutService();
  cartService = new CartService();
});

describe('CheckoutService', () => {
  const setupCart = () => {
    const cart = cartService.getOrCreateCart('user1');
    const product = Array.from(store.products.values())[0];
    cartService.addItem(cart.id, product.id, 2);
    return { cart, product };
  };

  describe('checkout', () => {
    it('creates an order and clears the cart', () => {
      const { cart, product } = setupCart();
      const result = checkoutService.checkout({ userId: 'user1', cartId: cart.id });

      expect(result.order.userId).toBe('user1');
      expect(result.order.items).toHaveLength(1);
      expect(result.order.subtotal).toBeCloseTo(product.price * 2, 2);
      expect(result.order.discountCode).toBeNull();
      expect(result.order.discountAmount).toBe(0);
      expect(result.order.total).toBeCloseTo(product.price * 2, 2);
      expect(store.orders).toHaveLength(1);

      // Cart should be cleared
      expect(cart.items).toHaveLength(0);
    });

    it('assigns sequential order numbers', () => {
      for (let i = 0; i < 3; i++) {
        const cart = cartService.getOrCreateCart(`user${i}`);
        const product = Array.from(store.products.values())[0];
        cartService.addItem(cart.id, product.id, 1);
        checkoutService.checkout({ userId: `user${i}`, cartId: cart.id });
      }
      expect(store.orders[0].orderNumber).toBe(1);
      expect(store.orders[1].orderNumber).toBe(2);
      expect(store.orders[2].orderNumber).toBe(3);
    });

    it('applies a valid discount code', () => {
      const { cart, product } = setupCart();
      // Manually add a valid code
      store.discountCodes.set('TEST10', {
        code: 'TEST10',
        discountPercent: 10,
        isUsed: false,
        generatedAt: new Date(),
        usedAt: null,
        usedByOrderId: null,
      });

      const result = checkoutService.checkout({
        userId: 'user1',
        cartId: cart.id,
        discountCode: 'TEST10',
      });

      const expectedSubtotal = product.price * 2;
      const expectedDiscount = parseFloat(((expectedSubtotal * 10) / 100).toFixed(2));
      expect(result.order.discountAmount).toBe(expectedDiscount);
      expect(result.order.total).toBeCloseTo(expectedSubtotal - expectedDiscount, 2);
      expect(result.order.discountCode).toBe('TEST10');
      expect(store.discountCodes.get('TEST10')!.isUsed).toBe(true);
    });

    it('throws for invalid discount code', () => {
      const { cart } = setupCart();
      expect(() =>
        checkoutService.checkout({ userId: 'user1', cartId: cart.id, discountCode: 'INVALID' })
      ).toThrow('invalid');
    });

    it('throws for already-used discount code', () => {
      store.discountCodes.set('USED10', {
        code: 'USED10',
        discountPercent: 10,
        isUsed: true,
        generatedAt: new Date(),
        usedAt: new Date(),
        usedByOrderId: 'some-order',
      });
      const { cart } = setupCart();
      expect(() =>
        checkoutService.checkout({ userId: 'user1', cartId: cart.id, discountCode: 'USED10' })
      ).toThrow('already been used');
    });

    it('throws for empty cart', () => {
      const cart = cartService.getOrCreateCart('user1');
      expect(() => checkoutService.checkout({ userId: 'user1', cartId: cart.id })).toThrow('empty');
    });

    it('throws for cart belonging to different user', () => {
      const { cart } = setupCart();
      expect(() =>
        checkoutService.checkout({ userId: 'user2', cartId: cart.id })
      ).toThrow('does not belong');
    });

    it('signals newDiscountEligible after nth order', () => {
      store.config.nthOrder = 2;
      // First order
      const cart1 = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      cartService.addItem(cart1.id, product.id, 1);
      const result1 = checkoutService.checkout({ userId: 'user1', cartId: cart1.id });
      expect(result1.newDiscountEligible).toBe(false);

      // Second order = nth -> eligible
      const cart2 = cartService.getOrCreateCart('user2');
      cartService.addItem(cart2.id, product.id, 1);
      const result2 = checkoutService.checkout({ userId: 'user2', cartId: cart2.id });
      expect(result2.newDiscountEligible).toBe(true);
    });
  });
});
