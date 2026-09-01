import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const toIso = (date) => format(date, "yyyy-MM-dd");

const parseBound = (value) => {
  if (!value) return null;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
};

/**
 * Colorful animated date field — emerald calendar popup (not native picker).
 */
export default function TeamDatePicker({
  label,
  value = "",
  min,
  max,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = value ? parseBound(value) : null;
  const minDate = parseBound(min);
  const maxDate = parseBound(max);
  const [view, setView] = useState(() => selected || new Date());

  useEffect(() => {
    if (open) setView(selected || new Date());
  }, [open, selected]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(view), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [view]);

  const isDisabled = (day) => {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  };

  const display = selected ? format(selected, "dd-MM-yyyy") : "dd-mm-yyyy";
  const filled = Boolean(selected);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white py-1.5 pl-2.5 pr-2 text-left transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
          open || filled
            ? "border-[#12A150] shadow-sm shadow-emerald-600/10"
            : "border-[#d9ebe0] hover:border-[#12A150]/50 hover:shadow-sm"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition duration-200 ${
            open || filled
              ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/30"
              : "bg-[#EAF8F0] text-[#12A150]"
          }`}
        >
          <CalendarDays size={14} strokeWidth={2.25} aria-hidden />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${
            filled ? "text-[#101820]" : "text-slate-400"
          }`}
        >
          {display}
        </span>
        {filled ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onChange?.("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onChange?.("");
              }
            }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-[#EAF8F0] hover:text-[#12A150]"
            aria-label={`Clear ${label}`}
            title="Clear date"
          >
            <X size={13} strokeWidth={2.5} />
          </span>
        ) : (
          <ChevronDown
            size={15}
            className={`shrink-0 text-slate-400 transition-transform duration-300 ${
              open ? "rotate-180 text-[#12A150]" : ""
            }`}
          />
        )}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-2xl border border-[#d9ebe0] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.16)] motion-safe:animate-[tlFadeUp_180ms_ease-out]"
        >
          <div className="bg-gradient-to-br from-[#12A150] to-[#0B7A3A] px-3 py-3 text-white">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setView((current) => subMonths(current, 1))}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 transition hover:bg-white/25"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <p className="text-sm font-black tracking-tight">
                {format(view, "MMMM yyyy")}
              </p>
              <button
                type="button"
                onClick={() => setView((current) => addMonths(current, 1))}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 transition hover:bg-white/25"
                aria-label="Next month"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
            <p className="mt-1 text-center text-[11px] font-semibold text-emerald-100">
              {selected ? format(selected, "EEE, d MMM yyyy") : "Pick a date"}
            </p>
          </div>

          <div className="p-2.5">
            <div className="mb-1.5 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-[#12A150]"
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day) => {
                const inMonth = isSameMonth(day, view);
                const active = selected && isSameDay(day, selected);
                const today = isToday(day);
                const disabled = isDisabled(day);
                return (
                  <button
                    key={toIso(day)}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange?.(toIso(day));
                      setOpen(false);
                    }}
                    className={`relative grid aspect-square place-items-center rounded-xl text-[12px] font-bold transition duration-150 ${
                      active
                        ? "bg-[#12A150] text-white shadow-md shadow-emerald-600/35 scale-105"
                        : today && inMonth
                          ? "bg-[#EAF8F0] text-[#0B7A3A] ring-1 ring-[#12A150]/35"
                          : inMonth
                            ? "text-slate-800 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
                            : "text-slate-300 hover:bg-slate-50"
                    } ${disabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[#e8f2ec] bg-[#F6FBF8] px-2.5 py-2">
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-slate-500 transition hover:bg-white hover:text-[#0B7A3A]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                if (isDisabled(today)) return;
                onChange?.(toIso(today));
                setOpen(false);
              }}
              className="rounded-lg bg-[#12A150] px-3 py-1.5 text-[12px] font-bold text-white shadow-sm shadow-emerald-600/25 transition hover:bg-[#0B7A3A]"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
