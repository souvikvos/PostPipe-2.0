'use client';

import { useState } from 'react';

export default function AdminDemo() {
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const accessAdminPanel = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin-demo', {
                headers: {
                    'x-mock-role': role // Simulating cookie/session role
                }
            });
            const data = await res.json();

            if (data.success) {
                setMessage(data.message);
            } else {
                setMessage(data.error);
            }
        } catch (e) {
            setMessage('Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Admin Role Verification</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600 mb-6">
                    Toggle your simulated role below and try to access the protected API.
                </p>

                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => {
                                setRole('user');
                                // clear password if going back to user
                            }}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            I am a USER
                        </button>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder="Admin Password"
                                    className="px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    onChange={(e) => {
                                        if (e.target.value === '457ghv4uyG_vBax2KEq8Q94zkSXwvY7vP4M') {
                                            setRole('admin');
                                        } else {
                                            if (role === 'admin') setRole('user');
                                        }
                                    }}
                                />
                                <span className={`px-6 py-2 rounded-full font-medium transition-colors border ${role === 'admin' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                    ADMIN
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                {role === 'admin' ? '✅ Password Accepted' : '🔒 Enter password to enable Admin'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 text-center">
                    <button
                        onClick={accessAdminPanel}
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Access Protected Data'}
                    </button>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg font-mono text-sm ${message.includes('Access Denied') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
