import { submitAvailability } from '@/lib/actions/availability';

type Props = {
  activationId: string;
  opponentName: string;
  weekNumber: number;
  currentStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'UNSURE';
};

const OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNAVAILABLE', label: 'Not available' },
  { value: 'UNSURE', label: 'Unsure' },
] as const;

export function AvailabilityPrompt({ activationId, opponentName, weekNumber, currentStatus }: Props) {
  return (
    <div className="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
      <p className="text-sm">
        Are you available for <span className="font-medium">vs {opponentName}</span> (Week{' '}
        {weekNumber})?
      </p>
      <div className="mt-2 flex gap-2">
        {OPTIONS.map((opt) => (
          <form key={opt.value} action={submitAvailability}>
            <input type="hidden" name="activationId" value={activationId} />
            <input type="hidden" name="status" value={opt.value} />
            <button
              type="submit"
              className={
                currentStatus === opt.value
                  ? 'rounded bg-black px-3 py-1 text-sm text-white dark:bg-white dark:text-black'
                  : 'rounded border border-gray-300 px-3 py-1 text-sm dark:border-gray-600'
              }
            >
              {opt.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
