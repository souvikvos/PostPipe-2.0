# PostPipe Appointment Guide (MongoDB)

Use this guide to implement Booking and Appointment management.

## Phase 1: Scaffolding

**Step 1.1**: Run the CLI.

```bash
npx create-postpipe-appointment@latest
# Choose MongoDB
```

---

## Phase 2: Verify Backend

- **Model**: `Appointment` (date, user, service, status).
- **API**: `/api/appointments`.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Booking Calendar.

Create a form to select Date and Time.
POST to `/api/appointments`.

**Step 3.2**: My Appointments.

List stored appointments for the user.
