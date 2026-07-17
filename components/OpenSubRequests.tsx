import { acceptSubRequest } from '@/lib/actions/subrequests';

type Props = {
  requests: {
    id: string;
    team: { name: string };
    fixture: {
      weekNumber: number;
      timeSlot: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
    };
  }[];
};

export function OpenSubRequests({ requests }: Props) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
      <h2 className="text-sm font-semibold">Sub requests near you</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
            <span>
              {r.team.name}: {r.fixture.homeTeam.name} vs {r.fixture.awayTeam.name} — Week{' '}
              {r.fixture.weekNumber}, {r.fixture.timeSlot}
            </span>
            <form action={acceptSubRequest}>
              <input type="hidden" name="subRequestId" value={r.id} />
              <button
                type="submit"
                className="rounded bg-black px-3 py-1 text-xs whitespace-nowrap text-white dark:bg-white dark:text-black"
              >
                I can play
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
