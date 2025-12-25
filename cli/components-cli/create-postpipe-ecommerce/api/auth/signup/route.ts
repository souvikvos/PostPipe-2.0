import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
    await dbConnect();
    // Simplified Signup
    try {
        const { name, email, password } = await request.json();
        // Check existing
        const existing = await User.findOne({ email });
        if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false
        });

        // Send Verification Email
        await sendVerificationEmail(user.email, verificationToken);

        return NextResponse.json({ success: true, message: 'Signup successful. Please verify your email.' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

