# Create PostPipe Ecommerce

🚀 **The Ultimate Next.js E-commerce Backend Scaffolding Tool**

Scaffold a production-ready, fully integrated e-commerce backend in seconds. Built for **PostPipe 2.0**, this CLI generates a complete API layer, database models, and utility libraries for your Next.js application.

## Features

### 🔐 Authentication & Users

- **Secure Auth**: Login & Signup with bcrypt password hashing.
- **Email Verification**: Integrated flow with **Resend** to verify user emails.
- **User Profiles**: Manage addresses, profile images, and personal details.
- **Address Book**: Save multiple shipping addresses.

### 🛒 Shop & Products

- **Unified Models**: Mongoose models for Products, Categories, Orders, etc.
- **Advanced Product API**: Search, filter, and fetch related products.
- **Wishlist**: Users can save products for later.
- **Reviews & Ratings**: Authenticated users can review products.

### 💳 Cart, Checkout & Orders

- **Server-Side Cart**: Robust cart management synced with the database.
- **Checkout Flow**: Integrated order creation.
- **Payments**: Pre-configured for **Razorpay** integration.
- **Order Management**: Track status, shipments, and history.

### 📢 Notifications & Marketing

- **Transactional Emails**: Welcome, Verification, Order Confirmation, and Shipping Updates via **Resend**.
- **Admin APIs**: Ready-to-use endpoints for admin dashboards.

## Quick Start

```bash
npx create-postpipe-ecommerce
```

Follow the interactive prompts to set up your project.

## Project Structure

The CLI scaffolds the following structure (typically in your project root or `src`):

```
/app
  /api              # Next.js App Router API Routes
    /auth           # Login, Signup, Verify, Reset Password
    /shop           # Products, Cart, Wishlist, Reviews
    /account        # User Address, Profile
    /admin          # Admin Dashboard APIs
    /payment        # Payment Gateway Webhooks
/models             # Mongoose Schemas (User, Product, Order, etc.)
/lib                # Utilities (DB Connect, Email, Auth Helpers)
.env                # Environment variables template
INSTRUCTIONS_FOR_AI.md # Prompt for AI Agents to build your Frontend
```

## Environment Variables

After scaffolding, fill in the `.env` file:

```env
MONGODB_URI=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

ISC
