import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images slug'); // Populate product details for display

        return NextResponse.json({ success: true, count: orders.length, orders });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
