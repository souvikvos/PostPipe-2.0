# PostPipe E-commerce Implementation Guide

Use this guide to build a robust E-commerce system with Next.js App Router, MongoDB, and PostPipe Auth.

## Phase 1: Authentication & Setup

**Step 1.1**: Run the following command to scaffold the core authentication system (User model, Login, Signup).

```bash
npx create-postpipe-auth@latest
# Follow the prompts to set up MongoDB and Auth
```

**Step 1.2**: Install additional dependencies for E-commerce.

```bash
npm install razorpay
```

**Step 1.3**: Add Environment Variables to `.env`.

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## Phase 2: E-commerce Backend Implementation

Update the project with the following E-commerce specific models and logic.

### 2.1 Update User Model (`lib/models/User.ts`)

_Replace the default User model with this extended version to support Addresses and Wishlists._

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "admin";
  provider?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }[];
  wishlist?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, default: "credentials" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    address: [
      {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
```

### 2.2 Product Model (`lib/models/Product.ts`)

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  sku?: string;
  category: string;
  tags?: string[];
  attributes?: Record<string, string>;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    sku: { type: String },
    category: { type: String, index: true },
    tags: [{ type: String }],
    attributes: { type: Map, of: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
```

### 2.3 Cart Model (`lib/models/Cart.ts`)

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: { product: mongoose.Types.ObjectId; quantity: number }[];
}

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
export default Cart;
```

### 2.4 Order Model (`lib/models/Order.ts`)

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  subtotal: number;
  discount: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentMethod: "razorpay" | "cod";
  paymentInfo?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: string;
  };
  shippingAddress: { street: string; city: string; state: string; zip: string };
  couponApplied?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "cod" },
    paymentInfo: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      status: String,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    couponApplied: String,
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
```

### 2.5 API Utilities (`lib/utils/apiFeatures.ts`)

```typescript
export class APIFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);
    if (this.queryString.search) {
      parsedQuery.$or = [
        { name: { $regex: this.queryString.search, $options: "i" } },
        { description: { $regex: this.queryString.search, $options: "i" } },
      ];
      delete parsedQuery.search;
    }
    this.query = this.query.find(parsedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
```

### 2.6 Products API (`app/api/shop/products/route.ts`)

```typescript
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import { APIFeatures } from "@/lib/utils/apiFeatures";

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const queryString: any = {};
  searchParams.forEach((value, key) => {
    queryString[key] = value;
  });

  try {
    const features = new APIFeatures(Product.find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query;
    return NextResponse.json({
      success: true,
      results: products.length,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 2.7 Cart API (`app/api/shop/cart/route.ts`)

```typescript
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import Cart from "@/lib/models/Cart";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userId, productId, quantity } = await request.json();
    const product = await Product.findById(productId);
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stock < quantity)
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  return NextResponse.json({ success: true, cart: cart || { items: [] } });
}
```

### 2.8 Checkout API (`app/api/shop/checkout/route.ts`)

```typescript
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Cart from "@/lib/models/Cart";
import Razorpay from "razorpay";
// Import Coupon if you have the model

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userId, address, items } = await request.json();
    let itemsToProcess = items || [];

    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0)
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      itemsToProcess = cart.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
    }

    let subtotal = 0;
    const finalOrderItems = [];

    for (const item of itemsToProcess) {
      const productId = item.product._id || item.product;
      const product = await Product.findById(productId);
      if (!product || product.stock < item.quantity)
        return NextResponse.json(
          { error: `Stock Issue w/ ${productId}` },
          { status: 400 }
        );

      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;
      finalOrderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
      });
    }

    const total = subtotal; // Apply discount logic here if needed
    const rzpOrder = await instance.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const newOrder = await Order.create({
      user: userId,
      items: finalOrderItems,
      subtotal,
      total,
      paymentMethod: "razorpay",
      paymentInfo: { razorpayOrderId: rzpOrder.id, status: "pending" },
      shippingAddress: address,
      status: "pending",
    });

    for (const item of finalOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      razorpayOrder: rzpOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Connect Frontend

**Step 3.1**: Integrate Auth with Navigation

- Update your `Navbar` or `Header` component to show `Login` / `Signup` links if the user is not authenticated.
- If authenticated, show the User's name and a link to the `Cart` or `Dashboard`.

**Step 3.2**: Create the Store Page

- Use the APIs (`/api/shop/products`, `/api/shop/cart`) to build a Product Listing Page.
- Fetch `getSession()` from `lib/auth/actions` to determine if a user is logged in before allowing "Add to Cart".

**Demo Store Page (`app/shop/page.tsx`)**
_Use this as a starting template for your main store page._

```tsx
"use client";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function ShopPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  const addToCart = async (productId) => {
    // Replace with actual user ID from session context
    const userId = "REPLACE_WITH_SESSION_USER_ID";
    await fetch("/api/shop/cart", {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity: 1 }),
    });
    alert("Added to Cart!");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <div key={p._id} className="border p-4 rounded-lg">
            <h2 className="font-bold">{p.name}</h2>
            <p className="text-gray-600">₹{p.price}</p>
            <button
              onClick={() => addToCart(p._id)}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
```
