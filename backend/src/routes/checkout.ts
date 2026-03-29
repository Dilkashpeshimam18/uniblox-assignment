import { Router, Request, Response, NextFunction } from 'express';
import { checkoutService } from '../services/checkoutService';

const router = Router();

/**
 * POST /api/checkout
 * Process checkout for a cart.
 * Body: { userId: string, cartId: string, discountCode?: string }
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, cartId, discountCode } = req.body;

    if (!userId || !cartId) {
      res.status(400).json({ error: 'userId and cartId are required' });
      return;
    }

    const result = checkoutService.checkout({ userId, cartId, discountCode });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
