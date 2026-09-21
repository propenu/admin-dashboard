/**
 * Short Indian-style counts for compact UI:
 * < 1,000 → raw number
 * ≥ 1,000 → K (thousands)
 * ≥ 1,00,000 → L (lakhs)
 * ≥ 1,00,00,000 → C (crores)
 *
 * Examples: 999 → "999", 10000 → "10K", 1020000 → "10.2L", 10000000 → "1C"
 */
export const formatShortCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.round(n));

  const trim = (num) => {
    const fixed = num >= 100 ? num.toFixed(0) : num.toFixed(1);
    return fixed.replace(/\.0$/, "");
  };

  if (n >= 1_00_00_000) return `${trim(n / 1_00_00_000)}C`;
  if (n >= 1_00_000) return `${trim(n / 1_00_000)}L`;
  return `${trim(n / 1000)}K`;
};
