export type TeamStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
};

export type StatsFixture = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

// A single team's own record — no ranking or points, deliberately not a
// league table (see plan doc: these leagues don't use that format).
export function computeTeamStats(teamId: string, fixtures: StatsFixture[]): TeamStats {
  const stats: TeamStats = { played: 0, won: 0, drawn: 0, lost: 0, scored: 0, conceded: 0 };

  for (const f of fixtures) {
    if (f.status !== 'PLAYED' || f.homeScore == null || f.awayScore == null) continue;
    const isHome = f.homeTeamId === teamId;
    const isAway = f.awayTeamId === teamId;
    if (!isHome && !isAway) continue;

    const own = isHome ? f.homeScore : f.awayScore;
    const opp = isHome ? f.awayScore : f.homeScore;

    stats.played++;
    stats.scored += own;
    stats.conceded += opp;
    if (own > opp) stats.won++;
    else if (own < opp) stats.lost++;
    else stats.drawn++;
  }

  return stats;
}
