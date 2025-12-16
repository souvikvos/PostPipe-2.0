import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await dbConnect();
    // Simplified Signup
    try {
        const { name, email, password } = await request.json();
        // Check existing
        const existing = await User.findOne({ email });
        if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
