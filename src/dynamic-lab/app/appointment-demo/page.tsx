'use client';

import { useFormState } from 'react-dom';
import { createAppointment } from '../../../../templates/appointment/mongodb/actions'; // Adjust import path for local demo
// Note: In a real app scaffolded by the CLI, this would be import { createAppointment } from '@/lib/actions/appointment';

const initialState = {
    message: '',
    success: false,
};

export default function AppointmentDemoPage() {
    const [state, formAction] = useFormState(createAppointment, initialState);

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Book an Appointment</h1>

            <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="name" style={{ fontWeight: 500 }}>Name</label>
                        <input
                            id="name"
                            name="name"
                            placeholder="Your Name"
                            required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="email" style={{ fontWeight: 500 }}>Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="date" style={{ fontWeight: 500 }}>Date</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                required
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="time" style={{ fontWeight: 500 }}>Time</label>
                            <input
                                id="time"
                                name="time"
                                type="time"
                                required
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="reason" style={{ fontWeight: 500 }}>Reason for Visit</label>
                        <textarea
                            id="reason"
                            name="reason"
                            placeholder="Briefly describe your reason..."
                            required
                            rows={4}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '10px',
                            padding: '12px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        Book Appointment
                    </button>
                </form>

                {state?.message && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        borderRadius: '6px',
                        background: state.success ? '#dcfce7' : '#fee2e2',
                        color: state.success ? '#166534' : '#991b1b',
                        textAlign: 'center'
                    }}>
                        {state.message}
                    </div>
                )}
            </div>
        </div>
    );
}
