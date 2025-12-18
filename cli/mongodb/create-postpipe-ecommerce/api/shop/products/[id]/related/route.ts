import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const productId = params.id;

    if (!productId) {
        return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        // Logic: Find products in the same category, excluding current product, limit 5
        const related = await Product.find({
            category: product.category,
            _id: { $ne: productId }
        }).limit(5);

        return NextResponse.json({ success: true, products: related });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
