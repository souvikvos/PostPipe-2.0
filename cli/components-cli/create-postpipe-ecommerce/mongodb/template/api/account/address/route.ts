import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Assuming passed or derived from auth context

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const user = await User.findById(userId).select('address');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        return NextResponse.json({ success: true, addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId, address } = await request.json();

        if (!userId || !address) {
            return NextResponse.json({ error: 'Missing userId or address data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        user.address.push(address);
        await user.save();

        return NextResponse.json({ success: true, addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { userId, addressId } = await request.json();

        if (!userId || !addressId) {
            return NextResponse.json({ error: 'Missing userId or addressId' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        user.address = user.address.filter((addr: any) => addr._id.toString() !== addressId);
        await user.save();

        return NextResponse.json({ success: true, addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
