// src/components/common/location/SearchableSelect.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { normalizeComparisonValue } from "./searchableLocationUtils";

const inputCls =
  "w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 text-sm font-medium text-[#111827] " +
  "focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]";

/**
 * Searchable dropdown — same UX as Post Property State / City / Locality.
 * Menu is portaled to document.body so parent overflow:hidden cannot clip it.
 */
export default function SearchableSelect({
  label,
  value,
  placeholder,
  error,
  warning,
  required,
  disabled = false,
  open,
  onToggle,
  onClose,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  loading = false,
  options = [],
  onSelect,
  emptyHint,
  dropdownRef,
  optionKey = (opt, idx) => `${opt.label}-${idx}`,
  renderOption,
}) {
  const triggerWrapRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  const setRefs = (node) => {
    triggerWrapRef.current = node;
    if (typeof dropdownRef === "function") dropdownRef(node);
    else if (dropdownRef) dropdownRef.current = node;
  };

  const close = () => {
    if (typeof onClose === "function") onClose();
    else if (open) onToggle?.();
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    const place = () => {
      const el = triggerWrapRef.current?.querySelector("button");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 4;
      const preferMax = 240;
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const spaceAbove = r.top - gap;
      const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        120,
        Math.min(preferMax, openUp ? spaceAbove - 8 : spaceBelow - 8),
      );

      setMenuStyle({
        position: "fixed",
        left: Math.max(8, r.left),
        width: Math.min(r.width, window.innerWidth - 16),
        zIndex: 9999,
        maxHeight,
        ...(openUp
          ? { bottom: window.innerHeight - r.top + gap }
          : { top: r.bottom + gap }),
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, options.length, loading]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      const t = event.target;
      if (triggerWrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const menu = open && menuStyle
    ? createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        >
          <div className="relative border-b border-gray-100 p-2">
            <input
              autoFocus
              type="text"
              value={searchValue}
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/20"
            />
            {loading && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </span>
            )}
          </div>
          <div
            className="overflow-y-auto py-1"
            style={{ maxHeight: Math.max(80, (menuStyle.maxHeight || 240) - 48) }}
            role="listbox"
          >
            {options.length > 0 ? (
              options.map((opt, idx) => {
                const isSelected =
                  normalizeComparisonValue(value) ===
                  normalizeComparisonValue(opt.label);
                return (
                  <button
                    key={optionKey(opt, idx)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onSelect(opt)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-[#f0fdf4] text-[#27AE60]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {renderOption ? (
                      renderOption(opt)
                    ) : (
                      <span className="min-w-0 flex-1 truncate">
                        {opt.label}
                      </span>
                    )}
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-[#27AE60]" />
                    )}
                  </button>
                );
              })
            ) : !loading ? (
              <p className="px-3 py-3 text-sm text-gray-400">{emptyHint}</p>
            ) : null}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="flex items-center gap-1 text-xs font-semibold text-[#374151]">
          <span>
            {label}
            {required ? " *" : ""}
          </span>
          {warning ? (
            <span
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-black text-amber-600"
              title="Use correct spelling. Prefer pincode autofill when available."
            >
              !
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        ref={setRefs}
        className={`relative w-full ${open ? "z-[60]" : "z-10"}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className={`${inputCls} flex items-center justify-between gap-2 text-left ${
            error ? "border-red-500" : ""
          } ${open ? "border-[#27AE60]" : ""} ${
            disabled ? "cursor-not-allowed opacity-60" : ""
          }`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span
            className={`min-w-0 flex-1 truncate ${
              value ? "text-[#111827]" : "text-[#9ca3af]"
            }`}
          >
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {menu}

      {error ? (
        <p className="text-xs font-medium text-red-500">
          ⚠ Please enter {String(label || "field").toLowerCase()}
        </p>
      ) : null}
    </div>
  );
}
