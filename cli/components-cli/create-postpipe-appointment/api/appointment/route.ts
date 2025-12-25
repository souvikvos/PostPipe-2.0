import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/lib/models/Appointment';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const appointment = await Appointment.create(body);

    return NextResponse.json(
      { success: true, data: appointment },
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
        const appointments = await Appointment.find({}).sort({ date: 1 });
        return NextResponse.json({ success: true, data: appointments });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
