import Link from 'next/link';

type Props = {
  weekNumber: number;
  timeSlot: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

export function FixtureRow({
  weekNumber,
  timeSlot,
  homeTeamId,
  homeTeamName,
  awayTeamId,
  awayTeamName,
  homeScore,
  awayScore,
  status,
}: Props) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="py-2 pr-4 text-sm text-gray-500 dark:text-gray-400">Wk {weekNumber}</td>
      <td className="py-2 pr-4 text-sm text-gray-500 dark:text-gray-400">{timeSlot}</td>
      <td className="py-2 pr-2 text-sm font-medium">
        <Link href={`/teams/${homeTeamId}`} className="hover:underline">
          {homeTeamName}
        </Link>
      </td>
      <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">
        {status === 'PLAYED' ? `${homeScore} – ${awayScore}` : 'vs'}
      </td>
      <td className="py-2 pl-2 text-sm font-medium">
        <Link href={`/teams/${awayTeamId}`} className="hover:underline">
          {awayTeamName}
        </Link>
      </td>
    </tr>
  );
}
