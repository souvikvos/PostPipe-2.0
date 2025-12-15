import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notification from '../../../models/Notification'; 

// DB Connection helper 
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        // We use the lib/dbConnect which should exist in dynamic-lab
        // Using relative path to be safe in this sub-project
       await import('../../../lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Could not auto-connect to DB @ ../../../lib/dbConnect");
    }
};

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); 

  if (!userId) {
    return NextResponse.json({ error: 'UserId required' }, { status: 400 });
  }

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  await connectDB();
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const notification = await Notification.create(body);
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
