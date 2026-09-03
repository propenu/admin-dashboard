import { useEffect, useRef, useState, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Facing Direction style — green open border, light-green selected row + green dot.
 */
const ColorfulSelect = forwardRef(function ColorfulSelect(
  {
    label,
    value,
    options = [],
    onChange,
    placeholder = "Select",
    error,
    disabled = false,
    className = "",
    maxHeightClass = "max-h-64",
    labelClassName = "text-xs font-bold text-[#374151] uppercase tracking-wide",
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalized = options.map((opt) =>
    typeof opt === "string"
      ? { label: opt, value: opt }
      : { label: opt.label, value: opt.value },
  );

  const selectedLabel =
    normalized.find((o) => String(o.value) === String(value ?? ""))?.label ||
    "";

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      className={`relative space-y-2 self-start ${open ? "z-[80]" : "z-10"} ${className}`}
      ref={(node) => {
        dropdownRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
    >
      {label ? <p className={labelClassName}>{label}</p> : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={`relative w-full cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-left text-sm font-semibold transition-all duration-150 ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        } ${
          error
            ? "border-red-300"
            : open
              ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
              : "border-[#e5e7eb] hover:border-[#bbf7d0]"
        } ${selectedLabel ? "text-[#111827]" : "text-[#9ca3af]"}`}
      >
        {selectedLabel || placeholder}
        <ChevronDown
          size={15}
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${
            open ? "rotate-180 text-[#27AE60]" : ""
          }`}
        />
      </button>

      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : null}

      {open ? (
        <div
          className={`absolute left-0 top-full z-[90] mt-2 w-full overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-xl ${maxHeightClass}`}
          role="listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {normalized.map((opt) => {
            const isSelected = String(value ?? "") === String(opt.value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between border-b border-[#f5f5f5] px-4 py-3 text-left text-sm transition-colors last:border-none hover:bg-[#f0fdf4] ${
                  isSelected
                    ? "bg-[#f0fdf4] font-bold text-[#27AE60]"
                    : "font-normal text-[#374151]"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected ? (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#27AE60]" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});

export default ColorfulSelect;
