import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, canViewLeague } from '@/lib/auth';
import { getDefaultLeagueId } from '@/lib/default-league';
import { getUserTeamMemberships } from '@/lib/teams';
import { getLeagueWithCurrentSeasonFixtures } from '@/lib/league-view';
import { formatLeagueName } from '@/lib/format';
import { LeagueNav } from '@/components/LeagueNav';
import { ScopeToggle } from '@/components/ScopeToggle';
import { FixtureRow } from '@/components/FixtureRow';

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { leagueId } = await params;
  const { view } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!(await canViewLeague(user, leagueId))) {
    const ownLeagueId = await getDefaultLeagueId();
    if (ownLeagueId) redirect(`/fixtures/${ownLeagueId}`);
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Fixtures</h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          You&apos;re not linked to a team in this league.
        </p>
      </div>
    );
  }

  const data = await getLeagueWithCurrentSeasonFixtures(leagueId);
  if (!data) notFound();
  const { league, season, fixtures } = data;

  const memberships = await getUserTeamMemberships(user.id);
  const myTeamId = memberships.find((m) => m.team.leagueId === leagueId)?.teamId ?? null;
  const scope = myTeamId && view !== 'league' ? 'team' : 'league';

  const upcoming = fixtures.filter((f) => f.status !== 'PLAYED');
  const visible =
    scope === 'team' && myTeamId
      ? upcoming.filter((f) => f.homeTeamId === myTeamId || f.awayTeamId === myTeamId)
      : upcoming;

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">{formatLeagueName(league)}</h1>
      <LeagueNav leagueId={league.id} active="fixtures" />
      {myTeamId && <ScopeToggle basePath="fixtures" leagueId={league.id} active={scope} />}

      {!season && <p className="text-sm text-gray-600 dark:text-gray-400">No season scheduled yet.</p>}
      {season && visible.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">No fixtures yet.</p>
      )}
      {visible.length > 0 && (
        <table className="w-full border-collapse">
          <tbody>
            {visible.map((f) => (
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
