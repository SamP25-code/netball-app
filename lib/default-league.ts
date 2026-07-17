import { getCurrentUser } from '@/lib/auth';
import { getUserTeamMemberships } from '@/lib/teams';

// Used by the bare /fixtures, /results routes to redirect a logged-in player
// straight to their own team's league instead of making them pick one.
export async function getDefaultLeagueId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const memberships = await getUserTeamMemberships(user.id);
  return memberships[0]?.team.leagueId ?? null;
}
