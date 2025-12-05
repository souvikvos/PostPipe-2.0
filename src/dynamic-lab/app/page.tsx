'use client';

import { useState } from 'react';

export default function LabPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Idle');

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const testApiRoute = async () => {
        setStatus('Testing API Route...');
        addLog('Sending request to /api/test...');
        try {
            const res = await fetch('/api/test', { method: 'POST', body: JSON.stringify({ test: true }) });
            const data = await res.json();
            addLog(`Response: ${JSON.stringify(data)}`);
            setStatus('Success');
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
            setStatus('Error');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', height: '100vh' }}>
            <div style={{ padding: '2rem' }}>
                <h1>Postpipe 2.0 Dynamic Lab</h1>
                <p>Test your Next.js components and Server Actions here.</p>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2>Component Sandbox</h2>
                    <p><em>Load your components here...</em></p>

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

                    <h3>Test Controls</h3>
                    <button onClick={testApiRoute} style={{ padding: '0.5rem 1rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Test API Route
                    </button>
                </div>
            </div>

            <div style={{ background: '#111', color: '#0f0', padding: '1rem', fontFamily: 'monospace', overflowY: 'auto' }}>
                <h3>System Logs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
                <div style={{ marginTop: '1rem', color: status === 'Success' ? '#0f0' : status === 'Error' ? '#f00' : '#888' }}>
                    Status: {status}
                </div>
            </div>
        </div>
    );
}
