# PostPipe Form System Guide (MongoDB)

Use this guide to implement dynamic forms (Contact, Feedback, Newsletter) with database storage.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI command.

```bash
npx create-postpipe-form@latest
# Follow prompts:
# 1. Choose Database: MongoDB
# 2. Select Forms: Contact Us, Feedback, Newsletter (Select all needed)
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose zode
```

---

## Phase 2: Verify Backend

The CLI creates:

- Models: `lib/models/Contact.ts`, `Feedback.ts`, etc.
- API Routes: `app/api/forms/contact/route.ts`, etc.

**Endpoints:**

- `POST /api/forms/contact`: Saves contact submission.
- `POST /api/forms/newsletter`: Subscribes email.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Create a Contact Form Component (`components/ContactForm.tsx`).

```tsx
"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    const res = await fetch("/api/forms/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) setStatus("Message sent!");
    else setStatus("Error sending message.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Name"
        required
        className="border p-2 w-full"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="border p-2 w-full"
      />
      <textarea
        name="message"
        placeholder="Message"
        required
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Send
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

**Step 3.2**: Newsletter Input (`components/Newsletter.tsx`).

```tsx
"use client";
// Similar POST logic to /api/forms/newsletter with { email } body.
```
