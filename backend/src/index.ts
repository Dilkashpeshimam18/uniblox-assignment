import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './routes/admin';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler (must be last)
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
