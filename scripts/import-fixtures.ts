import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../lib/db';

// One-time (per season) local import: reads data/reference-codes.json +
// data/fixtures/<Venue>/<Day>/fixtures.generated.json (committed in
// Home-Project) plus data/season-starts.json (real dates, filled in by Sam)
// and upserts League/Team/Season/Fixture rows. Never run at deploy time.
//
// Usage: npm run import:fixtures

const DATA_DIR = path.join(__dirname, '..', 'data');

type ReferenceTeam = { reference: string; team: string; weeklyFee: number };
type ReferenceLeague = {
  name: string;
  location: string;
  day: string;
  seasonStart: string;
  teams: ReferenceTeam[];
};
type ReferenceData = { leagues: ReferenceLeague[] };

type GeneratedGame = { timeSlot: string; home: string; away: string };
type GeneratedWeek = { weekNumber: number; games: GeneratedGame[] };
type GeneratedSchedule = {
  league: string;
  location: string;
  day: string;
  teams: string[];
  timeSlots: string[];
  seasonNumber: number;
  weeks: GeneratedWeek[];
};

function loadSeasonStarts(): Record<string, string | null> {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'season-starts.json'), 'utf8'));
}

function fixturesFilePath(league: ReferenceLeague): string {
  return path.join(DATA_DIR, 'fixtures', league.location, league.day, 'fixtures.generated.json');
}

async function importLeague(league: ReferenceLeague, seasonStart: string) {
  const dbLeague = await db.league.upsert({
    where: { name: league.name },
    update: { location: league.location, day: league.day },
    create: { name: league.name, location: league.location, day: league.day, timeSlots: [] },
  });

  const teamByName = new Map<string, { id: string }>();
  for (const t of league.teams) {
    const team = await db.team.upsert({
      where: { reference: t.reference },
      update: { name: t.team, weeklyFee: t.weeklyFee, leagueId: dbLeague.id },
      create: {
        reference: t.reference,
        name: t.team,
        weeklyFee: t.weeklyFee,
        leagueId: dbLeague.id,
      },
    });
    teamByName.set(t.team, { id: team.id });
  }

  const schedPath = fixturesFilePath(league);
  if (!fs.existsSync(schedPath)) {
    console.warn(`  ⚠ No generated fixture file for ${league.name} at ${schedPath} — skipped.`);
    return;
  }
  const sched: GeneratedSchedule = JSON.parse(fs.readFileSync(schedPath, 'utf8'));

  await db.league.update({ where: { id: dbLeague.id }, data: { timeSlots: sched.timeSlots } });

  const start = new Date(seasonStart);
  const season = await db.season.upsert({
    where: { leagueId_seasonNumber: { leagueId: dbLeague.id, seasonNumber: sched.seasonNumber } },
    update: { seasonStart: start },
    create: { leagueId: dbLeague.id, seasonNumber: sched.seasonNumber, seasonStart: start },
  });

  let imported = 0;
  for (const week of sched.weeks) {
    const date = new Date(start);
    date.setDate(date.getDate() + (week.weekNumber - 1) * 7);

    for (const game of week.games) {
      const home = teamByName.get(game.home);
      const away = teamByName.get(game.away);
      if (!home || !away) {
        console.warn(
          `  ⚠ Unknown team name in schedule for ${league.name}: ${game.home} vs ${game.away}`,
        );
        continue;
      }
      await db.fixture.upsert({
        where: {
          seasonId_weekNumber_homeTeamId_awayTeamId: {
            seasonId: season.id,
            weekNumber: week.weekNumber,
            homeTeamId: home.id,
            awayTeamId: away.id,
          },
        },
        update: { date, timeSlot: game.timeSlot },
        create: {
          seasonId: season.id,
          weekNumber: week.weekNumber,
          date,
          timeSlot: game.timeSlot,
          homeTeamId: home.id,
          awayTeamId: away.id,
        },
      });
      imported++;
    }
  }

  console.log(`✓ ${league.name}: season ${sched.seasonNumber}, ${sched.weeks.length} weeks, ${imported} fixtures.`);
}

async function run() {
  const refData: ReferenceData = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'reference-codes.json'), 'utf8'),
  );
  const seasonStarts = loadSeasonStarts();

  for (const league of refData.leagues) {
    const seasonStart = seasonStarts[league.name];
    if (!seasonStart) {
      console.warn(`⚠ Skipping ${league.name} — no seasonStart set in data/season-starts.json yet.`);
      continue;
    }
    await importLeague(league, seasonStart);
  }

  await db.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
