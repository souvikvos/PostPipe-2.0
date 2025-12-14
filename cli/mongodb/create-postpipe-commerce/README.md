# Create PostPipe Commerce

![PostPipe Banner](https://img.shields.io/npm/v/create-postpipe-commerce)

CLI to scaffold robust **E-commerce features** for Next.js applications, powered by **PostPipe**.

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

### 💳 Checkout (Stripe)

- **API**: `/api/checkout` (Create Stripe Session).
- **Webhook**: `/api/webhooks/stripe` (Handle payment success).

## Usage

Run this command in your Next.js project root:

```bash
npx create-postpipe-commerce
```

## Dependencies

This package assumes you have:

- `mongoose` (for database)
- `stripe` (if using Checkout)

## License

CC-BY-NC-SA-4.0
