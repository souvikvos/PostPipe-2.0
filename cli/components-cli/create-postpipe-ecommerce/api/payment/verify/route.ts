import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Cart from '@/models/Cart';
import Shipment from '@/models/Shipment';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

        // 1. Verify Signature
        const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyData.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
             return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
        }

        // 2. Update Order to Paid
        const order = await Order.findOneAndUpdate(
            { 'paymentInfo.razorpayOrderId': razorpay_order_id },
            { 
                status: 'processing', // Move to processing
                'paymentInfo.razorpayPaymentId': razorpay_payment_id,
                'paymentInfo.status': 'paid'
            },
            { new: true }
        );

        if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

        // 3. Log Payment Transaction
        await Payment.create({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount: order.total,
            currency: 'INR',
            status: 'paid'
        });

        // 4. Auto-Create Shipment (Initial)
        await Shipment.create({
            orderId: order._id.toString(), // Explicitly cast ObjectId to string
            user: order.user,
            status: 'ordered',
            history: [{ status: 'ordered', description: 'Payment verified, order placed.' }]
        });

        // 5. Clear Cart (Since payment succeeded)
        await Cart.findOneAndUpdate({ user: userId }, { items: [] });

        return NextResponse.json({ success: true, message: "Payment Verified & Order Processed" });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
