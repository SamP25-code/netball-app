import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getLeagueWithCurrentSeasonFixtures } from '@/lib/league-view';
import { formatLeagueName } from '@/lib/format';
import { ScoreEntryForm } from '@/components/ScoreEntryForm';

// Only a Super User can enter scores — captains ("Admin") view-only, matching
// lib/auth.ts#canEnterScoreForFixture.
export default async function ScoreEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ leagueId?: string }>;
}) {
  const { leagueId } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Score entry</h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Only Super Users can enter results — talk to your league admin if a score needs correcting.
        </p>
      </div>
    );
  }

  if (!leagueId) {
    const leagues = await db.league.findMany({ orderBy: { name: 'asc' } });

    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Score entry — pick a league</h1>
        <ul className="mt-4 flex flex-col gap-2">
          {leagues.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/score-entry?leagueId=${l.id}`} className="underline">
                {formatLeagueName(l)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const data = await getLeagueWithCurrentSeasonFixtures(leagueId);
  if (!data || !data.season) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Score entry</h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">No season scheduled for this league yet.</p>
      </div>
    );
  }

  const { league, fixtures } = data;

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">{formatLeagueName(league)} — Score entry</h1>
      <div className="mt-6 flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
        {fixtures.map((f) => (
          <div key={f.id} className="py-1">
            <span className="mr-2 text-xs text-gray-400 dark:text-gray-500">
              Wk {f.weekNumber} · {f.timeSlot}
            </span>
            <ScoreEntryForm
              fixtureId={f.id}
              homeTeamName={f.homeTeam.name}
              awayTeamName={f.awayTeam.name}
              homeScore={f.homeScore}
              awayScore={f.awayScore}
            />
          </div>
        ))}
        {fixtures.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">No fixtures yet.</p>
        )}
      </div>
    </div>
  );
}
