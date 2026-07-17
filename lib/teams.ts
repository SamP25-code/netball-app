import { db } from '@/lib/db';

export async function getUserTeamMemberships(userId: string) {
  return db.teamMembership.findMany({
    where: { userId },
    include: { team: { include: { league: true } } },
  });
}
