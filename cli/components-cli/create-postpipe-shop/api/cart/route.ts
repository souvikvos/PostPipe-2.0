import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/lib/models/Cart';
// import { auth } from '@/auth'; // Assuming auth is set up

const TEMP_USER_ID = "6578a9b1cde2f3a4b5c6d7e8"; // TODO: Replace with real auth

export async function GET(req: Request) {
  try {
    await dbConnect();
    // const session = await auth();
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const cart = await Cart.findOne({ user: TEMP_USER_ID }).populate('items.product');
    return NextResponse.json({ success: true, data: cart ? cart.items : [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { productId, quantity } = await req.json();
    
    let cart = await Cart.findOne({ user: TEMP_USER_ID });
    
    if (!cart) {
      cart = await Cart.create({ user: TEMP_USER_ID, items: [] });
    }

    const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      if (quantity === 0) {
          cart.items.splice(itemIndex, 1); // Remove if 0
      } else {
          cart.items[itemIndex].quantity = quantity; // Update
      }
    } else if (quantity > 0) {
      cart.items.push({ product: productId, quantity }); // Add
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart.items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
