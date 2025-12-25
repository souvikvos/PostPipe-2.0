# create-postpipe-appointment

A CLI tool to scaffold a production-ready Appointment System for Next.js applications using MongoDB and Mongoose.

## Features

- 📅 **Appointment Model**: Complete Mongoose schema with validation.
- 🚀 **Server Actions**: Ready-to-use Next.js Server Actions for creating and fetching appointments.
- 🔌 **API Routes**: Standard Next.js API route handlers.
- 🛡️ **Type Safety**: Fully typed with TypeScript.
- 📦 **Zero Config**: Installs necessary dependencies (`mongoose`, `zod`) automatically.

## Installation

Run the following command in your Next.js project root:

```bash
npx create-postpipe-appointment
```

## What it does

1.  **Prompts** you to confirm the database (currently supports MongoDB).
2.  **Copies** the following files to your project:
    - `lib/models/Appointment.ts`: The Mongoose model.
    - `lib/actions/appointment.ts`: Server actions for form submissions.
    - `lib/dbConnect.ts`: MongoDB connection utility (if not present).
    - `app/api/appointment/route.ts`: API route handler.
3.  **Installs** required dependencies: `mongoose`, `zod`.
4.  **Configures** your `.env` file with a placeholder `DATABASE_URI`.

## Usage

After running the CLI, you can use the generated Server Actions in your components:

```tsx
"use client";

import { useFormState } from "react-dom";
import { createAppointment } from "@/lib/actions/appointment";

export default function AppointmentForm() {
  const [state, formAction] = useFormState(createAppointment, {
    message: "",
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="date" type="date" required />
      <input name="time" type="time" required />
      <textarea name="reason" placeholder="Reason" required />
      <button type="submit">Book Appointment</button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

## Requirements

- Next.js (App Router recommended)
- MongoDB Database

## License

CC-BY-NC-SA-4.0
