# PostPipe Analytics Guide (MongoDB)

Use this guide to track page views and user events.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-analytics@latest
# Choose MongoDB
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose useragent
```

---

## Phase 2: Verify Backend

- **Model**: `Analytics` (stores url, ip, userAgent, timestamp).
- **API**: `/api/analytics/track`.

---

## Phase 3: Frontend Integration

**Step 3.1**: Create a specialized Hook or Component.

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname]);

  return null;
}
```

**Step 3.2**: Add to Root Layout.

```tsx
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
```
