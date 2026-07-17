import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/lib/actions/auth';
import { getPendingResponsePrompt } from '@/lib/availability';
import { getOpenSubRequestsForUser } from '@/lib/subrequests';

export async function NavBar() {
  const user = await getCurrentUser();
  const pending = user ? await getPendingResponsePrompt(user.id) : null;
  const openSubRequests = user ? await getOpenSubRequestsForUser(user.id) : [];
  const hasNotification = Boolean(pending) || openSubRequests.length > 0;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/leagues" className="font-semibold">
          Netball League
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/fixtures" className="underline">
            Fixtures
          </Link>
          <Link href="/results" className="underline">
            Results
          </Link>
          {user && (
            <Link href="/my-team" className="underline">
              My Team{hasNotification ? ' 🔔' : ''}
            </Link>
          )}
          {user && (
            <Link href="/availability" className="underline">
              My availability
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin/score-entry" className="underline">
              Score entry
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin/players" className="underline">
              Manage players
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/leagues" className="underline">
              All leagues
            </Link>
          )}
          {user ? (
            <form action={logout}>
              <button type="submit" className="underline">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" className="underline">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
