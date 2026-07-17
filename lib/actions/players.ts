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

// Toggle "Admin" (team-scoped captain) status for one membership.
export async function setCaptain(formData: FormData) {
  const membershipId = String(formData.get('membershipId') ?? '');
  const isCaptain = formData.get('isCaptain') === 'true';
  if (!membershipId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error('Only Super Users can assign Admin status.');

  await db.teamMembership.update({
    where: { id: membershipId },
    data: { isCaptain },
  });

  revalidatePath('/admin/players');
}

// Toggle "Super User" (global) status for one user.
export async function setSuperUser(formData: FormData) {
  const userId = String(formData.get('userId') ?? '');
  const isAdmin = formData.get('isAdmin') === 'true';
  if (!userId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error('Only Super Users can assign Super User status.');
  if (user.id === userId && !isAdmin) {
    throw new Error("You can't remove your own Super User status.");
  }

  await db.user.update({
    where: { id: userId },
    data: { isAdmin },
  });

  revalidatePath('/admin/players');
}
