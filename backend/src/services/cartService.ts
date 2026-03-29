import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem } from '../models/types';
import { store } from '../store/inMemoryStore';

export class CartService {
  /**
   * Retrieves an existing cart by ID or creates a new one for the user.
   */
  getOrCreateCart(userId: string, cartId?: string): Cart {
    if (cartId) {
      const existing = store.carts.get(cartId);
      if (existing && existing.userId === userId) return existing;
    }

    const newCart: Cart = {
      id: uuidv4(),
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.carts.set(newCart.id, newCart);
    return newCart;
  }

  getCart(cartId: string): Cart | undefined {
    return store.carts.get(cartId);
  }

  /**
   * Adds a product to the cart. If the product already exists, increments quantity.
   * Throws if product is not found or insufficient stock.
   */
  addItem(cartId: string, productId: string, quantity: number): Cart {
    const cart = store.carts.get(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);

    const product = store.products.get(productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    if (quantity < 1) throw new Error('Quantity must be at least 1');

    const existingIndex = cart.items.findIndex((i) => i.productId === productId);
    const currentQty = existingIndex >= 0 ? cart.items[existingIndex].quantity : 0;

    if (currentQty + quantity > product.stock) {
      throw new Error(`Insufficient stock. Available: ${product.stock - currentQty}`);
    }

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      const item: CartItem = {
        productId,
        productName: product.name,
        price: product.price,
        quantity,
      };
      cart.items.push(item);
    }

    cart.updatedAt = new Date();
    return cart;
  }

  /**
   * Updates quantity of an existing cart item. Set quantity to 0 to remove it.
   */
  updateItemQuantity(cartId: string, productId: string, quantity: number): Cart {
    const cart = store.carts.get(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);

    const product = store.products.get(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const idx = cart.items.findIndex((i) => i.productId === productId);
    if (idx < 0) throw new Error('Item not in cart');

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      if (quantity > product.stock) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
      }
      cart.items[idx].quantity = quantity;
    }

    cart.updatedAt = new Date();
    return cart;
  }

  /** Removes an item entirely from the cart */
  removeItem(cartId: string, productId: string): Cart {
    return this.updateItemQuantity(cartId, productId, 0);
  }

  /** Clears all items from a cart (used post-checkout) */
  clearCart(cartId: string): void {
    const cart = store.carts.get(cartId);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
    }
  }

  /** Computes subtotal for a cart */
  getSubtotal(cart: Cart): number {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

export const cartService = new CartService();
