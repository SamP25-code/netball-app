import { db } from '@/lib/db';

// A league's "current" season is whichever Season has the latest seasonStart
// that has already begun — not a stored flag, so nothing needs updating at
// rollover time and it stays correct even if next season's fixtures are
// imported a few days before it actually starts.
export async function getCurrentSeason(leagueId: string) {
  const now = new Date();

  const started = await db.season.findFirst({
    where: { leagueId, seasonStart: { lte: now } },
    orderBy: { seasonStart: 'desc' },
  });
  if (started) return started;

  // Nothing has started yet — fall back to the earliest upcoming season so
  // there's still something to show (e.g. "starts in 3 days").
  return db.season.findFirst({
    where: { leagueId },
    orderBy: { seasonStart: 'asc' },
  });
}
