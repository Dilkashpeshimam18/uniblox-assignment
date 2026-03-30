import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

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
}

export interface Order {
  id: string;
  orderNumber: number;
  items: CartItem[];
  subtotal: number;
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  total: number;
  createdAt: string;
}

export interface DiscountCode {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  generatedAt: string;
}

export interface AdminStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalRevenueBeforeDiscounts: number;
  totalDiscountGiven: number;
  totalOrders: number;
  discountCodes: DiscountCode[];
  pendingDiscountGeneration: boolean;
  nextCouponAtOrder: number;
}

export const productApi = {
  list: () => api.get<{ products: Product[] }>('/products').then(r => r.data.products),
};

export const cartApi = {
  create: (userId: string, cartId?: string) =>
    api.post<{ cart: Cart }>('/cart', { userId, cartId }).then(r => r.data.cart),
  get: (cartId: string) =>
    api.get<{ cart: Cart; subtotal: number }>(`/cart/${cartId}`).then(r => r.data),
  addItem: (cartId: string, productId: string, quantity: number) =>
    api.post<{ cart: Cart; subtotal: number }>(`/cart/${cartId}/items`, { productId, quantity }).then(r => r.data),
  updateItem: (cartId: string, productId: string, quantity: number) =>
    api.patch<{ cart: Cart; subtotal: number }>(`/cart/${cartId}/items/${productId}`, { quantity }).then(r => r.data),
  removeItem: (cartId: string, productId: string) =>
    api.delete<{ cart: Cart; subtotal: number }>(`/cart/${cartId}/items/${productId}`).then(r => r.data),
};

export const checkoutApi = {
  checkout: (userId: string, cartId: string, discountCode?: string) =>
    api.post<{ order: Order; message: string; newDiscountEligible: boolean }>('/checkout', {
      userId, cartId, discountCode,
    }).then(r => r.data),
};

export const adminApi = {
  getStats: () => api.get<{ stats: AdminStats }>('/admin/stats').then(r => r.data.stats),
  generateCode: () =>
    api.post<{ discountCode: DiscountCode; message: string }>('/admin/discount-codes/generate').then(r => r.data),
  getConfig: () => api.get<{ config: { nthOrder: number; discountPercent: number } }>('/admin/config').then(r => r.data.config),
  updateConfig: (nthOrder: number, discountPercent: number) =>
    api.patch('/admin/config', { nthOrder, discountPercent }),
};
