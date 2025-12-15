'use client';

import { useState, useEffect } from 'react';
import { sendEmailNotification, createDbNotification } from '../../lib/actions/notify';

export default function NotifyDemo() {
    const [userId, setUserId] = useState('user_123');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form States
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');

    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleCreateDb = async () => {
        setLoading(true);
        // Using Server Action for DB creation demo (can also use API)
        const res = await createDbNotification({
            userId,
            type: type as any,
            message
        });

        if (res.success) {
            setMessage('');
            fetchNotifications();
        }
        setLoading(false);
    };

    const handleSendEmail = async () => {
        setLoading(true);
        const res = await sendEmailNotification({
            to: emailTo,
            subject: emailSubject,
            html: `<p>${emailBody}</p>`
        });

        if (res.success) {
            alert('Email Simulated/Sent! Check console or Resend dashboard.');
            setEmailTo('');
            setEmailSubject('');
            setEmailBody('');
        } else {
            alert('Failed to send email');
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            body: JSON.stringify({ id })
        });
        fetchNotifications(); // Refresh to update count/UI
    };

    return (
        <div className="max-w-4xl mx-auto p-8 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="space-y-8">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🔔 Trigger Notification
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                            <input
                                type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={type} onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="info">Info ℹ️</option>
                                <option value="success">Success ✅</option>
                                <option value="warning">Warning ⚠️</option>
                                <option value="error">Error ❌</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <input
                                type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                                placeholder="Backup completed..."
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <button
                            onClick={handleCreateDb} disabled={loading || !message}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send DB Notification
                        </button>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        📧 Send Email (Resend)
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="email" placeholder="To: user@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="text" placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        <textarea
                            placeholder="Email Body (HTML supported)" value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg h-24"
                        />
                        <button
                            onClick={handleSendEmail} disabled={loading || !emailTo}
                            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            Send Email
                        </button>
                    </div>
                </section>
            </div>

            {/* Notification Center Preview */}
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Your Notifications</h2>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} Unread
                    </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {notifications.length === 0 && (
                        <p className="text-gray-400 text-center py-8">No notifications yet</p>
                    )}
                    {notifications.map((note) => (
                        <div
                            key={note._id}
                            className={`p-4 rounded-xl border transition-all ${note.isRead ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-blue-100 shadow-sm border-l-4 border-l-blue-500'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <span className="text-xl">
                                        {note.type === 'info' && 'ℹ️'}
                                        {note.type === 'success' && '✅'}
                                        {note.type === 'warning' && '⚠️'}
                                        {note.type === 'error' && '❌'}
                                    </span>
                                    <div>
                                        <p className={`text-sm ${note.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                            {note.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {!note.isRead && (
                                    <button
                                        onClick={() => markAsRead(note._id)}
                                        className="text-xs text-blue-600 hover:underline shrink-0"
                                    >
                                        Mark Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
