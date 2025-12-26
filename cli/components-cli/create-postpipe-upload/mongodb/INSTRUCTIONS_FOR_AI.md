# PostPipe Upload Guide (MongoDB + Cloudinary/S3)

Use this guide to handle file uploads.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-upload@latest
# Choose MongoDB
# Choose Provider (e.g., Cloudinary)
```

**Step 1.2**: Dependencies.

```bash
npm install mongoose cloudinary
```

**Step 1.3**: Env Vars.

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Phase 2: Verify Backend

- **Model**: `File` (stores url, publicId, format).
- **API**: `/api/upload`.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Upload Component.

```tsx
"use client";
import { useState } from "react";

export default function FileUploader() {
  const [url, setUrl] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUrl(data.url);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && <img src={url} alt="Uploaded" width={200} />}
    </div>
  );
}
```
