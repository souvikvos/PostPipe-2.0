'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsDemo() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastEvent, setLastEvent] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const trackEvent = async (eventName: string, metadata?: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify({
                    eventName,
                    url: window.location.pathname,
                    metadata: metadata || { demo: true },
                    sessionId: 'session_' + Math.floor(Math.random() * 1000)
                })
            });
            const data = await res.json();
            if (data.success) {
                setLastEvent(`Tracked: ${eventName}`);
                fetchStats(); // Refresh dashboard
            }
        } catch (e) {
            setLastEvent('Error tracking event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Analytics Dashboard Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Event Trigger Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Trigger Events</h2>
                    <p className="text-gray-600 mb-6">Click buttons to simulate user interactions.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => trackEvent('page_view')}
                            disabled={loading}
                            className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            👁️ Page View
                        </button>
                        <button
                            onClick={() => trackEvent('button_click', { buttonId: 'signup' })}
                            disabled={loading}
                            className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                        >
                            🖱️ Button Click
                        </button>
                        <button
                            onClick={() => trackEvent('add_to_cart', { productId: 'p123', price: 99 })}
                            disabled={loading}
                            className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                        >
                            🛒 Add to Cart
                        </button>
                        <button
                            onClick={() => trackEvent('error_occurred', { code: 500 })}
                            disabled={loading}
                            className="p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                            ⚠️ Simulate Error
                        </button>
                    </div>

                    {lastEvent && (
                        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 text-center animate-pulse">
                            {lastEvent}
                        </div>
                    )}
                </div>

                {/* Stats Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Live Stats</h2>
                        <button onClick={fetchStats} className="text-sm text-blue-600 hover:underline">
                            Refresh
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats.length === 0 && <p className="text-gray-400 text-center">No events recorded yet.</p>}

                        {stats.map((stat) => (
                            <div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="font-bold text-gray-800">{stat._id}</span>
                                    <div className="text-xs text-gray-500">
                                        Last: {new Date(stat.lastOccurred).toLocaleTimeString()}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {stat.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center text-gray-400 text-sm">
                Analytics data is stored in the <code>Analytics</code> collection in MongoDB.
            </div>
        </div>
    );
}
