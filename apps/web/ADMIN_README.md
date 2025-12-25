# Admin Template Manager

This secure Admin UI allows managing PostPipe Templates locally.

## Setup

1.  **Environment Variables**:
    Add the `ADMIN_SECRET` to your `.env` file in `apps/web`:

    ```env
    ADMIN_SECRET=your-secure-secret-key-here
    MONGODB_URI=mongodb+srv://...
    ```

2.  **Running**:
    Start the development server:

    ```bash
    npm run dev
    ```

    Access the admin panel at: `http://localhost:3000/admin`

3.  **Authentication**:
    You will be prompted to enter the `ADMIN_SECRET` to access the dashboard.

## Architecture

- **Schema**: The Mongoose schema is defined in `models/Template.ts`.
- **API**: REST API routes are located in `app/api/admin/templates`.
- **Security**: Authentication is handled via `lib/admin-auth.ts` and `app/admin/layout.tsx`.
