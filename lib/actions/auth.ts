'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export type AuthActionState = { error?: string; success?: boolean } | undefined;

async function getOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const protocol = h.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${host}`;
}

// Sign-up reuses each team's existing payment-reference code (e.g. "BBR-TUE-T1")
// as its invite code — captains already know it, no separate invite system needed.
export async function requestSignup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .toUpperCase();

  if (!email || !reference) {
    return { error: 'Enter your email and your team reference code.' };
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
