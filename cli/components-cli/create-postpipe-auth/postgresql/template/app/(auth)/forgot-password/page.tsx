'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { forgotPassword, AuthState } from '@/lib/auth/actions/auth';

const initialState: AuthState = {
    message: '',
    success: false,
};

export default function ForgotPasswordPage() {
    const [state, action] = useFormState(forgotPassword, initialState);

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Forgot Password</h2>
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send Reset Link
                </button>
            </form>
            {state?.message && (
                <p style={{ color: state.success ? 'green' : 'red', marginTop: '10px', textAlign: 'center' }}>
                    {state.message}
                </p>
            )}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link href="/login" style={{ color: '#0070f3' }}>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
