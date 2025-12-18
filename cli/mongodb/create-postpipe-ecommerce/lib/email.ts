import { Resend } from 'resend';

// Initialize Resend only if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendWelcomeEmail(email: string, name: string) {
    if (!resend) {
        console.log(`[DEV MODE] Welcome Email to ${email} (Name: ${name})`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Welcome to PostPipe Ecommerce!',
            html: `<p>Hi ${name},</p><p>Welcome to our platform! We are excited to have you on board.</p>`,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    if (!resend) {
        console.log(`[DEV MODE] Verification Email to ${email}: ${link}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    if (!resend) {
        console.log(`[DEV MODE] Password Reset Email to ${email}: ${link}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

export async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
    if (!resend) {
        console.log(`[DEV MODE] Order Confirmation to ${email} for Order #${orderDetails.id}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'orders@resend.dev',
            to: email,
            subject: `Order Confirmation #${orderDetails.id}`,
            html: `
                <h1>Thank you for your order!</h1>
                <p>Order ID: ${orderDetails.id}</p>
                <p>Total: $${orderDetails.total}</p>
                <p>We will notify you when your items ship.</p>
            `,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

export async function sendShippingUpdateEmail(email: string, shipmentDetails: any) {
    if (!resend) {
        console.log(`[DEV MODE] Shipping Update to ${email} for Tracking #${shipmentDetails.trackingNumber}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'shipping@resend.dev',
            to: email,
            subject: `Your order has shipped!`,
            html: `
                <h1>Good news! Your order is on the way.</h1>
                <p>Tracking Number: ${shipmentDetails.trackingNumber}</p>
                <p>Carrier: ${shipmentDetails.carrier}</p>
                <p>Track here: <a href="${appUrl}/track?number=${shipmentDetails.trackingNumber}">Track Order</a></p>
            `,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}
