import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { APIFeatures } from '@/lib/utils/apiFeatures'; // Assuming we copy this util too

// Get Products (Search, Filter, Sort)
export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const queryString: any = {};
    searchParams.forEach((value, key) => { queryString[key] = value });

    try {
        const features = new APIFeatures(Product.find(), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();
            
        const products = await features.query;
        return NextResponse.json({ success: true, results: products.length, products });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Create Product (Admin Only - simplified)
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
