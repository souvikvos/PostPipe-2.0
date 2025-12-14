import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Cart from '@/lib/models/Cart';

const TEMP_USER_ID = "6578a9b1cde2f3a4b5c6d7e8"; 

export async function GET(req: Request) {
  try {
    await dbConnect();
    const orders = await Order.find({ user: TEMP_USER_ID }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Manual Order Creation (e.g., if skipping Stripe or using COD)
export async function POST(req: Request) {
  try {
    await dbConnect();
    // In a real flow, this might be triggered by a webhook or a secure server-action
    // checking payment status first.
    
    // 1. Get User's Cart
    const cart = await Cart.findOne({ user: TEMP_USER_ID }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // 2. Calculate Total & Prepare Items
    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
        // Inventory Check
        if (item.product.stock < item.quantity) {
             return NextResponse.json({ success: false, error: `Not enough stock for ${item.product.name}` }, { status: 400 });
        }
        
        total += item.product.price * item.quantity;
        orderItems.push({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
        });

        // Reduce Stock
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // 3. Create Order
    const order = await Order.create({
        user: TEMP_USER_ID,
        items: orderItems,
        amount: total,
        status: 'pending', // or 'paid' if assuming instant
    });

    // 4. Clear Cart
    cart.items = [];
    await cart.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
