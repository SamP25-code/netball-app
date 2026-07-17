'use client';

import { submitScore } from '@/lib/actions/scores';

type Props = {
  fixtureId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
};

export function ScoreEntryForm({
  fixtureId,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: Props) {
  return (
    <form action={submitScore} className="flex items-center gap-2 py-2 text-sm">
      <input type="hidden" name="fixtureId" value={fixtureId} />
      <span className="w-32 truncate font-medium">{homeTeamName}</span>
      <input
        type="number"
        name="homeScore"
        defaultValue={homeScore ?? undefined}
        required
        min={0}
        className="w-16 rounded border border-gray-300 px-2 py-1"
      />
      <span className="text-gray-400">–</span>
      <input
        type="number"
        name="awayScore"
        defaultValue={awayScore ?? undefined}
        required
        min={0}
        className="w-16 rounded border border-gray-300 px-2 py-1"
      />
      <span className="w-32 truncate font-medium">{awayTeamName}</span>
      <button type="submit" className="rounded bg-black px-3 py-1 text-white">
        Save
      </button>
    </form>
  );
}
