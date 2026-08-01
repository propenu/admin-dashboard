import { ACCOUNT_STATUS_MAP } from "../constants/accountStatusMap";
import { AVATAR_COLORS } from "../constants/avatarColors";
import { KYC_STATUS_MAP } from "../constants/kycStatusMap";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";

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
  const className = `flex h-full w-full items-center gap-2.5 rounded-2xl border bg-gradient-to-br from-white to-[#f3faf6] px-3 py-2.5 text-left shadow-sm transition duration-150 ${
    active || emphasize
      ? "border-[#12A150]/50 ring-1 ring-[#12A150]/10"
      : "border-[#dceee3]"
  } ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#12A150]/40 hover:shadow-md" : ""}`;

  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#12A150]/10 text-[#12A150]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-xl font-bold tabular-nums leading-none tracking-tight ${
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

export const FilterSelect = ({ value, onChange, options, placeholder, id, label }) => (
  <div className="relative min-w-0 flex-1 basis-[140px] sm:max-w-[160px] sm:flex-none">
    {label ? (
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
    ) : null}
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label || placeholder}
      className="h-10 w-full appearance-none rounded-xl border border-[#dceee3] bg-white py-2 pl-3 pr-8 text-sm text-[#102033] transition focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
  </div>
);
