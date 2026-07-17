import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { movePlayerToTeam } from '@/lib/actions/players';

// Super-User-only: move a player from one team to another.
export default async function PlayersAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Manage players</h1>
        <p className="mt-4 text-sm text-gray-600">Only Super Users can manage players.</p>
      </div>
    );
  }

  const [memberships, leagues] = await Promise.all([
    db.teamMembership.findMany({
      include: { user: true, team: { include: { league: true } } },
      orderBy: [{ team: { league: { name: 'asc' } } }, { team: { name: 'asc' } }],
    }),
    db.league.findMany({
      include: { teams: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Manage players</h1>
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-gray-500">
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Current team</th>
            <th className="py-2">Move to</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((m) => (
            <tr key={m.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                {m.user.displayName}
                {m.isCaptain ? ' (Captain)' : ''}
              </td>
              <td className="py-2 pr-4">
                {m.team.name} — {m.team.league.name}
              </td>
              <td className="py-2">
                <form action={movePlayerToTeam} className="flex items-center gap-2">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <select
                    name="teamId"
                    defaultValue={m.teamId}
                    className="rounded border border-gray-300 px-2 py-1"
                  >
                    {leagues.map((l) => (
                      <optgroup key={l.id} label={l.name}>
                        {l.teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="submit" className="rounded bg-black px-3 py-1 text-white">
                    Move
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {memberships.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-gray-600">
                No players yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
