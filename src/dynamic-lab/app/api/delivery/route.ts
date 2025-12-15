import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Shipment from '../../../models/Shipment';
import crypto from 'crypto';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       await import('../../../lib/dbConnect').then(m => m.default());
    } catch (e) {
       console.warn("Auto-connect failed");
    }
};

// Create Shipment
export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const { orderId, provider = 'Generic' } = body;

    const trackingNumber = 'TRK-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const shipment = await Shipment.create({
        orderId,
        provider,
        trackingNumber,
        status: 'ordered',
        history: [{
            status: 'ordered',
            description: 'Order processed and ready for shipping',
            timestamp: new Date()
        }]
    });

    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get/Update Shipment
export async function PATCH(request: Request) {
    await connectDB();
    try {
        const { id, status, location, description } = await request.json();
        
        const shipment = await Shipment.findById(id);
        if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

        shipment.status = status;
        shipment.history.push({
            status,
            location,
            description,
            timestamp: new Date()
        });
        
        await shipment.save();
        return NextResponse.json({ success: true, shipment });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const id = searchParams.get('id');

    try {
        let shipment;
        if (id) {
            shipment = await Shipment.findById(id);
        } else if (orderId) {
             shipment = await Shipment.findOne({ orderId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ success: true, shipment });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
