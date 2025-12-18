import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    try {
        const reviews = await Review.find({ product: productId }).populate('user', 'name image');
        return NextResponse.json({ success: true, reviews });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId, productId, rating, comment } = await request.json();

        // Basic validation
        if (!userId || !productId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment
        });
        
        // Optional: Update average rating on Product model (not implemented here but good to have)
        
        return NextResponse.json({ success: true, review });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
