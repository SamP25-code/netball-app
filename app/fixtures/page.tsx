import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDefaultLeagueId } from '@/lib/default-league';

export default async function FixturesIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const leagueId = await getDefaultLeagueId();
  redirect(leagueId ? `/fixtures/${leagueId}` : '/leagues');
}
