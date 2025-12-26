# PostPipe Notifications Guide (MongoDB)

Use this guide to implement In-App and Email notifications.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-notify@latest
# Choose MongoDB
# Include Email (Resend)
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose resend
```

---

## Phase 2: Verify Backend

- **Model**: `Notification` (userId, message, readStatus).
- **API**: `/api/notifications` (GET / POST).
- **Helper**: `lib/actions/notify.ts` (Send email + create DB record).

---

## Phase 3: Frontend Implementation

**Step 3.1**: Notification Bell.

```tsx
"use client";
import { useState, useEffect } from "react";

export default function NotificationBell({ userId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?unread=true")
      .then((res) => res.json())
      .then((data) => setCount(data.count));
  }, []);

  return <span>🔔 {count}</span>;
}
```
