import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

/**
 * Themed filter dropdown — green selected state, rounded menu (not native select).
 */
export default function ActivityFilterSelect({
  label,
  value,
  onChange,
  options = [],
  icon: Icon,
  className = "",
  showLabel = false,
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selected = options.find((item) => item.value === value) || options[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((item) =>
      String(item.label || "")
        .toLowerCase()
        .includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      {showLabel ? (
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white py-2 pl-3 pr-2.5 text-left text-[13px] font-semibold text-[#101820] transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
          open
            ? "border-[#12A150] shadow-md shadow-emerald-600/15"
            : "border-[#d9ebe0] hover:border-[#12A150]/50 hover:shadow-sm"
        }`}
      >
        {Icon ? (
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition duration-200 ${
              open || value
                ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/30"
                : "bg-[#EAF8F0] text-[#12A150]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{selected?.label || label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-[#12A150]" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-[#d9ebe0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] motion-safe:animate-[tlFadeUp_180ms_ease-out]">
          {searchable ? (
            <div className="border-b border-[#e8f2ec] bg-[#F6FBF8] p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#12A150]"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  className="h-9 w-full rounded-lg border border-[#d9ebe0] bg-white py-1.5 pl-8 pr-2.5 text-[12px] font-semibold text-[#101820] outline-none placeholder:text-slate-400 focus:border-[#12A150] focus:ring-2 focus:ring-[#12A150]/15"
                />
              </div>
            </div>
          ) : null}
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-56 overflow-auto p-1.5"
          >
            {filtered.length ? (
              filtered.map((item) => {
                const active = item.value === value;
                return (
                  <li
                    key={`${item.value}-${item.label}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange?.(item.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-[13px] font-semibold transition duration-150 ${
                        active
                          ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/25"
                          : "text-slate-700 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate capitalize">
                        {item.label}
                      </span>
                      {active ? (
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
                No matches
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
