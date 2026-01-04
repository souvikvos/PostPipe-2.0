import { createClient } from './db';

// Supabase Admin Guard
// Verifies that the current user is logged in AND has the 'admin' role in their metadata.
export async function adminGuard() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("⛔ Unauthorized: Please login first.");
    }

    // Check for 'admin' role in metadata
    // You can set this in Supabase Dashboard -> Auth -> Users -> specific user -> Edit User -> Metadata
    // Add JSON: { "role": "admin" }
    const role = user.user_metadata?.role;

    if (role !== 'admin') {
        throw new Error("⛔ Access Denied: Admins Only!");
    }

    return user;
}
