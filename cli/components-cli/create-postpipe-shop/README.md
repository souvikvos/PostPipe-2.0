# Create PostPipe Shop

![PostPipe Banner](https://img.shields.io/npm/v/create-postpipe-shop)

CLI to scaffold robust **Shop features** for Next.js applications, powerd by **PostPipe**.

## Features

Select which modules to install via the interactive CLI:

### 🛒 Shopping Cart

- **Model**: `Cart` (User-specific cart management).
- **API**: `/api/cart` (Add, remove, update quantity).

### ❤️ Wishlist

- **Model**: `Wishlist` (Save favorite products).
- **API**: `/api/wishlist` (Toggle favorites).

### 📦 Orders & Inventory

- **Model**: `Order` (Order history, statuses).
- **API**: `/api/orders` (Create order, list history, auto-reduce stock).

### ⚡ Server Actions

- **Location**: `src/lib/actions/shop.ts`
- **Functions**: `addToCart`, `removeFromCart`, `addToWishlist`, `removeFromWishlist`.
- **Signature**: `(prevState, formData)` - Ready for React `useActionState`.

## Usage

Run this command in your Next.js project root:

```bash
npx create-postpipe-shop
```

## Dependencies

This package assumes you have:

- `mongoose` (for database)

## License

CC-BY-NC-SA-4.0
