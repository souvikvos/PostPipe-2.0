# PostPipe CMS Implementation Guide (MongoDB)

Use this guide to build a robust Content Management System (CMS) with Next.js App Router, MongoDB, and PostPipe.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI command to generate the CMS backend (Models, APIs).

```bash
npx create-postpipe-cms@latest
# Follow prompts:
# 1. Choose Database: MongoDB
# 2. Select Modules: Blog (Articles), Reviews, Store (optional)
```

**Step 1.2**: Install Dependencies (if not auto-installed).

```bash
npm install mongoose slugify
# If you chose Reviews/Store modules, ensure other deps are present.
```

**Step 1.3**: Environment Setup (.env).

```env
MONGODB_URI=mongodb+srv://...
# Ensure your database is connected
```

---

## Phase 2: Verify & Extend Backend

The CLI scaffolds models in `lib/models` and APIs in `app/api`.

### 2.1 Blog System (`lib/models/Article.ts`)

The `Article` model includes title, slug, content, author, and tags. Ensure it matches your needs.

### 2.2 API Routes

- **GET /api/cms/articles**: Fetches paginated articles.
- **POST /api/cms/articles**: Creates a new article (Admin protected).
- **GET /api/cms/articles/[slug]**: Fetches single article.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Create a Blog Listing Page (`app/blog/page.tsx`).

```tsx
import Link from "next/link";

async function getArticles() {
  const res = await fetch(process.env.URL + "/api/cms/articles", {
    cache: "no-store",
  });
  return res.json();
}

export default async function BlogPage() {
  const { articles } = await getArticles();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Latest Articles</h1>
      <div className="grid gap-6">
        {articles.map((article: any) => (
          <div key={article._id} className="border p-4 rounded shadow-sm">
            <Link href={`/blog/${article.slug}`}>
              <h2 className="text-xl font-semibold">{article.title}</h2>
            </Link>
            <p className="text-gray-600">{article.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3.2**: Create Article View (`app/blog/[slug]/page.tsx`).

```tsx
async function getArticle(slug: string) {
  const res = await fetch(process.env.URL + `/api/cms/articles/${slug}`);
  return res.json();
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { article } = await getArticle(params.slug);

  if (!article) return <div>404 - Not Found</div>;

  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div
        className="prose lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
```

## Phase 4: Admin Dashboard (Optional)

Use **create-postpipe-admin** or build a simple form to POST to `/api/cms/articles` for creating content.
