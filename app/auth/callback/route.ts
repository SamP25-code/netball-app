import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

// Reached after a magic-link click. Exchanges the auth code for a session,
// then — for sign-ups — links the now-authenticated user to the team whose
// reference code they signed up with (passed through as ?ref=).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const reference = searchParams.get('ref');
  const next = searchParams.get('next') ?? '/my-team';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (reference) {
        const team = await db.team.findUnique({ where: { reference } });
        if (team) {
          await db.teamMembership.upsert({
            where: { userId_teamId: { userId: data.user.id, teamId: team.id } },
            update: {},
            create: { userId: data.user.id, teamId: team.id },
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
