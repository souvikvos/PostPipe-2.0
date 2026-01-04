import { adminGuard } from '../../lib/auth/adminGuard';

export default async function AdminPage() {
    try {
        await adminGuard();
    } catch (error) {
        return (
            <div className="p-8 text-red-600">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>{(error as Error).message}</p>
            </div>
        );
    }

    return (
        <div className="p-8 text-green-600">
            <h1 className="text-2xl font-bold">Admin Access Granted</h1>
            <p>Welcome, Administrator.</p>
        </div>
    );
}
