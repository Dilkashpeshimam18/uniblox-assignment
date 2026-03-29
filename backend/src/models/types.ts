export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  total: number;
  orderNumber: number;
  createdAt: Date;
}

export interface DiscountCode {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  generatedAt: Date;
  usedAt: Date | null;
  usedByOrderId: string | null;
}

export interface StoreConfig {
  nthOrder: number;       // every nth order gets a coupon opportunity
  discountPercent: number; // percentage discount for coupons
}

export interface AdminStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalRevenueBeforeDiscounts: number;
  totalDiscountGiven: number;
  totalOrders: number;
  discountCodes: DiscountCode[];
  pendingDiscountGeneration: boolean; // whether a new code can be generated
  nextCouponAtOrder: number;
}

export interface CheckoutRequest {
  userId: string;
  cartId: string;
  discountCode?: string;
}

export interface CheckoutResponse {
  order: Order;
  message: string;
  newDiscountEligible: boolean; // tells client if this order unlocked a new coupon
}
