import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getUserTeamMemberships } from '@/lib/teams';
import { getLeagueWithCurrentSeasonFixtures } from '@/lib/league-view';
import { formatLeagueName } from '@/lib/format';
import { FixtureRow } from '@/components/FixtureRow';

export default async function MyTeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const memberships = await getUserTeamMemberships(user.id);
  if (memberships.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">My Team</h1>
        <p className="mt-4 text-sm text-gray-600">
          You&apos;re not linked to a team yet. Sign up again with your team&apos;s reference code, or
          ask your captain.
        </p>
      </div>
    );
  }

  // MVP assumption: a player is on one team. First membership wins.
  const membership = memberships[0];
  const team = membership.team;
  const league = team.league;

  const data = await getLeagueWithCurrentSeasonFixtures(league.id);
  const fixtures =
    data?.fixtures.filter((f) => f.homeTeamId === team.id || f.awayTeamId === team.id) ?? [];

  const roster = await db.teamMembership.findMany({
    where: { teamId: team.id },
    include: { user: true },
  });

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">{team.name}</h1>
      <p className="text-sm text-gray-600">{formatLeagueName(league)}</p>
      <p className="mt-2">
        <Link href={`/teams/${team.id}`} className="text-sm underline">
          View team stats →
        </Link>
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Roster</h2>
      <ul className="text-sm">
        {roster.map((m) => (
          <li key={m.id}>
            {m.user.displayName}
            {m.isCaptain ? ' (Captain)' : ''}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Fixtures</h2>
      {fixtures.length === 0 ? (
        <p className="text-sm text-gray-600">No fixtures yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {fixtures.map((f) => (
              <FixtureRow
                key={f.id}
                weekNumber={f.weekNumber}
                timeSlot={f.timeSlot}
                homeTeamId={f.homeTeamId}
                homeTeamName={f.homeTeam.name}
                awayTeamId={f.awayTeamId}
                awayTeamName={f.awayTeam.name}
                homeScore={f.homeScore}
                awayScore={f.awayScore}
                status={f.status}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
