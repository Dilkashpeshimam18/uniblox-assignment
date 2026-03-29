import { Router, Request, Response } from 'express';
import { store } from '../store/inMemoryStore';

const router = Router();

/** GET /api/products - list all products */
router.get('/', (_req: Request, res: Response) => {
  const products = Array.from(store.products.values());
  res.json({ products });
});

/** GET /api/products/:id - get single product */
router.get('/:id', (req: Request, res: Response) => {
  const product = store.products.get(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

export default router;
