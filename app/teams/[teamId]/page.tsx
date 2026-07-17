import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser, canViewLeague } from '@/lib/auth';
import { getCurrentSeason } from '@/lib/season';
import { computeTeamStats } from '@/lib/team-stats';
import { formatLeagueName } from '@/lib/format';

export default async function TeamStatsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const team = await db.team.findUnique({ where: { id: teamId }, include: { league: true } });
  if (!team) notFound();

  if (!(await canViewLeague(user, team.leagueId))) {
    redirect('/leagues');
  }

  const season = await getCurrentSeason(team.leagueId);
  const fixtures = season
    ? await db.fixture.findMany({
        where: { seasonId: season.id, OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }] },
      })
    : [];

  const stats = computeTeamStats(team.id, fixtures);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-semibold">{team.name}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{formatLeagueName(team.league)}</p>

      <dl className="mt-6 grid grid-cols-3 gap-4 text-center sm:grid-cols-6">
        {(
          [
            ['Played', stats.played],
            ['Won', stats.won],
            ['Drawn', stats.drawn],
            ['Lost', stats.lost],
            ['Scored', stats.scored],
            ['Conceded', stats.conceded],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded border border-gray-200 p-3 dark:border-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
