import { db } from '@/lib/db';
import { getCurrentSeason } from '@/lib/season';

// A team's next fixture in the current season that isn't PLAYED yet, plus
// whether it's eligible for activation — only once the fixture immediately
// before it (for this team) is PLAYED, or there isn't one (season's first).
export async function getNextActivatableFixture(teamId: string) {
  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) return null;

  const season = await getCurrentSeason(team.leagueId);
  if (!season) return null;

  const teamFixtures = await db.fixture.findMany({
    where: { seasonId: season.id, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { weekNumber: 'asc' },
  });

  const nextIndex = teamFixtures.findIndex((f) => f.status !== 'PLAYED');
  if (nextIndex === -1) return null; // this team's season is fully played

  const fixture = teamFixtures[nextIndex];
  const previous = teamFixtures[nextIndex - 1];
  const eligible = !previous || previous.status === 'PLAYED';

  return { fixture, eligible };
}

// For the captain's view: the team's next fixture, whether it can be
// activated yet, and the activation + response tally if it already has been.
export async function getTeamActivationStatus(teamId: string) {
  const next = await getNextActivatableFixture(teamId);
  if (!next) return null;

  const activation = await db.fixtureActivation.findUnique({
    where: { fixtureId_teamId: { fixtureId: next.fixture.id, teamId } },
    include: { responses: { include: { user: true } } },
  });

  return { ...next, activation };
}

// For a player: any activation on their team(s) they haven't responded to
// yet — drives the /my-team prompt and the nav badge.
export async function getPendingResponsePrompt(userId: string) {
  const memberships = await db.teamMembership.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = memberships.map((m) => m.teamId);
  if (teamIds.length === 0) return null;

  const activations = await db.fixtureActivation.findMany({
    where: { teamId: { in: teamIds } },
    include: {
      fixture: { include: { homeTeam: true, awayTeam: true } },
      team: true,
      responses: true,
    },
    orderBy: { activatedAt: 'desc' },
  });

  return activations.find((a) => !a.responses.some((r) => r.userId === userId)) ?? null;
}
