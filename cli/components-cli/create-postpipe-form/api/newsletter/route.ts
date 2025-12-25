import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Newsletter from '@/lib/models/Newsletter';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { success: false, error: 'Email is required' },
            { status: 400 }
        );
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
        return NextResponse.json(
            { success: false, error: 'Email already subscribed' },
            { status: 400 }
        );
    }

    const subscription = await Newsletter.create({ email });

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET() {
    try {
        await dbConnect();
        const subscribers = await Newsletter.find({}).sort({ subscribedAt: -1 });
        return NextResponse.json({ success: true, data: subscribers });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
