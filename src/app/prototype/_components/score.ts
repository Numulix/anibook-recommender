// PROTOTYPE — agreed score tiers. green >=75, yellow 60-74, orange 50-59.
export type Tier = { pct: number; text: string; bg: string; ring: string; bar: string };

export function scoreTier(score: number): Tier {
  const pct = Math.round(score * 100);
  if (pct >= 75) return { pct, text: "text-emerald-300", bg: "bg-emerald-500/15", ring: "ring-emerald-500/30", bar: "bg-emerald-400" };
  if (pct >= 60) return { pct, text: "text-amber-300", bg: "bg-amber-500/15", ring: "ring-amber-500/30", bar: "bg-amber-400" };
  return { pct, text: "text-orange-300", bg: "bg-orange-500/15", ring: "ring-orange-500/30", bar: "bg-orange-400" };
}
