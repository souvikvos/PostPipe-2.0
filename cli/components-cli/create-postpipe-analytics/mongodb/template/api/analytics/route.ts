import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Analytics from '@/models/Analytics';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       // @ts-ignore
       await import('@/lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Auto-connect failed");
    }
};

export async function GET(request: Request) {
  await connectDB();
  try {
    // Simple aggregation: Count events by name
    const stats = await Analytics.aggregate([
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 },
          lastOccurred: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const { eventName, url, metadata, sessionId } = body;

    const event = await Analytics.create({
        eventName,
        url: url || null,
        metadata,
        sessionId
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
