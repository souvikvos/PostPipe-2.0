# PostPipe CLI Ecosystem 🚀

PostPipe offers a suite of modular CLI tools to help you scaffold authentication, appointments, forms, user management, and email utilities in seconds.

Based on your needs, you can install the **Full Suite** or pick **Individual Modules**.

## 📦 Quick Start (Recommended)

For a complete, production-ready authentication system (Signup, Login, Sessions, DB, Email), run:

```bash
npx create-postpipe-auth
```

---

## 💾 Supported Databases

Currently, our CLI tools are optimized for:

| Database          | Status             | Notes                              |
| :---------------- | :----------------- | :--------------------------------- |
| **MongoDB** 🍃    | ✅ Fully Supported | Mongoose ODM integration included. |
| **PostgreSQL** 🐘 | 🚧 Coming Soon     | Planned for future release.        |

---

## 🧩 Modular Tools

If you prefer to build piece-by-piece, use our specific modules:

| Feature                   | Command                           | Description                                       |
| :------------------------ | :-------------------------------- | :------------------------------------------------ |
| **Appointment System** 📅 | `npx create-postpipe-appointment` | Scaffolds Appointment Model, Actions & API.       |
| **Form APIs** 📝          | `npx create-postpipe-form`        | Interactive: Contact, Feedback, Newsletter forms. |
| **User Model** 👤         | `npx create-postpipe-user`        | Installs Mongoose User Model & DB Connector.      |
| **Email Util** 📧         | `npx create-postpipe-email`       | Installs Resend Email Utility.                    |
| **Signup Flow** 🔐        | `npx create-postpipe-signup`      | Installs Backend + Signup Page implementation.    |
| **User Profile** 👤       | `npx create-postpipe-profile`     | Installs Profile & Password Management pages.     |

---

## 📚 Documentation

### 1. `create-postpipe-auth` (The Master Tool)

This is the all-in-one solution. It scans your project structure and installs a fully functional authentication system.

**What it installs:**

- **Backend**: `src/lib/auth/` containing Actions, Schemas, Email, User Model.
- **Frontend**: `LoginPage`, `SignupPage`, `VerifyEmailPage`, `ResetPasswordPage`.
- **Dependencies**: `mongoose`, `zod`, `bcryptjs`, `jsonwebtoken`, `resend`, `postpipe`.

### 2. `create-postpipe-appointment`

Scaffolds a complete Appointment Booking System.

**Files Created:**

- `lib/models/Appointment.ts`: Mongoose schema.
- `lib/actions/appointment.ts`: Server Actions for booking.
- `app/api/appointment/route.ts`: API Route handler.

### 3. `create-postpipe-form`

Scaffolds robust Form Submission APIs. Now interactive!

**Interactive Options:**

- **Contact Form**: Standard contact API.
- **Feedback Form**: Feedback collection with ratings.
- **Newsletter**: Subscription logic.

### 4. `create-postpipe-user`

Perfect if you just want a standard Mongoose User model without the full auth logic.

**Files Created:**

- `lib/models/User.ts`: Complete Mongoose Schema with verification fields.
- `lib/dbConnect.ts`: Singleton Database connection helper.

### 5. `create-postpipe-email`

Installs the email sending infrastructure powered by [Resend](https://resend.com).

**Files Created:**

- `lib/sendEmail.ts`: `sendVerificationEmail` and `sendPasswordResetEmail` functions.

### 6. `create-postpipe-signup`

Scaffolds a complete "Sign Up" flow.

**What it does:**

- Installs the Backend infrastructure (User, DB, Email) required for signup.
- Creates a `SignupPage.tsx` component pre-wired to server actions.

### 7. `create-postpipe-profile`

Scaffolds a complete User Profile management system.

**What it does:**

- **Backend**: Installs `actions.ts` for updating profiles and changing passwords, and Zod schemas.
- **Frontend**: Creates a premium `ProfilePage.tsx` component.

**Features:**
- Update Name & Email.
- Secure Password Change (verifies old password).
- Fetch User details.

---

## 🛠️ Configuration

All tools require the following environment variables in your `.env` file:

```env
# Database Connection
DATABASE_URI=mongodb+srv://...

# Security via JWT
JWT_SECRET=your_super_secret_key

# Email Sending (Resend.com)
# If omitted, emails will be logged to the console
RESEND_API_KEY=re_123456789

# App URL for Links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Support

For issues, please visit our [GitHub Repository](https://github.com/Sourodip-1/PostPipe-2.0).
