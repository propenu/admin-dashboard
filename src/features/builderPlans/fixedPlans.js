import { Crown, Megaphone, TrendingUp } from "lucide-react";

/** The five builder subscriptions. Title, code and package are fixed; only pricing is edited. */
export const FIXED_PLAN_PRESETS = [
  {
    code: "BUILDER_PRIME",
    title: "Prime",
    meaning: "Top Prime section on the homepage.",
    mainPlacement: "prime",
    sponsoredEnabled: false,
    icons: [Crown],
    strip: "from-amber-400 to-yellow-300",
    iconWrap: "bg-amber-100 text-amber-600",
    ring: "hover:border-amber-200",
  },
  {
    code: "BUILDER_TOP_SELLING",
    title: "Top Selling",
    meaning: "Top Selling projects section.",
    mainPlacement: "featured",
    sponsoredEnabled: false,
    icons: [TrendingUp],
    strip: "from-sky-500 to-cyan-300",
    iconWrap: "bg-sky-100 text-sky-600",
    ring: "hover:border-sky-200",
  },
  {
    code: "BUILDER_SPONSORED",
    title: "Sponsored",
    meaning: "Sponsored ad in search results and listing pages.",
    mainPlacement: "none",
    sponsoredEnabled: true,
    icons: [Megaphone],
    strip: "from-violet-500 to-fuchsia-400",
    iconWrap: "bg-violet-100 text-violet-600",
    ring: "hover:border-violet-200",
  },
  {
    code: "BUILDER_PRIME_SPONSORED",
    title: "Prime + Sponsored",
    meaning: "Prime section and the Sponsored ad, same dates.",
    mainPlacement: "prime",
    sponsoredEnabled: true,
    icons: [Crown, Megaphone],
    strip: "from-amber-400 to-violet-500",
    iconWrap: "bg-gradient-to-br from-amber-100 to-violet-100 text-violet-700",
    ring: "hover:border-violet-200",
  },
  {
    code: "BUILDER_TOP_SELLING_SPONSORED",
    title: "Top Selling + Sponsored",
    meaning: "Top Selling section and the Sponsored ad, same dates.",
    mainPlacement: "featured",
    sponsoredEnabled: true,
    icons: [TrendingUp, Megaphone],
    strip: "from-sky-500 to-violet-500",
    iconWrap: "bg-gradient-to-br from-sky-100 to-violet-100 text-violet-700",
    ring: "hover:border-violet-200",
  },
];

export const FIXED_PLAN_CODES = new Set(FIXED_PLAN_PRESETS.map((preset) => preset.code));
