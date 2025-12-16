import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { email, password } = await request.json();

        // 1. Check User
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Generate Token
        const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign(
            { id: user._id, role: user.role },
            secret,
            { expiresIn: '7d' }
        );

        return NextResponse.json({ 
            success: true, 
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
