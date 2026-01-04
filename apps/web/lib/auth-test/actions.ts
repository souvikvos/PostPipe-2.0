'use server';

import { createClient } from './db';
import { SignupSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from './schemas';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export interface AuthState {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export async function signup(prevState: any, formData: FormData): Promise<AuthState> {
    const rawData = Object.fromEntries(formData.entries());
    const validated = SignupSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors };
    }

    const { email, password, name } = validated.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, message: 'Check your email for the confirmation link.' };
}

export async function login(prevState: any, formData: FormData): Promise<AuthState> {
    const rawData = Object.fromEntries(formData.entries());
    const validated = LoginSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors };
    }

    const { email, password } = validated.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function logout(prevState: any, formData: FormData): Promise<AuthState> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}
