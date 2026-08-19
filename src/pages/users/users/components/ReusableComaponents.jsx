import { ACCOUNT_STATUS_MAP } from "../constants/accountStatusMap";
import { AVATAR_COLORS } from "../constants/avatarColors";
import { KYC_STATUS_MAP } from "../constants/kycStatusMap";
import { roleLabel } from "../constants/roleLabels";
import { CheckCircle2, Check, ChevronDown, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export const RoleBadge = ({ role }) => (
  <span className="inline-flex h-6 min-w-[6.75rem] items-center justify-center whitespace-nowrap rounded-full border border-[#12A150]/25 bg-[#12A150]/10 px-2.5 text-[11px] font-bold uppercase tracking-wide text-[#12A150]">
    {roleLabel(role)}
  </span>
);

export const Avatar = ({ name, imageUrl }) => {
  const firstChar = name?.charAt(0) || "A";
  const idx = firstChar.charCodeAt(0) % AVATAR_COLORS.length;
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx]} text-xs font-bold text-white shadow-sm`}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
};

export const AccountBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  const s = ACCOUNT_STATUS_MAP[key] || {
    label: status || "—",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const KycBadge = ({ kyc }) => {
  const status = String(kyc?.status || "not_started").toLowerCase();
  const mapped =
    status === "not_started"
      ? "pending"
      : status in KYC_STATUS_MAP
        ? status
        : "not_started";
  const k = KYC_STATUS_MAP[mapped] || KYC_STATUS_MAP.not_started;
  const Icon = k.icon;

  return (
    <span
      title={kyc?.remarks || ""}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${k.bg} ${k.text} ${k.border}`}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
      {k.label}
    </span>
  );
};

export const PhoneBadge = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#12A150]/25 bg-[#12A150]/10 px-2 py-0.5 text-[11px] font-semibold text-[#12A150]">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
      <XCircle className="h-3 w-3" aria-hidden />
      Not Verified
    </span>
  );

export const StatCard = ({
  label,
  value,
  icon,
  onClick,
  active = false,
  highlightValue = false,
  emphasize = false,
}) => {
  const className = `flex h-full w-full min-w-0 items-center gap-2 rounded-2xl border bg-gradient-to-br from-white to-[#f3faf6] px-2.5 py-2.5 text-left shadow-sm transition duration-150 ${
    active || emphasize
      ? "border-[#12A150]/50 ring-1 ring-[#12A150]/10"
      : "border-[#dceee3]"
  } ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#12A150]/40 hover:shadow-md" : ""}`;

  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#12A150]/10 text-[#12A150]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[8px] font-semibold uppercase tracking-[0.06em] text-slate-400 sm:text-[9px]">
          {label}
        </p>
        <p
          className={`mt-0.5 text-lg font-bold tabular-nums leading-none tracking-tight sm:text-xl ${
            highlightValue ? "text-[#12A150]" : "text-[#102033]"
          }`}
        >
          {value}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-pressed={active}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};

const OPTION_TONES = [
  {
    match: /^(active|verified|true)$/i,
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-50",
    active: "bg-emerald-100 text-emerald-800",
  },
  {
    match: /^(pending|location_pending|kyc_pending)$/i,
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    row: "hover:bg-amber-50",
    active: "bg-amber-100 text-amber-800",
  },
  {
    match: /^(false|inactive|rejected|not_started|blocked|suspended)$/i,
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    row: "hover:bg-rose-50",
    active: "bg-rose-100 text-rose-800",
  },
];

const ROLE_TONES = [
  {
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-50",
    active: "bg-emerald-100 text-emerald-800",
  },
  {
    chip: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    row: "hover:bg-sky-50",
    active: "bg-sky-100 text-sky-800",
  },
  {
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    row: "hover:bg-violet-50",
    active: "bg-violet-100 text-violet-800",
  },
  {
    chip: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    row: "hover:bg-teal-50",
    active: "bg-teal-100 text-teal-800",
  },
  {
    chip: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    row: "hover:bg-orange-50",
    active: "bg-orange-100 text-orange-800",
  },
  {
    chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    dot: "bg-fuchsia-500",
    row: "hover:bg-fuchsia-50",
    active: "bg-fuchsia-100 text-fuchsia-800",
  },
];

const DEFAULT_TONE = {
  chip: "bg-slate-50 text-slate-600 border-slate-200",
  dot: "bg-slate-400",
  row: "hover:bg-slate-50",
  active: "bg-[#12A150]/12 text-[#0f8f46]",
};

function toneForOption(value, index) {
  const key = String(value || "");
  const matched = OPTION_TONES.find((t) => t.match.test(key));
  if (matched) return matched;
  if (!key) return DEFAULT_TONE;
  return ROLE_TONES[index % ROLE_TONES.length];
}

export const FilterSelect = ({
  value,
  onChange,
  options,
  placeholder,
  id,
  label,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const triggerId = id || listId;

  const items = useMemo(
    () => [{ value: "", label: placeholder }, ...(options || [])],
    [options, placeholder],
  );

  const selected = items.find((o) => o.value === value) || items[0];
  const selectedTone = toneForOption(
    selected?.value,
    Math.max(0, items.findIndex((o) => o.value === value) - 1),
  );
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full min-w-[150px] max-w-[200px] shrink-0 sm:w-[170px] ${className}`}
    >
      {label ? (
        <label htmlFor={triggerId} className="sr-only">
          {label}
        </label>
      ) : null}

      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label || placeholder}
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex h-10 w-full items-center gap-2 overflow-hidden rounded-xl border py-2 pl-3 pr-8 text-left text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
          open || hasValue
            ? "border-[#12A150]/45 bg-gradient-to-r from-[#f0fdf6] via-white to-[#ecfdf5] text-[#0f8f46] shadow-sm shadow-[#12A150]/10 focus:ring-[#12A150]/20"
            : "border-[#dceee3] bg-white text-[#102033] hover:border-[#12A150]/35 hover:bg-[#f7fbf8] focus:ring-[#12A150]/10"
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full transition-transform duration-300 ${
            open ? "scale-125" : "scale-100"
          } ${hasValue ? selectedTone.dot : "bg-slate-300"}`}
        />
        <span className="truncate">{selected?.label || placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-[#d9ebe0] bg-white/95 p-1.5 shadow-xl shadow-[#12A150]/10 backdrop-blur-sm"
          >
            {items.map((o, index) => {
              const active = o.value === value;
              const tone = toneForOption(o.value, Math.max(0, index - 1));
              return (
                <motion.li
                  key={`${o.value || "all"}-${o.label}`}
                  role="option"
                  aria-selected={active}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.18), duration: 0.16 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm font-semibold transition-all duration-150 last:mb-0 ${
                      active
                        ? `${tone.active} border-transparent shadow-sm`
                        : `border-transparent bg-white text-[#102033] ${tone.row}`
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                    <span
                      className={`min-w-0 flex-1 truncate rounded-md border px-2 py-0.5 text-[12px] ${
                        active || o.value
                          ? tone.chip
                          : "border-transparent bg-transparent text-slate-500"
                      }`}
                    >
                      {o.label}
                    </span>
                    {active ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#12A150]" />
                    ) : null}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
