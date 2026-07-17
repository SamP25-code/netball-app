'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser, canEnterScoreForFixture } from '@/lib/auth';

// Server Actions are reachable via direct POST, not just this form — always
// re-check authorization here, never rely on the UI only rendering this for
// authorized users.
export async function submitScore(formData: FormData) {
  const fixtureId = String(formData.get('fixtureId') ?? '');
  const homeScore = Number(formData.get('homeScore'));
  const awayScore = Number(formData.get('awayScore'));

  if (!fixtureId || !Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
    throw new Error('Invalid score submission.');
  }

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (!canEnterScoreForFixture(user)) throw new Error('Only Super Users can enter scores.');

  const fixture = await db.fixture.findUnique({
    where: { id: fixtureId },
    include: { season: true },
  });
  if (!fixture) throw new Error('Fixture not found.');

  await db.fixture.update({
    where: { id: fixtureId },
    data: {
      homeScore,
      awayScore,
      status: 'PLAYED',
      enteredByUserId: user.id,
      enteredAt: new Date(),
    },
  });

  const leagueId = fixture.season.leagueId;
  revalidatePath(`/fixtures/${leagueId}`);
  revalidatePath(`/results/${leagueId}`);
  revalidatePath('/my-team');
  revalidatePath('/admin/score-entry');
}
