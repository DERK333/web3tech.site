import React from "react";

const ROWS = [
  { label: "Price above the 50-day average", points: 20 },
  { label: "50-day average above the 200-day", points: 15 },
  { label: "Price above the 200-day average", points: 5 },
  { label: "20-day momentum, scaled from −10% to +15%", points: 20 },
  { label: "60-day momentum, scaled from −20% to +40%", points: 15 },
  { label: "RSI(14) between 45 and 68 — strength, not froth", points: 15 },
  { label: "Realized volatility below 25%", points: 10 },
];

export default function ScoreAnatomy() {
  return (
    <div className="space-y-2">
      {ROWS.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(row.points / 20) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-xs text-foreground">
            {row.points}
          </span>
          <span className="w-[52%] shrink-0 text-xs leading-snug text-muted-foreground">
            {row.label}
          </span>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        The parts add to 100 — the score is that simple sum, never a black box.
      </p>
    </div>
  );
}