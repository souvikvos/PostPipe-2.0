import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ReturnRequest from '@/models/ReturnRequest';
import Order from '@/models/Order';

// Create Return Request
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { orderId, userId, items } = await request.json(); // items: [{ productId, quantity, reason }]

    // 1. Validate Order
    // @ts-ignore
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    if (order.status !== 'delivered') {
         return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 });
    }

    // 2. Calculate Refund Amount (Simple logic: pro-rated)
    // Complex logic would handle discounts pro-rating, but here we sum item prices.
    let refundAmount = 0;
    for (const returnItem of items) {
        // Find matching item in order to get snapshot price
        const originalItem = order.items.find((i: any) => i.product.toString() === returnItem.productId);
        if (originalItem) {
            refundAmount += originalItem.price * returnItem.quantity;
        }
    }

    // 3. Create Request
    const returnReq = await ReturnRequest.create({
        orderId,
        user: userId,
        items,
        status: 'pending',
        refundAmount
    });

    return NextResponse.json({ success: true, returnReq });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
