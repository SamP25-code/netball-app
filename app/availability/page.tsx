import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AvailabilityPreferencesForm } from '@/components/AvailabilityPreferencesForm';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_ORDER = ['6:30pm', '7:00pm', '7:30pm', '8:00pm', '8:30pm'];

export default async function AvailabilityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const leagues = await db.league.findMany({ select: { day: true, timeSlots: true } });
  const days = [...new Set(leagues.map((l) => l.day))].sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
  );
  const timeSlots = [...new Set(leagues.flatMap((l) => l.timeSlots))].sort(
    (a, b) => SLOT_ORDER.indexOf(a) - SLOT_ORDER.indexOf(b),
  );

  const myPreferences = await db.availabilityPreference.findMany({ where: { userId: user.id } });
  const selected = myPreferences.map((p) => `${p.dayOfWeek}|${p.timeSlot}`);

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">My availability for subbing</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Tick the day + time combinations you&apos;d be free to sub for a game at your venue.
        You&apos;ll only be notified when a sub request actually matches one of these.
      </p>
      <AvailabilityPreferencesForm days={days} timeSlots={timeSlots} selected={selected} />
    </div>
  );
}
