import { Router, Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';

const router = Router();

/**
 * POST /api/admin/discount-codes/generate
 * Generates a discount code if nth-order condition is met.
 * Returns 400 if condition is not satisfied.
 */
router.post('/discount-codes/generate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = adminService.generateDiscountCode();
    res.status(201).json({
      discountCode: code,
      message: `Discount code ${code.code} generated successfully`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/stats
 * Returns store statistics: items purchased, revenue, discount codes, total discounts.
 */
router.get('/stats', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = adminService.getStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/config
 * Returns current store discount config.
 */
router.get('/config', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ config: adminService.getConfig() });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/config
 * Updates store discount config.
 * Body: { nthOrder?: number, discountPercent?: number }
 */
router.patch('/config', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nthOrder, discountPercent } = req.body;
    adminService.updateConfig(nthOrder, discountPercent);
    res.json({ config: adminService.getConfig(), message: 'Config updated' });
  } catch (err) {
    next(err);
  }
});

export default router;
