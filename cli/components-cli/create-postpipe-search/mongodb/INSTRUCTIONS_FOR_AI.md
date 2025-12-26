# PostPipe Search Guide (MongoDB)

Use this guide to implement Search functionality with fuzzy matching.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-search@latest
# Choose MongoDB
```

---

## Phase 2: Verify Backend

- **Utility**: `lib/utils/apiFeatures.ts` (contains filtering, sorting, pagination logic).
- **Usage**: You integrate this into your _existing_ API routes (like Products or Articles).

---

## Phase 3: Implementation

**Step 3.1**: Integrate in API Route.

```typescript
// In app/api/shop/products/route.ts
import { APIFeatures } from "@/lib/utils/apiFeatures";
import Product from "@/lib/models/Product";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url); // Convert to obj
  const queryString = Object.fromEntries(searchParams);

  const features = new APIFeatures(Product.find(), queryString)
    .search() // Make sure .search() method exists in the utility or implement regex
    .filter()
    .sort()
    .paginate();

  const results = await features.query;
  return NextResponse.json(results);
}
```

**Step 3.2**: Search Bar Frontend.

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.term.value;
    router.push(`/shop?keyword=${term}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <input name="term" placeholder="Search..." />
    </form>
  );
}
```
