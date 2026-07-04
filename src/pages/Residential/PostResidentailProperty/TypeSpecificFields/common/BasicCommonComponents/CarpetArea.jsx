// CarpetArea.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { Info } from "lucide-react";

const CarpetArea = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Carpet Area
        </p>

        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-pointer" />

          <div className="absolute left-5 top-0 hidden group-hover:block w-72 p-3 rounded-xl bg-gray-800 text-white text-xs leading-5 shadow-xl z-50">
            <p className="font-semibold mb-1">What is Carpet Area?</p>

            <p>Actual usable area inside the property.</p>
          </div>
        </div>
      </div>
      <div
        className={`flex w-full border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}
      >
        <input
          type="number"
          placeholder="0"
          value={form.carpetArea || ""}
          onChange={(e) => updateFieldValue("carpetArea", e.target.value)}
          className="min-w-0 flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex min-w-14 shrink-0 items-center justify-center border-l border-[#e5e7eb] bg-[#f9fafb] px-2 text-xs font-bold whitespace-nowrap text-[#9ca3af]">
          sq.ft
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default CarpetArea;
