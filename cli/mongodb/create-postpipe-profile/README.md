# create-postpipe-profile 👤

> Scaffold a robust User Profile system for your PostPipe application in seconds.

## 🚀 Overview

`create-postpipe-profile` is a modular CLI tool from the **PostPipe Ecosystem**. It installs a complete backend and frontend implementation for user profile management, including:
- **Update Profile** (Name, Email)
- **Change Password** (Verify current, hash new)
- **Get User Details**
- **Premium UI Component** (No CSS framework dependency required)

## 📦 Installation

This tool is intended to be run via `npx` in a project that already has `create-postpipe-auth` installed (or a compatible Mongoose `User` model).

```bash
npx create-postpipe-profile
```

## 🛠️ What it Installs

Files are installed to `src/lib/profile` (or `lib/profile`):

-   **`actions.ts`**: Server Actions for `getUser`, `updateProfile`, `changePassword`.
-   **`schemas.ts`**: Zod validation schemas.
-   **`frontend/ProfilePage.tsx`**: A drop-in React component for the settings page.

## ✅ Prerequisites

1.  **Next.js** project (App Router recommended).
2.  **Mongoose** setup (connection to MongoDB).
3.  **User Model**: A standard `User` model (typically from `npx create-postpipe-auth`).

## 💻 Usage

1.  Run the CLI:
    ```bash
    npx create-postpipe-profile
    ```
2.  Follow the prompts to select your database (currently MongoDB supported).
3.  Create a page in your Next.js app (e.g., `app/profile/page.tsx`):

    ```tsx
    import ProfilePage from '@/lib/profile/frontend/ProfilePage';
    import { getUser } from '@/lib/profile/actions';

    export default async function Page() {
      const user = await getUser();
      return <ProfilePage user={user} />;
    }
    ```

## 🤝 Support

Part of the PostPipe project.
[GitHub Repository](https://github.com/Sourodip-1/PostPipe-2.0)
