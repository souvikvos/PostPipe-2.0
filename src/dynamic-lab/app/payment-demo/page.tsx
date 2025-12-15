'use client';

import { useState } from 'react';
import Script from 'next/script';

export default function PaymentDemo() {
    const [amount, setAmount] = useState(500); // Default 500 INR
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

    const handlePayment = async () => {
        setLoading(true);
        setStatus('idle');

        try {
            // 1. Create Order
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();

            if (!data.success) {
                console.error("Order Creation Failed", data.error);
                alert("Order Creation Failed");
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "PostPipe Store",
                description: "Test Transaction",
                order_id: data.order.id,
                handler: async function (response: any) {
                    console.log("Payment Success", response);

                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        setStatus('success');
                    } else {
                        setStatus('failed');
                    }
                },
                prefill: {
                    name: "Sourodip Roy",
                    email: "sourodip@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.error(response.error);
                setStatus('failed');
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            setStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center">

            {/* Razorpay SDK */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <h1 className="text-3xl font-bold mb-8">Razorpay Integration Demo</h1>

            <div className="bg-white p-8 rounded-xl shadow-lg border w-full text-center">
                <div className="mb-8">
                    <p className="text-gray-600 mb-2">Total Amount</p>
                    <p className="text-5xl font-bold text-gray-900">₹{amount}</p>
                </div>

                <div className="flex gap-4 justify-center mb-8">
                    <button onClick={() => setAmount(100)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">₹100</button>
                    <button onClick={() => setAmount(500)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">₹500</button>
                    <button onClick={() => setAmount(9999)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">₹9999</button>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Pay Now'}
                    {!loading && <span>💳</span>}
                </button>

                {status === 'success' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium animate-bounce">
                        ✅ Payment Successful! Verified by Server.
                    </div>
                )}

                {status === 'failed' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                        ❌ Payment Failed or Verification Error.
                    </div>
                )}

                <p className="mt-8 text-xs text-gray-400">
                    Ensure <code>RAZORPAY_KEY_ID</code> is set in both <code>.env</code> and exposed to public if needed for Testing.
                </p>
            </div>
        </div>
    );
}
