import Link from 'next/link';

type Props = { leagueId: string; active: 'fixtures' | 'results' };

const TABS = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'results', label: 'Results' },
] as const;

export function LeagueNav({ leagueId, active }: Props) {
  return (
    <nav className="mt-2 mb-6 flex gap-4 text-sm">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/${t.key}/${leagueId}`}
          className={t.key === active ? 'font-medium underline' : 'underline'}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
