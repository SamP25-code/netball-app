import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getUserTeamMemberships } from '@/lib/teams';

// Browsing every club is an admin-only capability — regular players and
// captains only ever see their own club (see lib/auth.ts#canViewLeague).
export default async function LeaguesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!user.isAdmin) {
    const memberships = await getUserTeamMemberships(user.id);
    const leagueId = memberships[0]?.team.leagueId;
    if (leagueId) redirect(`/fixtures/${leagueId}`);
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="mb-6 text-2xl font-semibold">Leagues</h1>
        <p className="text-sm text-gray-600">You&apos;re not linked to a team yet.</p>
      </div>
    );
  }

  const leagues = await db.league.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-semibold">Leagues</h1>
      {leagues.length === 0 && <p className="text-sm text-gray-600">No leagues yet.</p>}
      <ul className="flex flex-col gap-2">
        {leagues.map((l) => (
          <li key={l.id} className="rounded border border-gray-200 p-4">
            <div className="font-medium">{l.name}</div>
            <div className="mt-2 flex gap-4 text-sm">
              <Link href={`/fixtures/${l.id}`} className="underline">
                Fixtures
              </Link>
              <Link href={`/results/${l.id}`} className="underline">
                Results
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
