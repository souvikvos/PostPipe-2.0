import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  try {
    const product = await Product.findOne({ slug: params.slug });
    if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
