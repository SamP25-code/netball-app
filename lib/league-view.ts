import { db } from '@/lib/db';
import { getCurrentSeason } from '@/lib/season';

// Shared by the fixtures/results/my-team pages: a league's teams plus its
// current season's fixtures (or an empty list if no season has been imported
// for it yet).
export async function getLeagueWithCurrentSeasonFixtures(leagueId: string) {
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });
  if (!league) return null;

  const season = await getCurrentSeason(leagueId);
  if (!season) return { league, season: null, fixtures: [] };

  const fixtures = await db.fixture.findMany({
    where: { seasonId: season.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ weekNumber: 'asc' }, { timeSlot: 'asc' }],
  });

  return { league, season, fixtures };
}
