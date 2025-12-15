'use client';

import { useState } from 'react';

export default function DeliveryDemo() {
    const [orderId, setOrderId] = useState('ORD-' + Math.floor(Math.random() * 10000));
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const createShipment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/delivery', {
                method: 'POST',
                body: JSON.stringify({ orderId, provider: 'ShipRocket' })
            });
            const data = await res.json();
            if (data.success) {
                setShipment(data.shipment);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!shipment) return;
        setLoading(true);
        try {
            const res = await fetch('/api/delivery', {
                method: 'PATCH',
                body: JSON.stringify({
                    id: shipment._id,
                    status: newStatus,
                    location: 'Hub ' + Math.floor(Math.random() * 10),
                    description: `Package status updated to ${newStatus}`
                })
            });
            const data = await res.json();
            if (data.success) {
                setShipment(data.shipment);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Delivery Tracking Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">1. Create Shipment</h2>
                        <div className="flex gap-4">
                            <input
                                type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg"
                                placeholder="Order ID"
                            />
                            <button
                                onClick={createShipment} disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Ship It 📦
                            </button>
                        </div>
                    </section>

                    {shipment && (
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold mb-4">2. Update Status (Simulated)</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => updateStatus('shipped')}
                                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                                >
                                    🚚 Shipped
                                </button>
                                <button
                                    onClick={() => updateStatus('out_for_delivery')}
                                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                                >
                                    🛵 Out for Delivery
                                </button>
                                <button
                                    onClick={() => updateStatus('delivered')}
                                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                                >
                                    ✅ Delivered
                                </button>
                                <button
                                    onClick={() => updateStatus('returned')}
                                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                                >
                                    ↩️ Returned
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Tracking View */}
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Tracking Details</h2>

                    {!shipment ? (
                        <p className="text-center text-gray-400 py-12">No shipment selected</p>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start border-b pb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Tracking Number</p>
                                    <p className="text-lg font-mono font-bold text-blue-600">{shipment.trackingNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Current Status</p>
                                    <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full mt-1 uppercase">
                                        {shipment.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-0">
                                {shipment.history.slice().reverse().map((event: any, i: number) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {/* Timeline Line */}
                                        {i !== shipment.history.length - 1 && (
                                            <div className="absolute left-[9px] top-6 bottom-[-24px] w-0.5 bg-gray-200" />
                                        )}

                                        <div className="w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-sm shrink-0 z-10" />

                                        <div className="pb-6">
                                            <p className="font-bold text-gray-900 capitalize">
                                                {event.status.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                            <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                                {event.location && <span>• {event.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
