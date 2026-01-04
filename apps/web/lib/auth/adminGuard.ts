import { createClient } from '../auth-test/db';

export async function adminGuard() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("⛔ Unauthorized: Please login first.");
    }

    const role = user.user_metadata?.role;

    if (role !== 'admin') {
        throw new Error("⛔ Access Denied: Admins Only!");
    }

    return user;
}
