# PostPipe Admin & Roles Guide (MongoDB)

Use this guide to implement Authorization (RBAC) and Admin Middleware.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-admin@latest
# Choose MongoDB
# Confirm Middleware installation
```

---

## Phase 2: Verify Backend

- **Middleware/Guard**: `lib/auth/adminGuard.ts` (Checks `user.role === 'admin'`).
- **Middleware**: `middleware.ts` (if scaffolded directly).

---

## Phase 3: Usage

**Step 3.1**: Protect API Route.

```typescript
import { adminGuard } from "@/lib/auth/adminGuard";

export async function POST(req: Request) {
  const isAdmin = await adminGuard();
  if (!isAdmin) return new Response("Unauthorized", { status: 403 });

  // Admin only logic
}
```
