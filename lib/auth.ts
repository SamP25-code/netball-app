import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return db.user.findUnique({ where: { id: authUser.id } });
}

export async function isCaptainOfTeam(userId: string, teamId: string) {
  const membership = await db.teamMembership.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  return membership?.isCaptain ?? false;
}

// Role terms (per Sam, 2026-07-17): "Super User" = User.isAdmin (global) —
// the only role that can enter scores or move players between teams.
// "Admin" = TeamMembership.isCaptain (team-scoped) — same viewing rights as
// a regular User, plus team management / sub-request permissions (not score
// entry). "User" = neither flag — own team's fixtures/results only.

// Regular players and captains only ever see their own club — not every
// league in the system. Only a Super User can view any league.
export async function canViewLeague(
  user: { id: string; isAdmin: boolean },
  leagueId: string,
) {
  if (user.isAdmin) return true;
  const membership = await db.teamMembership.findFirst({
    where: { userId: user.id, team: { leagueId } },
  });
  return membership !== null;
}

// Only a Super User can enter/edit scores — captains ("Admin") no longer can.
export function canEnterScoreForFixture(user: { isAdmin: boolean }) {
  return user.isAdmin;
}
