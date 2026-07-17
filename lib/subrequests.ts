import { db } from '@/lib/db';

// Every player at the same venue as the fixture (any league there — a venue
// can run leagues on different days), whose AvailabilityPreference matches
// this fixture's day+slot — excluding the requesting team's own roster
// (already-rostered players aren't "subs" for their own team).
export async function getEligibleSubs(fixtureId: string, requestingTeamId: string) {
  const fixture = await db.fixture.findUnique({
    where: { id: fixtureId },
    include: { season: { include: { league: true } } },
  });
  if (!fixture) return [];

  const { location, day } = fixture.season.league;

  const preferences = await db.availabilityPreference.findMany({
    where: {
      dayOfWeek: day,
      timeSlot: fixture.timeSlot,
      user: {
        memberships: {
          some: {
            teamId: { not: requestingTeamId },
            team: { league: { location } },
          },
        },
      },
    },
    include: { user: true },
  });

  const seen = new Set<string>();
  const users = [];
  for (const p of preferences) {
    if (seen.has(p.user.id)) continue;
    seen.add(p.user.id);
    users.push(p.user);
  }
  return users;
}

// The reverse query: every OPEN sub request a given player is eligible for
// (same venue, matching day+slot preference, not their own team) — drives
// the /my-team list and the nav badge.
export async function getOpenSubRequestsForUser(userId: string) {
  const memberships = await db.teamMembership.findMany({
    where: { userId },
    include: { team: { include: { league: true } } },
  });
  if (memberships.length === 0) return [];

  const myTeamIds = memberships.map((m) => m.teamId);
  const myLocations = [...new Set(memberships.map((m) => m.team.league.location))];

  const preferences = await db.availabilityPreference.findMany({ where: { userId } });
  if (preferences.length === 0) return [];

  const openRequests = await db.subRequest.findMany({
    where: {
      status: 'OPEN',
      teamId: { notIn: myTeamIds },
      fixture: { season: { league: { location: { in: myLocations } } } },
    },
    include: {
      team: true,
      fixture: { include: { homeTeam: true, awayTeam: true, season: { include: { league: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return openRequests.filter((r) =>
    preferences.some(
      (p) => p.dayOfWeek === r.fixture.season.league.day && p.timeSlot === r.fixture.timeSlot,
    ),
  );
}
