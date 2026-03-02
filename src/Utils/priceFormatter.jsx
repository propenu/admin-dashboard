export function formatRupeesToCrore(amount) {
  if (!amount) return "0";

  // ✅ convert string → number (remove commas & symbols)
  const value = Number(String(amount).replace(/[^0-9.]/g, ""));

  if (isNaN(value)) return "0";

  const crore = value / 10000000;
  const lakh = value / 100000;

  if (crore >= 1) {
    return `${crore.toFixed(2).replace(/\.00$/, "")} Cr`;
  }

  if (lakh >= 1) {
    return `${lakh.toFixed(2).replace(/\.00$/, "")} Lakh`;
  }

  return value.toLocaleString("en-IN");
}
