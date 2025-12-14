import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Wishlist from '@/lib/models/Wishlist';

const TEMP_USER_ID = "6578a9b1cde2f3a4b5c6d7e8"; 

export async function GET(req: Request) {
  try {
    await dbConnect();
    const wishlist = await Wishlist.findOne({ user: TEMP_USER_ID }).populate('products');
    return NextResponse.json({ success: true, data: wishlist ? wishlist.products : [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { productId } = await req.json();
    
    let wishlist = await Wishlist.findOne({ user: TEMP_USER_ID });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: TEMP_USER_ID, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    if (index === -1) {
      wishlist.products.push(productId); // Add
    } else {
      wishlist.products.splice(index, 1); // Remove (Toggle)
    }

    await wishlist.save();
    return NextResponse.json({ success: true, data: wishlist.products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
