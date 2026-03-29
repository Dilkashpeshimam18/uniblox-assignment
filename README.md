# UniBlox E-Commerce Store

A full-stack e-commerce application with a discount reward system.

## Stack
- **Backend:** Node.js + TypeScript + Express
- **Frontend:** React + TypeScript + Vite
- **Storage:** In-memory (no database required)
- **Tests:** Jest + ts-jest

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev       # starts on http://localhost:3001
npm test          # run unit tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```

## API Reference

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |

### Cart
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cart` | Create/get cart `{ userId, cartId? }` |
| GET | `/api/cart/:cartId` | Get cart with subtotal |
| POST | `/api/cart/:cartId/items` | Add item `{ productId, quantity }` |
| PATCH | `/api/cart/:cartId/items/:productId` | Update quantity `{ quantity }` |
| DELETE | `/api/cart/:cartId/items/:productId` | Remove item |

### Checkout
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout` | Checkout `{ userId, cartId, discountCode? }` |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/discount-codes/generate` | Generate discount code (if eligible) |
| GET | `/api/admin/stats` | Get store statistics |
| GET | `/api/admin/config` | Get discount config |
| PATCH | `/api/admin/config` | Update config `{ nthOrder, discountPercent }` |

## Discount System
1. Every **nth order** (default: 5) makes the store eligible for a new discount code.
2. The admin generates the code via `POST /api/admin/discount-codes/generate`.
3. Customers apply the code at checkout — codes are **single-use**.
4. Default discount: **10% off**.

## Running Tests
```bash
cd backend && npm test
```
Test coverage includes:
- CartService: add/remove/update items, stock validation, subtotal calculation
- CheckoutService: order creation, discount code application/validation, nth-order signaling
- AdminService: code generation conditions, stats aggregation, config validation
