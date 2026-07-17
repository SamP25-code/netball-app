import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { movePlayerToTeam, setCaptain, setSuperUser } from '@/lib/actions/players';
import { formatLeagueName } from '@/lib/format';

// Super-User-only: move a player from one team to another, and assign
// Admin (team captain) / Super User status without needing Supabase access.
export default async function PlayersAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-2xl font-semibold">Manage players</h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Only Super Users can manage players.
        </p>
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
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="text-2xl font-semibold">Manage players</h1>
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-gray-500 dark:border-gray-600 dark:text-gray-400">
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Current team</th>
            <th className="py-2 pr-4">Move to</th>
            <th className="py-2 pr-4">Admin</th>
            <th className="py-2">Super User</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((m) => (
            <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-4">{m.user.displayName}</td>
              <td className="py-2 pr-4">
                {m.team.name} — {formatLeagueName(m.team.league)}
              </td>
              <td className="py-2 pr-4">
                <form action={movePlayerToTeam} className="flex items-center gap-2">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <select
                    name="teamId"
                    defaultValue={m.teamId}
                    className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    {leagues.map((l) => (
                      <optgroup key={l.id} label={formatLeagueName(l)}>
                        {l.teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-1 text-white dark:bg-white dark:text-black"
                  >
                    Move
                  </button>
                </form>
              </td>
              <td className="py-2 pr-4">
                <form action={setCaptain}>
                  <input type="hidden" name="membershipId" value={m.id} />
                  <input type="hidden" name="isCaptain" value={(!m.isCaptain).toString()} />
                  <button
                    type="submit"
                    className="rounded border border-gray-300 px-3 py-1 whitespace-nowrap dark:border-gray-600"
                  >
                    {m.isCaptain ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </form>
              </td>
              <td className="py-2">
                <form action={setSuperUser}>
                  <input type="hidden" name="userId" value={m.user.id} />
                  <input type="hidden" name="isAdmin" value={(!m.user.isAdmin).toString()} />
                  <button
                    type="submit"
                    className="rounded border border-gray-300 px-3 py-1 whitespace-nowrap dark:border-gray-600"
                  >
                    {m.user.isAdmin ? 'Remove Super User' : 'Make Super User'}
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {memberships.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-gray-600 dark:text-gray-400">
                No players yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
