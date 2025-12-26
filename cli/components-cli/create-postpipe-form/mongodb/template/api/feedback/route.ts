import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/lib/models/Feedback';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const feedback = await Feedback.create(body);

    return NextResponse.json(
      { success: true, data: feedback },
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
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: feedbacks });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
