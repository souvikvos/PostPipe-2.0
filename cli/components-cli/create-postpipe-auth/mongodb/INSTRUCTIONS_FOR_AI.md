# PostPipe Authentication Guide (MongoDB)

Use this guide to implement a secure Authentication system (Sign Up, Login, Forgot Password, Verification).

## Phase 1: Scaffolding

**Step 1.1**: Run the Auth CLI.

```bash
npx create-postpipe-auth@latest
# Follow prompts:
# 1. Choose Database: MongoDB
# 2. Add features (Signup, User Model etc.)
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose bcryptjs jsonwebtoken resend
```

**Step 1.3**: Environment Variables.

```env
MONGODB_URI=...
JWT_SECRET=your_super_secret_jwt_key
RESEND_API_KEY=re_123... # For emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 2: Verify Backend

- **User Model**: `lib/models/User.ts` (Includes password, verification fields).
- **Actions**: `lib/actions/auth.ts` (Server actions for signup/login).
- **API**: `/api/auth/verify` and `/api/auth/reset-password`.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Create Signup Page (`app/signup/page.tsx`).

Use the `signup` Server Action.

```tsx
"use client";
import { signup } from "@/lib/actions/auth";

export default function Signup() {
  return (
    <form action={signup}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

**Step 3.2**: Create Login Page (`app/login/page.tsx`).

Similar to signup, use `login` action.

**Step 3.3**: Protect Routes.

Check session token in Middleware or Layout.
