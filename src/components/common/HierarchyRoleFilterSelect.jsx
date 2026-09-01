import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, ShieldCheck } from "lucide-react";

const DEPTH_STYLE = [
  {
    rail: "bg-[#12A150]",
    soft: "bg-white",
    chip: "bg-[#EAF8F0] text-[#0B7A3A]",
    connector: "text-[#12A150]",
  },
  {
    rail: "bg-emerald-400",
    soft: "bg-emerald-50/50",
    chip: "bg-emerald-100 text-emerald-800",
    connector: "text-emerald-500",
  },
  {
    rail: "bg-teal-400",
    soft: "bg-teal-50/60",
    chip: "bg-teal-100 text-teal-800",
    connector: "text-teal-500",
  },
  {
    rail: "bg-sky-400",
    soft: "bg-sky-50/70",
    chip: "bg-sky-100 text-sky-800",
    connector: "text-sky-500",
  },
  {
    rail: "bg-amber-400",
    soft: "bg-amber-50/70",
    chip: "bg-amber-100 text-amber-800",
    connector: "text-amber-500",
  },
];

const depthStyle = (depth = 0) =>
  DEPTH_STYLE[Math.min(Math.max(depth, 0), DEPTH_STYLE.length - 1)];

/**
 * Colorful hierarchy role dropdown with search + tree depth colors.
 */
export default function HierarchyRoleFilterSelect({
  label = "Filter by role",
  value = "",
  onChange,
  roles = [],
  getLabel = (role) => role?.label || role?.name || "Role",
  getValue = (role) => role?.name,
  getMeta = (role) => {
    const n = Number(role?.userCount) || 0;
    if (!n) return "No users";
    return `${n} ${n === 1 ? "user" : "users"}`;
  },
  showMeta = true,
  hideAllOption = false,
  allLabel = "All dashboard roles",
  emptyHint = "Roles in hierarchy",
  headerNote = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const minDepth = useMemo(
    () =>
      roles.reduce(
        (min, role) => Math.min(min, Number(role.hierarchyDepth) || 0),
        Number.POSITIVE_INFINITY,
      ),
    [roles],
  );
  const baseDepth = Number.isFinite(minDepth) ? minDepth : 0;

  const selected = useMemo(
    () =>
      roles.find((role) => String(getValue(role)) === String(value)) || null,
    [getValue, roles, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) => {
      const name = String(role.name || "").toLowerCase();
      const labelText = String(getLabel(role) || "").toLowerCase();
      return name.includes(q) || labelText.includes(q);
    });
  }, [getLabel, query, roles]);

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
    <div ref={rootRef} className={`relative z-30 min-w-0 ${className}`}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white py-2 pl-3 pr-2.5 text-left text-[13px] font-semibold transition duration-200 outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
          open || value
            ? "border-[#12A150] shadow-md shadow-emerald-600/15 text-[#101820]"
            : "border-[#d9ebe0] hover:border-[#12A150]/50 hover:shadow-sm text-[#101820]"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition duration-200 ${
            open || value
              ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/30"
              : "bg-[#EAF8F0] text-[#12A150]"
          }`}
        >
          <ShieldCheck size={14} strokeWidth={2.25} />
        </span>
        <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-slate-400"}`}>
          {selected ? getLabel(selected) : allLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-[#12A150]" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#d9ebe0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] motion-safe:animate-[tlFadeUp_180ms_ease-out] sm:min-w-[340px]">
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
                placeholder={`Search ${label.toLowerCase()}…`}
                className="h-9 w-full rounded-lg border border-[#d9ebe0] bg-white py-1.5 pl-8 pr-2.5 text-[12px] font-semibold text-[#101820] outline-none placeholder:text-slate-400 focus:border-[#12A150] focus:ring-2 focus:ring-[#12A150]/15"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {emptyHint}
            </div>
            {headerNote ? (
              <p className="px-3 pb-2 text-[11px] leading-4 text-slate-400">{headerNote}</p>
            ) : null}

            {!hideAllOption && !query.trim() ? (
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                }}
                className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition duration-150 ${
                  !value
                    ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/25"
                    : "text-slate-700 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
                }`}
              >
                <span className="min-w-0 flex-1">{allLabel}</span>
                {!value ? <Check size={15} className="text-white" /> : null}
              </button>
            ) : null}

            {filtered.length ? (
              filtered.map((role) => {
                const roleValue = String(getValue(role) ?? "");
                const depth = Math.max(
                  0,
                  (Number(role.hierarchyDepth) || 0) - baseDepth,
                );
                const style = depthStyle(depth);
                const active = String(value) === roleValue;
                const isRoot = depth === 0;
                const searching = Boolean(query.trim());

                return (
                  <button
                    key={role._id || role.name || roleValue}
                    type="button"
                    onClick={() => {
                      onChange?.(roleValue);
                      setOpen(false);
                    }}
                    className={`group relative mb-0.5 flex w-full items-center gap-2 overflow-hidden rounded-xl py-2.5 pr-3 text-left text-sm font-semibold transition duration-150 ${
                      active
                        ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/25"
                        : `${style.soft} text-slate-700 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]`
                    }`}
                    style={{ paddingLeft: searching ? 12 : 10 + depth * 14 }}
                  >
                    {!searching ? (
                      <span
                        className={`absolute inset-y-1 left-1 w-1 rounded-full ${
                          active ? "bg-white/70" : style.rail
                        }`}
                        aria-hidden
                      />
                    ) : null}

                    {!searching && depth > 0 ? (
                      <span
                        className={`shrink-0 text-[11px] font-black ${
                          active ? "text-white/70" : style.connector
                        }`}
                      >
                        └
                      </span>
                    ) : (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          active
                            ? "bg-white"
                            : isRoot
                              ? "bg-[#12A150]"
                              : style.rail
                        }`}
                      />
                    )}

                    <span
                      className={`min-w-0 flex-1 truncate ${
                        isRoot && !active ? "font-bold text-slate-900" : ""
                      }`}
                    >
                      {getLabel(role)}
                    </span>

                    {showMeta ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active ? "bg-white/20 text-white" : style.chip
                        }`}
                      >
                        {getMeta(role)}
                      </span>
                    ) : null}

                    {active ? (
                      <Check size={15} className="shrink-0 text-white" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
                No matching roles
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
