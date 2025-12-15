import { NextResponse } from 'next/server';
// @ts-ignore
import crypto from 'crypto';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       // @ts-ignore
       await import('@/lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Auto-connect failed");
    }
};

export async function POST(request: Request) {
    await connectDB();
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        // Verify Signature
        const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyData.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update DB
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { 
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: 'paid'
                }
            );

            return NextResponse.json({ success: true, message: "Payment Verified" });
        } else {
             await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed' }
            );
            return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
