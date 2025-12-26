# Authentication System Implementation Guide

Use the following files to implement a secure Authentication system (Signup, Login, Password Reset, Email Verification) in a Next.js App Router application.

## Prerequisites

- **Dependencies**: `npm install mongoose bcryptjs jsonwebtoken resend zod`
- **Environment Variables**:
  ```env
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your-secret-key
  RESEND_API_KEY=re_...
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

## 1. Database Connection (`lib/dbConnect.ts`)

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the DATABASE_URI environment variable inside .env"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

## 2. Data Model (`lib/models/User.ts`)

```typescript
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password cannot be less than 6 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: String,
    verifyTokenExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
```

## 3. Validation Schemas (`lib/schemas.ts`)

```typescript
import { z } from "zod";

export const SignupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." }),
    email: z.string().email({ message: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
```

## 4. Email Utilities (`lib/email.ts`)

```typescript
import { Resend } from "resend";

// Initialize Resend only if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl}/auth/verify-email?token=${token}`;

  if (!resend) {
    console.log(`[DEV MODE] Verification Email to ${email}: ${link}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl}/auth/reset-password?token=${token}`;

  if (!resend) {
    console.log(`[DEV MODE] Password Reset Email to ${email}: ${link}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
```

## 5. Server Actions (`lib/auth/actions.ts`)

```typescript
"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "../dbConnect"; // Adjust path
import User from "../models/User"; // Adjust path
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../schemas"; // Adjust path
import { sendVerificationEmail, sendPasswordResetEmail } from "../email"; // Adjust path

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function signup(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = SignupSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validated.data;

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry,
    });

    await newUser.save();
    await sendVerificationEmail(email, verifyToken);

    return {
      success: true,
      message: "User created. Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function login(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = LoginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    if (!user.isVerified) {
      return { success: false, message: "Please verify your email first" };
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return { success: true, message: "Logged in successfully" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function logout(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  (await cookies()).delete("token");
  return { success: true, message: "Logged out successfully" };
}

export async function signOut() {
  "use server";
  (await cookies()).delete("token");
}

export async function forgotPassword(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = ForgotPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email } = validated.data;

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: true,
        message: "If an account exists, a reset link has been sent.",
      };
    }

    const forgotPasswordToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const forgotPasswordTokenExpiry = new Date(Date.now() + 3600000);

    user.forgotPasswordToken = forgotPasswordToken;
    user.forgotPasswordTokenExpiry = forgotPasswordTokenExpiry;
    await user.save();

    await sendPasswordResetEmail(email, forgotPasswordToken);

    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot Password error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function resetPassword(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = ResetPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validated.data;

  try {
    await dbConnect();

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successfully. You can now login.",
    };
  } catch (error) {
    console.error("Reset Password error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function verifyEmail(token: string) {
  if (!token) {
    return { success: false, message: "Token is required" };
  }

  try {
    await dbConnect();

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Email verified successfully. You can now login.",
    };
  } catch (error) {
    console.error("Verify Email error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function resendVerification(
  prevState: any,
  formData: FormData
): Promise<AuthState> {
  const rawData = Object.fromEntries(formData.entries());
  const email = rawData.email as string;

  if (!email) {
    return { success: false, message: "Email is required" };
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.isVerified) {
      return { success: false, message: "Email already verified" };
    }

    const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = verifyTokenExpiry;
    await user.save();

    await sendVerificationEmail(email, verifyToken);

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Resend Verification error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function getSession() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      exp: decoded.exp,
    };
  } catch (error) {
    return null;
  }
}
```

## 6. Frontend: Signup Page (`app/auth/signup/page.tsx`)

```tsx
"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "@/lib/auth/actions";

const initialState = {
  message: "",
  success: false,
};

export default function SignupPage() {
  const [state, action] = useFormState(signup, initialState);

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Sign Up</h2>
      <form
        action={action}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>
      {state?.message && (
        <p
          style={{
            color: state.success ? "green" : "red",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          {state.message}
        </p>
      )}
      {state?.errors && (
        <div style={{ color: "red", fontSize: "0.8em", marginTop: "10px" }}>
          <pre>{JSON.stringify(state.errors, null, 2)}</pre>
        </div>
      )}
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "#0070f3" }}>
          Login
        </Link>
      </p>
    </div>
  );
}
```
