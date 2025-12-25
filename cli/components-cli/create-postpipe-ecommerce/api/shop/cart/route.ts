import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import User from '@/models/User';

// Add to Cart
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userId, productId, quantity } = await request.json();

    // 1. Check Stock
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // 2. Find or Create Cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    // 3. Update Items
    const existingItemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new
        cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    return NextResponse.json({ success: true, cart });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get Cart
export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return NextResponse.json({ success: true, cart: cart || { items: [] } });
}
