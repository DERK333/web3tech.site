// Groups bot runs into calendar days for the market-insights page. Pure
// shaping of records that were already fetched.

const stampOf = (run) => run.started_at || run.created_date || null;

export function dayLabel(day) {
  if (!day) return "";
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function groupRunsByDay(runs) {
  const map = new Map();

  (runs || []).forEach((run) => {
    const stamp = stampOf(run);
    if (!stamp) return;
    const day = String(stamp).slice(0, 10);
    const entry = map.get(day) || { day, runs: [], trades: 0, equity: null, last: null };
    entry.runs.push(run);
    entry.trades += Number(run.trades || 0);
    if (!entry.last || new Date(stamp) > new Date(stampOf(entry.last))) {
      entry.last = run;
      if (run.equity != null) entry.equity = Number(run.equity);
    }
    map.set(day, entry);
  });

  const days = [...map.values()].sort((a, b) => (a.day < b.day ? 1 : -1));

  return days.map((entry, index) => {
    const prior = days[index + 1];
    const change =
      entry.equity != null && prior?.equity != null ? entry.equity - prior.equity : null;
    return { ...entry, scans: entry.runs.length, change };
  });
}