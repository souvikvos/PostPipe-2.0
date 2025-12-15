import { headers } from 'next/headers';

// Mock Authentication Check
// In a real app, verify the JWT or Session from cookies
export async function adminGuard() {
  const headersList = headers();
  const role = headersList.get('x-mock-role') || 'user'; // Simulated role for demo

  // In production:
  // const session = await auth();
  // if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

  if (role !== 'admin') {
    throw new Error("⛔ Access Denied: Admins Only!");
  }

  return true;
}
