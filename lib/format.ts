// League.name (e.g. "Penwortham Monday") stays as the internal unique key
// matching Home-Project's reference-codes.json — this is just the friendly
// display version, built from the separate location/day fields.
export function formatLeagueName(league: { location: string; day: string }) {
  return `${league.location} - ${league.day}`;
}
