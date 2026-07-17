import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDefaultLeagueId } from '@/lib/default-league';

export default async function ResultsIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const leagueId = await getDefaultLeagueId();
  redirect(leagueId ? `/results/${leagueId}` : '/leagues');
}
