import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import Payment from '../../../../models/Payment';
import mongoose from 'mongoose';

// DB Helper
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       await import('../../../../lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Auto-connect failed");
    }
};

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    await connectDB();
    
    // Check keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         return NextResponse.json({ success: false, error: "Razorpay keys not configured" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt = shortid.generate() } = body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency,
            receipt,
        };

        const order = await instance.orders.create(options);

        // Save order to DB as 'created'
        await Payment.create({
            orderId: order.id,
            amount: amount,
            currency: currency,
            status: 'created',
            receipt
        });

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
