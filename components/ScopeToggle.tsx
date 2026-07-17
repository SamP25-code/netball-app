import Link from 'next/link';

type Props = { basePath: 'fixtures' | 'results'; leagueId: string; active: 'team' | 'league' };

// Only rendered when the viewer actually has a team in this league — a Super
// User just browsing a league they're not part of has no "My Team" to show.
export function ScopeToggle({ basePath, leagueId, active }: Props) {
  return (
    <div className="mb-4 flex gap-3 text-sm">
      <Link
        href={`/${basePath}/${leagueId}?view=team`}
        className={active === 'team' ? 'font-medium underline' : 'underline text-gray-500 dark:text-gray-400'}
      >
        My Team
      </Link>
      <Link
        href={`/${basePath}/${leagueId}?view=league`}
        className={active === 'league' ? 'font-medium underline' : 'underline text-gray-500 dark:text-gray-400'}
      >
        League
      </Link>
    </div>
  );
}
