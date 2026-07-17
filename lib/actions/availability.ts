'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser, isCaptainOfTeam } from '@/lib/auth';
import { getNextActivatableFixture } from '@/lib/availability';
import { sendEmail } from '@/lib/email';
import { getOrigin } from '@/lib/origin';

// Captain-only: open up their own team's next fixture for an
// Available/Not available/Unsure check-in from every team member.
export async function activateFixture(formData: FormData) {
  const teamId = String(formData.get('teamId') ?? '');
  if (!teamId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (!(await isCaptainOfTeam(user.id, teamId))) {
    throw new Error("Only this team's captain can activate a fixture.");
  }

  const next = await getNextActivatableFixture(teamId);
  if (!next || !next.eligible) {
    throw new Error('This fixture is not eligible for activation yet.');
  }

  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) throw new Error('Team not found.');

  await db.fixtureActivation.upsert({
    where: { fixtureId_teamId: { fixtureId: next.fixture.id, teamId } },
    update: {},
    create: { fixtureId: next.fixture.id, teamId, activatedByUserId: user.id },
  });

  const roster = await db.teamMembership.findMany({ where: { teamId }, include: { user: true } });
  const opponent =
    next.fixture.homeTeamId === teamId ? next.fixture.awayTeam.name : next.fixture.homeTeam.name;
  const origin = await getOrigin();

  await Promise.all(
    roster.map((m) =>
      sendEmail({
        to: m.user.email,
        subject: `Availability needed: ${team.name} vs ${opponent}`,
        html: `<p>Hi ${m.user.displayName},</p><p>Your captain needs to know if you're available for <strong>${team.name} vs ${opponent}</strong> (Week ${next.fixture.weekNumber}, ${next.fixture.timeSlot}).</p><p>Respond in the app: <a href="${origin}/my-team">${origin}/my-team</a></p>`,
      }),
    ),
  );

  revalidatePath('/my-team');
}

// Any team member (including the captain) sets their own availability for
// an activated fixture. Re-submitting updates the existing response rather
// than creating a duplicate.
export async function submitAvailability(formData: FormData) {
  const activationId = String(formData.get('activationId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!activationId || !['AVAILABLE', 'UNAVAILABLE', 'UNSURE'].includes(status)) {
    throw new Error('Invalid request.');
  }

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const activation = await db.fixtureActivation.findUnique({ where: { id: activationId } });
  if (!activation) throw new Error('Activation not found.');

  const membership = await db.teamMembership.findUnique({
    where: { userId_teamId: { userId: user.id, teamId: activation.teamId } },
  });
  if (!membership) throw new Error('Not a member of this team.');

  await db.fixtureAvailabilityResponse.upsert({
    where: { activationId_userId: { activationId, userId: user.id } },
    update: { status: status as 'AVAILABLE' | 'UNAVAILABLE' | 'UNSURE', respondedAt: new Date() },
    create: { activationId, userId: user.id, status: status as 'AVAILABLE' | 'UNAVAILABLE' | 'UNSURE' },
  });

  revalidatePath('/my-team');
}
