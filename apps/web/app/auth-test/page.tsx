'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signup, login, logout } from '../../lib/auth-test/actions';

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
            disabled={pending}
        >
            {pending ? 'Processing...' : label}
        </button>
    );
}

export default function SupabaseDemo() {
    const [signupState, signupAction] = useFormState(signup, { success: false, message: '' });
    const [loginState, loginAction] = useFormState(login, { success: false, message: '' });

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-12">
            <h1 className="text-3xl font-bold mb-4">Supabase Auth Demo</h1>

            <section className="bg-white p-6 rounded shadow border">
                <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
                <form action={signupAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input name="name" type="text" className="w-full border p-2 rounded" required />
                        {signupState.errors?.name && <p className="text-red-500 text-xs mt-1">{signupState.errors.name[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input name="email" type="email" className="w-full border p-2 rounded" required />
                        {signupState.errors?.email && <p className="text-red-500 text-xs mt-1">{signupState.errors.email[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input name="password" type="password" className="w-full border p-2 rounded" required />
                        <p className="text-xs text-gray-500 mt-1">Min 8 chars, 1 letter, 1 number, 1 special char</p>
                        {signupState.errors?.password && <p className="text-red-500 text-xs mt-1">{signupState.errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirm Password</label>
                        <input name="confirmPassword" type="password" className="w-full border p-2 rounded" required />
                        {signupState.errors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupState.errors.confirmPassword[0]}</p>}
                    </div>
                    <SubmitButton label="Sign Up" />
                    {signupState.message && !signupState.errors && (
                        <p className={`text-sm ${signupState.success ? 'text-green-600' : 'text-red-600'}`}>
                            {signupState.message}
                        </p>
                    )}
                </form>
            </section>

            <section className="bg-white p-6 rounded shadow border">
                <h2 className="text-xl font-semibold mb-4">Login</h2>
                <form action={loginAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input name="email" type="email" className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input name="password" type="password" className="w-full border p-2 rounded" required />
                    </div>
                    <SubmitButton label="Login" />
                    {loginState.message && (
                        <p className={`text-sm ${loginState.success ? 'text-green-600' : 'text-red-600'}`}>
                            {loginState.message}
                        </p>
                    )}
                </form>
            </section>
        </div>
    );
}
