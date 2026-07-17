'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Only a Super User can move a player between teams. Captaincy is
// team-specific, so it's cleared on a move rather than carried over.
export async function movePlayerToTeam(formData: FormData) {
  const membershipId = String(formData.get('membershipId') ?? '');
  const teamId = String(formData.get('teamId') ?? '');
  if (!membershipId || !teamId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error('Only Super Users can move players between teams.');

  await db.teamMembership.update({
    where: { id: membershipId },
    data: { teamId, isCaptain: false },
  });

  revalidatePath('/admin/players');
}
