import { v4 as uuidv4 } from 'uuid';
import { Cart, DiscountCode, Order, Product, StoreConfig } from '../models/types';

/**
 * In-memory store – single source of truth for all runtime data.
 * Exported as a singleton so all services share the same state.
 */
export class InMemoryStore {
  products: Map<string, Product> = new Map();
  carts: Map<string, Cart> = new Map();
  orders: Order[] = [];
  discountCodes: Map<string, DiscountCode> = new Map();
  config: StoreConfig = {
    nthOrder: 5,
    discountPercent: 10,
  };

  constructor() {
    this.seedProducts();
  }

  private seedProducts(): void {
    const products: Product[] = [
      {
        id: uuidv4(),
        name: 'Wireless Headphones',
        price: 79.99,
        description: 'Premium noise-cancelling wireless headphones with 30hr battery.',
        imageUrl: 'https://picsum.photos/seed/headphones/400/280',
        stock: 50,
      },
      {
        id: uuidv4(),
        name: 'Mechanical Keyboard',
        price: 129.99,
        description: 'TKL mechanical keyboard with RGB backlight and tactile switches.',
        imageUrl: 'https://picsum.photos/seed/keyboard/400/280',
        stock: 30,
      },
      {
        id: uuidv4(),
        name: 'USB-C Hub',
        price: 49.99,
        description: '7-in-1 USB-C hub with HDMI, SD card reader, and power delivery.',
        imageUrl: 'https://picsum.photos/seed/usbhub/400/280',
        stock: 100,
      },
      {
        id: uuidv4(),
        name: 'Webcam HD',
        price: 89.99,
        description: '1080p HD webcam with built-in microphone and auto-focus.',
        imageUrl: 'https://picsum.photos/seed/webcam/400/280',
        stock: 40,
      },
      {
        id: uuidv4(),
        name: 'Desk Lamp',
        price: 39.99,
        description: 'LED desk lamp with adjustable brightness and color temperature.',
        imageUrl: 'https://picsum.photos/seed/desklamp/400/280',
        stock: 75,
      },
      {
        id: uuidv4(),
        name: 'Mouse Pad XL',
        price: 24.99,
        description: 'Extended mouse pad with stitched edges, 900x400mm.',
        imageUrl: 'https://picsum.photos/seed/mousepad/400/280',
        stock: 200,
      },
    ];

    products.forEach((p) => this.products.set(p.id, p));
  }

  /** Total completed orders count */
  get orderCount(): number {
    return this.orders.length;
  }

  /**
   * Returns true if the last completed order number is a multiple of nthOrder
   * AND no discount code has been generated for that milestone yet.
   */
  isDiscountGenerationPending(): boolean {
    const count = this.orderCount;
    if (count === 0) return false;
    if (count % this.config.nthOrder !== 0) return false;

    // Check how many codes have been generated for milestones up to current count
    const expectedCodes = Math.floor(count / this.config.nthOrder);
    return this.discountCodes.size < expectedCodes;
  }

  /** Next order number that will trigger a discount eligibility */
  nextCouponAtOrder(): number {
    const count = this.orderCount;
    const n = this.config.nthOrder;
    return (Math.floor(count / n) + 1) * n;
  }
}

// Singleton export
export const store = new InMemoryStore();
