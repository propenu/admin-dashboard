// src/features/property/components/shared/PromoteModal.jsx
import { useState } from "react";
import { TrendingUp } from "lucide-react";

const TYPES = [
  {
    value: "prime",
    label: "Prime",
    desc: "Highest visibility. Top of all listings.",
    color: "border-yellow-400 bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-400",
  },
  {
    value: "featured",
    label: "Featured",
    desc: "Highlighted in featured sections.",
    color: "border-blue-400 bg-blue-50 text-blue-700",
    dot: "bg-blue-400",
  },
  {
    value: "sponsored",
    label: "Sponsored",
    desc: "Marked as sponsored content.",
    color: "border-purple-400 bg-purple-50 text-purple-700",
    dot: "bg-purple-400",
  },
  {
    value: "normal",
    label: "Normal",
    desc: "Standard listing, no promotion.",
    color: "border-slate-300 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
];

export default function PromoteModal({
  open,
  currentType,
  isLoading,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(null);

  if (!open) return null;

  const available = TYPES.filter((t) => t.value !== currentType);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl">
        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5" /> Promote Property
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          Select the new listing type for this property.
        </p>

        <div className="space-y-2 mb-5">
          {available.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left
                ${selected === t.value ? t.color + " border-current" : "border-slate-200 hover:border-slate-300"}`}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${t.dot}`} />
              <div>
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            disabled={!selected || isLoading}
            onClick={() => selected && onConfirm(selected)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Promoting…" : "Promote"}
          </button>
        </div>
      </div>
    </div>
  );
}
