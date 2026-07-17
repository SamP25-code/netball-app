'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getOrigin } from '@/lib/origin';

export type AuthActionState = { error?: string; success?: boolean } | undefined;

// Sign-up reuses each team's existing payment-reference code (e.g. "BBR-TUE-T1")
// as its invite code — captains already know it, no separate invite system needed.
export async function requestSignup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .toUpperCase();

  if (!firstName || !lastName || !email || !reference) {
    return { error: 'Enter your first name, last name, email, and your team reference code.' };
  }

  const team = await db.team.findUnique({ where: { reference } });
  if (!team) {
    return { error: `No team found with reference code "${reference}". Check with your captain.` };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?ref=${encodeURIComponent(reference)}`,
      // Picked up by supabase/sync_auth_users.sql when the auth.users row is
      // first created, becoming public.users.displayName.
      data: { displayName: `${firstName} ${lastName}` },
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function requestLogin(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: 'Enter your email.' };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
