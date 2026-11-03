import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

/** Branded animated picker; the list renders in a portal so a drawer's scroll area can't clip it. */
/**
 * Pass `searchValue` + `onSearchChange` to search on the server instead of filtering `options` locally,
 * and `onLoadMore` + `hasMore` to fetch the next page when the list is scrolled to the bottom.
 */
export default function BrandSelect({
  value, onChange, options, title, size = "md", disabled = false, searchable = false,
  searchValue, onSearchChange, onLoadMore, hasMore = false, loading = false, loadingMore = false, footer,
}) {
  const compact = size === "sm";
  const remoteSearch = typeof onSearchChange === "function";
  const [open, setOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const query = remoteSearch ? searchValue || "" : localQuery;
  const setQuery = remoteSearch ? onSearchChange : setLocalQuery;
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];
  const SelectedIcon = selected.icon;
  const menuHeight = Math.min(options.length * 46 + 44, 292) + (searchable ? 46 : 0) + (footer ? 28 : 0);
  const needle = query.trim().toLowerCase();
  const visibleOptions = needle && !remoteSearch
    ? options.filter((option) => option.value === "" || `${option.label} ${option.hint || ""}`.toLowerCase().includes(needle))
    : options;
  const hasMatches = visibleOptions.some((option) => option.value !== "");

  useEffect(() => {
    if (!open || !buttonRef.current) return undefined;
    const place = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, compact ? 200 : 240);
      const viewport = document.documentElement.clientWidth;
      const fitsRight = rect.left + width <= viewport - 8;
      const left = Math.max(8, fitsRight ? rect.left : Math.min(rect.right, viewport - 8) - width);
      const below = window.innerHeight - rect.bottom;
      const top = below < menuHeight + 8 ? Math.max(8, rect.top - 6 - menuHeight) : rect.bottom + 6;
      setPos({ top, left, width });
    };
    place();
    const close = () => setOpen(false);
    const onScroll = (e) => {
      if (!menuRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, menuHeight, compact]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!remoteSearch) setLocalQuery("");
          setOpen((current) => !current);
        }}
        className={`flex w-full items-center rounded-xl border bg-white text-left text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          compact ? "gap-1.5 px-2 py-1.5 text-[10px]" : "gap-2 px-2.5 py-2 text-[12px]"
        } ${open ? "border-[#27AE60] ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}
      >
        <span className={`grid shrink-0 place-items-center rounded-lg ${compact ? "h-6 w-6" : "h-7 w-7"} ${selected.tone}`}>
          <SelectedIcon size={compact ? 13 : 15} />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{selected.label}</span>
        <ChevronDown size={compact ? 13 : 15} className={`shrink-0 text-[#27AE60] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <>
          <style>{`@keyframes brandMenuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes brandItemIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}`}</style>
          <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="listbox"
            className="fixed overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/15"
            style={{ zIndex: 10001, top: pos.top, left: pos.left, width: pos.width, animation: "brandMenuIn .16s ease-out" }}
          >
            <div className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-emerald-50">{title}</p>
            </div>
            {searchable ? (
              <div className="border-b border-emerald-50 p-1.5">
                <div className="relative">
                  <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#27AE60]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}…`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2.5 text-[11px] text-slate-700 outline-none focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            ) : null}
            <div
              className="max-h-64 space-y-0.5 overflow-y-auto p-1.5"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (onLoadMore && hasMore && !loadingMore && el.scrollHeight - el.scrollTop - el.clientHeight < 48) onLoadMore();
              }}
            >
              {loading ? (
                <p className="px-2 py-3 text-center text-[11px] text-slate-400">Searching…</p>
              ) : searchable && needle && !hasMatches ? (
                <p className="px-2 py-3 text-center text-[11px] text-slate-400">No matches for “{query.trim()}”</p>
              ) : null}
              {visibleOptions.map((option, index) => {
                const Icon = option.icon;
                const active = option.value === selected.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={{ animation: `brandItemIn .18s ease-out ${Math.min(index, 10) * 25}ms both` }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition ${
                      active ? "bg-emerald-50 ring-1 ring-emerald-200" : "hover:bg-emerald-50/60"
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${option.tone}`}>
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[12px] font-semibold ${active ? "text-[#219653]" : "text-slate-800"}`}>{option.label}</span>
                      {option.hint ? <span className="block truncate text-[10px] text-slate-400">{option.hint}</span> : null}
                    </span>
                    {active ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#27AE60] text-white">
                        <Check size={12} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
              {onLoadMore && hasMore && !loading ? (
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={onLoadMore}
                  className="mt-1 w-full rounded-xl border border-dashed border-emerald-200 py-2 text-[11px] font-medium text-[#219653] transition hover:bg-emerald-50 disabled:opacity-60"
                >
                  {loadingMore ? "Loading more…" : "Load more"}
                </button>
              ) : null}
            </div>
            {footer ? (
              <div className="border-t border-emerald-50 bg-emerald-50/40 px-3 py-1.5 text-[10px] text-slate-500">{footer}</div>
            ) : null}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
