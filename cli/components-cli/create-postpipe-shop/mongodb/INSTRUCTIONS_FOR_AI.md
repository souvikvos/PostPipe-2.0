# PostPipe Shop/Store Guide (MongoDB)

Use this guide to add e-commerce capabilities (Product Catalog, Cart, Orders) to an existing app.

## Phase 1: Scaffolding

**Step 1.1**: Run the Shop CLI.

```bash
npx create-postpipe-shop@latest
# Follow prompts:
# 1. Choose Database: MongoDB
# 2. Add features: Products, Cart, Orders
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose
```

---

## Phase 2: Verify Backend

- **Models**: `Product`, `Cart`, `Order` in `lib/models`.
- **APIs**: `app/api/shop/*`.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Product Grid.

Fetch from `/api/shop/products`.

```tsx
// Fetch and map products
```

**Step 3.2**: Add to Cart.

POST to `/api/shop/cart` with `{ productId, quantity }`.

**Step 3.3**: Checkout.

Create an `app/checkout/page.tsx`.
Call `/api/shop/checkout` or integrate Payment Gateway (use `create-postpipe-payment` for logic).
