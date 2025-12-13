import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
// import Category from '@/lib/models/Category'; // Uncomment if needed for population

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
