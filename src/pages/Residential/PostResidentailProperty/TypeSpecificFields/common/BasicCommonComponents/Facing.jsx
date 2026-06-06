// Facing.jsx
import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const defaultFacing = [
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "North-East", value: "north-east" },
  { label: "North-West", value: "north-west" },
  { label: "South-East", value: "south-east" },
  { label: "South-West", value: "south-west" },
];


const Facing = forwardRef(({ error, category }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const facingOptions =
    category === "land"
      ? [
          ...defaultFacing,
          { label: "Corner Plot", value: "corner-plot" },
          { label: "Plot", value: "plot" },
        ]
      : defaultFacing;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="space-y-2 relative"
      ref={(node) => {
        dropdownRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
    >
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Facing Direction
      </p>
      <div
        onClick={() => setOpen(!open)}
        className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
          error
            ? "border-red-300"
            : open
              ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
              : "border-[#e5e7eb] hover:border-[#bbf7d0]"
        } ${form.facing ? "text-[#111827]" : "text-[#9ca3af]"}`}
      >
        {facingOptions.find((o) => o.value === form.facing)?.label ||
          "Select direction"}
        <ChevronDown
          size={15}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
          {facingOptions.map((opt) => {
            
            const isSelected = form.facing === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  updateFieldValue("facing", opt.value);
                  setOpen(false);
                }}
                className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
              >
                {opt.label}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#27AE60]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default Facing;