import { store } from '../src/store/inMemoryStore';
import { InMemoryStore } from '../src/store/inMemoryStore';
import { CartService } from '../src/services/cartService';

// Fresh store and service per test suite
let testStore: InMemoryStore;
let cartService: CartService;

beforeEach(() => {
  // Re-wire: create fresh store instance and inject into service
  testStore = new InMemoryStore();
  cartService = new CartService();
  // Override the singleton with our test instance
  (cartService as any) = new CartService();
  // We'll use the real singleton but reset its state
  store.carts.clear();
  store.orders = [];
  store.discountCodes.clear();
});

describe('CartService', () => {
  describe('getOrCreateCart', () => {
    it('creates a new cart when no cartId provided', () => {
      const cart = cartService.getOrCreateCart('user1');
      expect(cart.userId).toBe('user1');
      expect(cart.items).toHaveLength(0);
      expect(store.carts.has(cart.id)).toBe(true);
    });

    it('returns existing cart when valid cartId provided', () => {
      const cart1 = cartService.getOrCreateCart('user1');
      const cart2 = cartService.getOrCreateCart('user1', cart1.id);
      expect(cart2.id).toBe(cart1.id);
    });

    it('creates new cart if cartId belongs to different user', () => {
      const cart1 = cartService.getOrCreateCart('user1');
      const cart2 = cartService.getOrCreateCart('user2', cart1.id);
      expect(cart2.id).not.toBe(cart1.id);
    });
  });

  describe('addItem', () => {
    it('adds a new item to an empty cart', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      const updated = cartService.addItem(cart.id, product.id, 2);

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0].productId).toBe(product.id);
      expect(updated.items[0].quantity).toBe(2);
    });

    it('increments quantity if same product added again', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];

      cartService.addItem(cart.id, product.id, 1);
      const updated = cartService.addItem(cart.id, product.id, 2);

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0].quantity).toBe(3);
    });

    it('throws for unknown product', () => {
      const cart = cartService.getOrCreateCart('user1');
      expect(() => cartService.addItem(cart.id, 'nonexistent', 1)).toThrow('Product');
    });

    it('throws for unknown cart', () => {
      const product = Array.from(store.products.values())[0];
      expect(() => cartService.addItem('bad-cart-id', product.id, 1)).toThrow('Cart');
    });

    it('throws when quantity exceeds stock', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      expect(() => cartService.addItem(cart.id, product.id, product.stock + 1)).toThrow('stock');
    });

    it('throws for quantity less than 1', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      expect(() => cartService.addItem(cart.id, product.id, 0)).toThrow('Quantity');
    });
  });

  describe('removeItem', () => {
    it('removes an item from cart', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      cartService.addItem(cart.id, product.id, 1);
      const updated = cartService.removeItem(cart.id, product.id);
      expect(updated.items).toHaveLength(0);
    });
  });

  describe('getSubtotal', () => {
    it('computes correct subtotal', () => {
      const cart = cartService.getOrCreateCart('user1');
      const products = Array.from(store.products.values());
      cartService.addItem(cart.id, products[0].id, 2);
      cartService.addItem(cart.id, products[1].id, 1);

      const expectedSubtotal = products[0].price * 2 + products[1].price;
      expect(cartService.getSubtotal(cart)).toBeCloseTo(expectedSubtotal, 2);
    });
  });

  describe('updateItemQuantity', () => {
    it('updates quantity', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      cartService.addItem(cart.id, product.id, 3);
      const updated = cartService.updateItemQuantity(cart.id, product.id, 1);
      expect(updated.items[0].quantity).toBe(1);
    });

    it('removes item when quantity set to 0', () => {
      const cart = cartService.getOrCreateCart('user1');
      const product = Array.from(store.products.values())[0];
      cartService.addItem(cart.id, product.id, 3);
      const updated = cartService.updateItemQuantity(cart.id, product.id, 0);
      expect(updated.items).toHaveLength(0);
    });
  });
});
