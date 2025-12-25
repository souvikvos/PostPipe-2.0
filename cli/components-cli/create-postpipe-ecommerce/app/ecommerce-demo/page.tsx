'use client';

import { useState } from 'react';
import Script from 'next/script';

// This demo assumes you have a user and some products seeded.
// For the sake of the demo, we will simulate the flow.

export default function EcommerceMasterDemo() {
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<any[]>([]);
    const [order, setOrder] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    // Simulated Data
    const mockUser = "user_123_demo";
    const mockProduct = { _id: "prod_abc", name: "Premium Headphones", price: 2500, stock: 10 };

    // 1. Add to Cart
    const addToCart = async () => {
        addLog(`Adding ${mockProduct.name} to cart...`);
        // Iterate flow: In real app, we call /api/shop/cart
        // Here we simulate success response
        setCart([{ ...mockProduct, quantity: 1 }]);
        addLog("Item added to Cart. Stock checked.");
        setStep(2);
    };

    // 2. Checkout
    const checkout = async () => {
        addLog("Initiating Checkout...");

        // Call API
        try {
            // Since we don't have real DB in this static file context, we assume API works.
            // But we actually created the API routes in the CLI!
            // In a real usage of the CLI, the user would run this page with the backed.

            // For the demo Visuals:
            const total = 2500;

            // Call Razorpay Order Create
            const res = await fetch('/api/shop/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    userId: mockUser, // In real app use session
                    address: { city: 'Mumbai' },
                    couponCode: 'WELCOME50' // Try applying coupon
                })
            });
            // Note: This fetch will Fail here because we are in the 'brain' creating the file, 
            // but when the USER runs the scaffolded project, it will hit the actual API.

            addLog("Order Created: ORD_998877");
            addLog("Payment Gateway Initialized (Razorpay)");
            setStep(3);
        } catch (e) {
            addLog("Error in checkout (Expected if API not running)");
        }
    };

    // 3. Fake Payment
    const pay = async () => {
        addLog("User paid on Razorpay...");
        addLog("Verifying Signature...");
        addLog("Payment Verified! Order Status: Processing");
        addLog("Inventory Decremented.");
        setOrder({ id: 'ORD_998877', status: 'processing', tracking: 'TRK_XX' });
        setStep(4);
    };

    // 4. Return
    const requestReturn = async () => {
        addLog("Requesting Return for Order ORD_998877...");
        addLog("Return Request Created. Status: Pending Approval");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2">PostPipe Ecommerce Master Demo</h1>
                <p className="text-gray-600">Full Lifecycle: Cart -> Checkout -> Payment -> Delivery -> Return</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                {/* Main Flow */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Step 1: Browse */}
                    <div className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${step >= 1 ? 'border-blue-500' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-bold mb-4">1. Product Page</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">🎧</div>
                            <div>
                                <h3 className="font-bold text-lg">{mockProduct.name}</h3>
                                <p className="text-green-600 font-mono">₹{mockProduct.price}</p>
                                <p className="text-sm text-gray-500">Stock: {mockProduct.stock} (In Stock)</p>
                            </div>
                            <button
                                onClick={addToCart} disabled={step > 1}
                                className="ml-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {step > 1 ? 'Added' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Cart & Checkout */}
                    {step >= 2 && (
                        <div className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${step >= 2 ? 'border-blue-500' : 'border-gray-200'}`}>
                            <h2 className="text-xl font-bold mb-4">2. Cart Review</h2>
                            {cart.map((item, i) => (
                                <div key={i} className="flex justify-between border-b pb-2 mb-4">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <button
                                onClick={checkout} disabled={step > 2}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step >= 3 && (
                        <div className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${step >= 3 ? 'border-green-500' : 'border-gray-200'}`}>
                            <h2 className="text-xl font-bold mb-4">3. Payment Gateway</h2>
                            <div className="bg-gray-100 p-4 rounded-lg text-center mb-4">
                                <p className="text-sm text-gray-500 mb-2">Razorpay Modal would open here</p>
                                <p className="font-bold text-2xl">₹2500</p>
                            </div>
                            <button
                                onClick={pay} disabled={step > 3}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                            >
                                Simulate Success Payment
                            </button>
                        </div>
                    )}

                    {/* Step 4: Tracking & Returns */}
                    {step >= 4 && (
                        <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-purple-500">
                            <h2 className="text-xl font-bold mb-4">4. Order Status</h2>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="font-bold">Order #{order?.id}</p>
                                    <p className="text-sm text-green-600">Status: {order?.status}</p>
                                </div>
                                <button
                                    onClick={requestReturn}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    Request Return
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Logs Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 text-green-400 p-6 rounded-xl shadow-lg h-full font-mono text-sm overflow-y-auto max-h-[600px]">
                        <h3 className="text-white font-bold border-b border-gray-700 pb-2 mb-4">System Logs</h3>
                        <div className="space-y-2">
                            {logs.map((log, i) => (
                                <div key={i}>{'>'} {log}</div>
                            ))}
                            {logs.length === 0 && <span className="text-gray-600">Ready...</span>}
                        </div>
                    </div>
                </div>

            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </div>
    );
}
