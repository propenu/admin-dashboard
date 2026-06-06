// PossessionDate.jsx
import { forwardRef, useMemo } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PossessionDate = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div ref={ref} className="space-y-2">
      <label
        htmlFor="possessionDate"
        className="block text-xs font-bold text-[#374151] uppercase tracking-wide"
      >
        Possession Date
      </label>
      <input
        id="possessionDate"
        type="date"
        min={today}
        value={form.possessionDate || ""}
        onChange={(e) => updateFieldValue("possessionDate", e.target.value)}
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold cursor-pointer transition-all ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 hover:border-[#bbf7d0]"
        } text-[#111827]`}
      />
      {error && (
        <p className="text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

PossessionDate.displayName = "PossessionDate";

export default PossessionDate;