# PostPipe Delivery Guide (MongoDB)

Use this guide to manage shipments and delivery tracking.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-delivery@latest
# Choose MongoDB
```

---

## Phase 2: Verify Backend

- **Model**: `Delivery` (orderId, status, currentLoc).
- **API**: `/api/delivery`.

---

## Phase 3: Implementation

**Step 3.1**: Tracking Page.

```tsx
"use client";
// Fetch /api/delivery?orderId=...
// Display Timeline
```
