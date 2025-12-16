import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notification from '@/models/Notification'; 
// Ensure your dbConnect is ready. If not, you might need to import it. 
// We assume appropriate DB connection logic is global or imported in layout/instrumentation
// For this scaffolding, we'll try to dynamically import or just warn.
// Ideally, the user has a dbConnect utility. Let's assume standard @/lib/dbConnect

// Mock connection helper if not present, but user should have it.
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       // @ts-ignore
       await import('@/lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Could not auto-connect to DB. Ensure you have a global connection or @/lib/dbConnect");
    }
};

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // In prod, get this from session

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

// For Demo/Testing purposes: Create a notification
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
