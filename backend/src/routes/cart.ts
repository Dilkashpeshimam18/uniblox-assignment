import { Router, Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cartService';

const router = Router();

/**
 * POST /api/cart
 * Create or retrieve a cart.
 * Body: { userId: string, cartId?: string }
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, cartId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    const cart = cartService.getOrCreateCart(userId, cartId);
    res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cart/:cartId
 * Retrieve cart by ID.
 */
router.get('/:cartId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = cartService.getCart(req.params.cartId);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    const subtotal = cartService.getSubtotal(cart);
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/:cartId/items
 * Add an item to the cart.
 * Body: { productId: string, quantity: number }
 */
router.post('/:cartId/items', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }
    const qty = parseInt(quantity) || 1;
    const cart = cartService.addItem(req.params.cartId, productId, qty);
    const subtotal = cartService.getSubtotal(cart);
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/cart/:cartId/items/:productId
 * Update quantity of a cart item (set to 0 to remove).
 * Body: { quantity: number }
 */
router.patch('/:cartId/items/:productId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    if (isNaN(qty)) {
      res.status(400).json({ error: 'quantity must be a number' });
      return;
    }
    const cart = cartService.updateItemQuantity(req.params.cartId, req.params.productId, qty);
    const subtotal = cartService.getSubtotal(cart);
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:cartId/items/:productId
 * Remove an item from the cart.
 */
router.delete('/:cartId/items/:productId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = cartService.removeItem(req.params.cartId, req.params.productId);
    const subtotal = cartService.getSubtotal(cart);
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
});

export default router;
