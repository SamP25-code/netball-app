'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser, isCaptainOfTeam } from '@/lib/auth';
import { getEligibleSubs } from '@/lib/subrequests';
import { sendEmail } from '@/lib/email';
import { getOrigin } from '@/lib/origin';

// Toggle one day+slot row on the current user's own standing sub-availability.
export async function setAvailabilityPreference(formData: FormData) {
  const dayOfWeek = String(formData.get('dayOfWeek') ?? '');
  const timeSlot = String(formData.get('timeSlot') ?? '');
  const enabled = formData.get('enabled') === 'true';
  if (!dayOfWeek || !timeSlot) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (enabled) {
    await db.availabilityPreference.upsert({
      where: { userId_dayOfWeek_timeSlot: { userId: user.id, dayOfWeek, timeSlot } },
      update: {},
      create: { userId: user.id, dayOfWeek, timeSlot },
    });
  } else {
    await db.availabilityPreference.deleteMany({ where: { userId: user.id, dayOfWeek, timeSlot } });
  }

  revalidatePath('/availability');
}

// Captain-only: broadcast that their team is short for a specific fixture.
export async function sendSubRequest(formData: FormData) {
  const fixtureId = String(formData.get('fixtureId') ?? '');
  const teamId = String(formData.get('teamId') ?? '');
  if (!fixtureId || !teamId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (!(await isCaptainOfTeam(user.id, teamId))) {
    throw new Error("Only this team's captain can send a sub request.");
  }

  const team = await db.team.findUnique({ where: { id: teamId } });
  const fixture = await db.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!team || !fixture) throw new Error('Not found.');

  await db.subRequest.create({
    data: { fixtureId, teamId, requestingCaptainUserId: user.id },
  });

  const eligible = await getEligibleSubs(fixtureId, teamId);
  const opponent = fixture.homeTeamId === teamId ? fixture.awayTeam.name : fixture.homeTeam.name;
  const origin = await getOrigin();

  await Promise.all(
    eligible.map((u) =>
      sendEmail({
        to: u.email,
        subject: `Sub needed: ${team.name} vs ${opponent}`,
        html: `<p>Hi ${u.displayName},</p><p><strong>${team.name}</strong> need a sub for their game vs ${opponent} (Week ${fixture.weekNumber}, ${fixture.timeSlot}) — you've said you're free then.</p><p>Respond in the app: <a href="${origin}/my-team">${origin}/my-team</a></p>`,
      }),
    ),
  );

  revalidatePath('/my-team');
}

// Atomic first-come-first-served claim.
export async function acceptSubRequest(formData: FormData) {
  const subRequestId = String(formData.get('subRequestId') ?? '');
  if (!subRequestId) throw new Error('Invalid request.');

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const result = await db.subRequest.updateMany({
    where: { id: subRequestId, status: 'OPEN' },
    data: { status: 'FILLED', filledByUserId: user.id, filledAt: new Date() },
  });

  if (result.count === 0) {
    throw new Error('Sorry, this sub request has already been filled.');
  }

  const subRequest = await db.subRequest.findUnique({
    where: { id: subRequestId },
    include: {
      requestingCaptainUser: true,
      team: true,
      fixture: { include: { homeTeam: true, awayTeam: true } },
    },
  });

  if (subRequest) {
    const opponent =
      subRequest.fixture.homeTeamId === subRequest.teamId
        ? subRequest.fixture.awayTeam.name
        : subRequest.fixture.homeTeam.name;
    await sendEmail({
      to: subRequest.requestingCaptainUser.email,
      subject: `Sub found: ${subRequest.team.name} vs ${opponent}`,
      html: `<p>${user.displayName} has accepted your sub request for ${subRequest.team.name} vs ${opponent}.</p>`,
    });
  }

  revalidatePath('/my-team');
}
