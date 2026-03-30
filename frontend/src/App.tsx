import { CartProvider } from './context/CartContext';
import ShopPage from './pages/ShopPage';

export default function App() {
  return (
    <CartProvider>
      <ShopPage />
    </CartProvider>
  );
}
