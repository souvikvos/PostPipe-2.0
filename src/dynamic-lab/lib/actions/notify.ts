'use server';

import { Resend } from 'resend';
import Notification from '../../models/Notification';
import mongoose from 'mongoose';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
       await import('../../lib/dbConnect').then(m => m.default());
    } catch (e) {
       // console.warn("DB Connect Issue");
    }
};

interface CreateNotificationParams {
    userId: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

export async function createDbNotification({ userId, type = 'info', message }: CreateNotificationParams) {
    await connectDB();
    try {
        const note = await Notification.create({ userId, type, message });
        // Mongoose document to plain object
        return { success: true, data: JSON.parse(JSON.stringify(note)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmailNotification({ to, subject, html, from = 'PostPipe <onboarding@resend.dev>' }: SendEmailParams) {
    // If no API key, mocking it for demo
    if (!process.env.RESEND_API_KEY) {
        console.log("Mock Email Sent:", { to, subject });
        return { success: true, data: { id: 'mock-email-id' } };
    }

    try {
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html
        });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
