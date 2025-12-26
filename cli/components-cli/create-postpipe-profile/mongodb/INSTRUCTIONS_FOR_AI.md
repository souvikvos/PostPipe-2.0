# PostPipe Profile Guide (MongoDB)

Use this guide to implement User Profiles with editable fields.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-profile@latest
# Choose MongoDB
```

---

## Phase 2: Verify Backend

- **Model**: `Profile` (bio, socialLinks, avatar) - or extends `User`.
- **API**: `/api/profile`.

---

## Phase 3: Frontend

**Step 3.1**: Edit Profile Page.

Form to update bio/image. PUT to `/api/profile`.
