import { setAvailabilityPreference } from '@/lib/actions/subrequests';

type Props = {
  days: string[];
  timeSlots: string[];
  selected: string[]; // "Day|Slot" keys
};

export function AvailabilityPreferencesForm({ days, timeSlots, selected }: Props) {
  const selectedSet = new Set(selected);

  return (
    <table className="mt-6 w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-300 text-left text-gray-500 dark:border-gray-600 dark:text-gray-400">
          <th className="py-2 pr-4">Day</th>
          {timeSlots.map((slot) => (
            <th key={slot} className="py-2 px-2 text-center">
              {slot}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day} className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2 pr-4 font-medium">{day}</td>
            {timeSlots.map((slot) => {
              const isOn = selectedSet.has(`${day}|${slot}`);
              return (
                <td key={slot} className="py-2 px-2 text-center">
                  <form action={setAvailabilityPreference}>
                    <input type="hidden" name="dayOfWeek" value={day} />
                    <input type="hidden" name="timeSlot" value={slot} />
                    <input type="hidden" name="enabled" value={(!isOn).toString()} />
                    <button
                      type="submit"
                      aria-label={`${day} ${slot}`}
                      className={
                        isOn
                          ? 'h-6 w-6 rounded bg-black dark:bg-white'
                          : 'h-6 w-6 rounded border border-gray-300 dark:border-gray-600'
                      }
                    />
                  </form>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
