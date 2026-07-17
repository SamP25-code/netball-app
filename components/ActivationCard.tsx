import { activateFixture } from '@/lib/actions/availability';
import { sendSubRequest } from '@/lib/actions/subrequests';

type ResponseRow = {
  id: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'UNSURE';
  user: { displayName: string };
};

type SubRequestRow = {
  id: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  filledByUser?: { displayName: string } | null;
};

type Props = {
  fixtureId: string;
  teamId: string;
  opponentName: string;
  weekNumber: number;
  timeSlot: string;
  eligible: boolean;
  activation: { responses: ResponseRow[] } | null;
  subRequests: SubRequestRow[];
};

const LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Not available',
  UNSURE: 'Unsure',
};

export function ActivationCard({
  fixtureId,
  teamId,
  opponentName,
  weekNumber,
  timeSlot,
  eligible,
  activation,
  subRequests,
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

      <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
        <form action={sendSubRequest}>
          <input type="hidden" name="fixtureId" value={fixtureId} />
          <input type="hidden" name="teamId" value={teamId} />
          <button
            type="submit"
            className="rounded border border-gray-300 px-3 py-1 text-sm dark:border-gray-600"
          >
            Send sub request
          </button>
        </form>
        {subRequests.length > 0 && (
          <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {subRequests.map((sr) => (
              <li key={sr.id}>
                {sr.status === 'OPEN' && 'Sub request open — waiting for a response'}
                {sr.status === 'FILLED' &&
                  `Sub request filled by ${sr.filledByUser?.displayName ?? 'someone'}`}
                {sr.status === 'CANCELLED' && 'Sub request cancelled'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
