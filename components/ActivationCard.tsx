import { activateFixture } from '@/lib/actions/availability';

type ResponseRow = {
  id: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'UNSURE';
  user: { displayName: string };
};

type Props = {
  teamId: string;
  opponentName: string;
  weekNumber: number;
  timeSlot: string;
  eligible: boolean;
  activation: { responses: ResponseRow[] } | null;
};

const LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Not available',
  UNSURE: 'Unsure',
};

export function ActivationCard({
  teamId,
  opponentName,
  weekNumber,
  timeSlot,
  eligible,
  activation,
}: Props) {
  if (!activation) {
    return (
      <div className="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm">
          Next fixture: <span className="font-medium">vs {opponentName}</span> — Week {weekNumber},{' '}
          {timeSlot}
        </p>
        {eligible ? (
          <form action={activateFixture} className="mt-3">
            <input type="hidden" name="teamId" value={teamId} />
            <button
              type="submit"
              className="rounded bg-black px-3 py-1 text-sm text-white dark:bg-white dark:text-black"
            >
              Activate for availability
            </button>
          </form>
        ) : (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Enter last week&apos;s result before activating this one.
          </p>
        )}
      </div>
    );
  }

  const counts = { AVAILABLE: 0, UNAVAILABLE: 0, UNSURE: 0 };
  activation.responses.forEach((r) => counts[r.status]++);

  return (
    <div className="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
      <p className="text-sm font-medium">
        vs {opponentName} — Week {weekNumber}, {timeSlot}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {counts.AVAILABLE} available · {counts.UNAVAILABLE} not available · {counts.UNSURE} unsure
      </p>
      {activation.responses.length > 0 && (
        <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {activation.responses.map((r) => (
            <li key={r.id}>
              {r.user.displayName}: {LABELS[r.status]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
