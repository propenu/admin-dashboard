import { useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  ClipboardList,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { formatClockTime } from "../customerCareDashboardData";
import { followUpTrackHref } from "../../superAdminDashboard/superAdminDashboardData";

const CHIP_TONES = {
  slate: { chip: "bg-slate-50 text-slate-700 border-slate-200", label: "text-slate-600" },
  emerald: { chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "text-emerald-700" },
  amber: { chip: "bg-amber-50 text-amber-700 border-amber-200", label: "text-amber-700" },
  blue: { chip: "bg-blue-50 text-blue-700 border-blue-200", label: "text-blue-700" },
};

const CountChip = ({ label, value, tone = "slate", onClick, active = false }) => {
  const style = CHIP_TONES[tone] || CHIP_TONES.slate;
  const className = `rounded-[11px] border px-2 py-2.5 text-center transition ${style.chip} ${
    onClick ? "cursor-pointer hover:shadow-sm hover:brightness-[0.98]" : ""
  } ${active ? "ring-2 ring-emerald-300" : ""}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-pressed={active}>
        <p className={`text-[10px] font-bold uppercase tracking-wide ${style.label}`}>{label}</p>
        <p className="mt-1 text-[22px] font-black leading-none">{String(value ?? 0).padStart(2, "0")}</p>
      </button>
    );
  }

  return (
    <div className={className}>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${style.label}`}>{label}</p>
      <p className="mt-1 text-[22px] font-black leading-none">{String(value ?? 0).padStart(2, "0")}</p>
    </div>
  );
};

const InventorySection = ({ title, icon: Icon, counts, periodHint = "Period", onCountClick }) => (
  <section className="border-b border-slate-100 last:border-b-0">
    <header className="flex items-center justify-between gap-2.5 px-3.5 pb-2 pt-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-[18px] w-[18px] text-emerald-600" />
        <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
      </div>
      <span className="max-w-[45%] truncate text-[10px] font-semibold text-slate-400" title={periodHint}>
        {periodHint}
      </span>
    </header>
    <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5">
      <CountChip label="Created" value={counts.created} tone="slate" onClick={() => onCountClick?.(title, "created")} />
      <CountChip label="Onboarding" value={counts.onboarding} tone="amber" onClick={() => onCountClick?.(title, "onboarding")} />
      <CountChip label="Active" value={counts.active} tone="emerald" onClick={() => onCountClick?.(title, "active")} />
      <CountChip label="Pending" value={counts.pending} tone="blue" onClick={() => onCountClick?.(title, "pending")} />
    </div>
  </section>
);

const toneDot = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
};

const FOLLOW_UP_TRACK_BY_METRIC = {
  Projects: {
    created: "project_draft",
    onboarding: "project_draft",
    active: "project_active",
    pending: "project_pending",
  },
  Properties: {
    created: "property_draft",
    onboarding: "property_draft",
    active: "property_active",
    pending: "property_pending",
  },
};

export default function CustomerCareStatusPanel({
  loginAttemptRows = [],
  projectCounts = {},
  propertyCounts = {},
  todayInteractions = [],
  assignmentNotifications = [],
  leadRows = [],
  onNavigate,
  onOpenTicket,
  rangeLabel = "selected period",
  rangeFrom = "",
  rangeTo = "",
  rangePreset = "today",
}) {
  const [expandedId, setExpandedId] = useState(null);
  const fuRange = {
    from: rangeFrom,
    to: rangeTo,
    preset: rangePreset,
  };
  const followUpHome = followUpTrackHref("onboarding_all", fuRange);

  const toggleInteraction = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleCountClick = (kind, metric) => {
    const track = FOLLOW_UP_TRACK_BY_METRIC[kind]?.[metric];
    if (track) {
      onNavigate?.(followUpTrackHref(track, fuRange));
      return;
    }
    onNavigate?.(followUpHome);
  };

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Period status</h2>
          </div>
          <p className="mt-0.5 truncate pl-7 text-[10px] text-slate-400">{rangeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.(followUpHome)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Progress Queue
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#86efac_transparent] [scrollbar-width:thin]">
        <section className="border-b border-slate-100">
          <header className="flex items-center justify-between gap-2.5 px-3.5 pb-2 pt-3">
            <div className="flex items-center gap-2.5">
              <Bell className="h-[18px] w-[18px] text-emerald-600" />
              <h3 className="text-[13px] font-bold text-slate-900">New assignments</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {assignmentNotifications.length}
            </span>
          </header>
          <p className="px-3.5 pb-2 text-[10px] leading-relaxed text-slate-500">
            Tickets auto-assigned to you by location match (or round-robin). Open one to work it in My Ticket Queue.
          </p>
          {assignmentNotifications.length ? (
            <div className="flex flex-col gap-2 px-3.5 pb-3.5">
              {assignmentNotifications.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenTicket?.(item.id)}
                  className="rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-bold text-slate-900">{item.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        item.tone === "emerald"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.methodLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {item.ticketCode} · {item.requester}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-600">
                    {item.locationLabel}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-5 text-center text-xs text-slate-400">
              No new assignments in {rangeLabel}
            </p>
          )}
        </section>

        <section className="border-b border-slate-100">
          <header className="flex items-center justify-between gap-2.5 px-3.5 pb-2 pt-3">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="h-[18px] w-[18px] text-emerald-600" />
              <h3 className="text-[13px] font-bold text-slate-900">Client Progress Queue</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.(followUpHome)}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Open all
            </button>
          </header>
          <div className="grid grid-cols-2 gap-2 px-3.5 pb-3">
            {[
              { label: "Onboarding users", track: "onboarding_all" },
              { label: "Property pending", track: "property_pending" },
              { label: "Project pending", track: "project_pending" },
              { label: "Stuck · location", track: "stuck_location" },
            ].map((item) => (
              <button
                key={item.track}
                type="button"
                onClick={() => onNavigate?.(followUpTrackHref(item.track, fuRange))}
                className="rounded-[11px] border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </button>
            ))}
          </div>
          {leadRows.length ? (
            <div className="flex flex-col gap-2 px-3.5 pb-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Leads needing follow-up</p>
              {leadRows.slice(0, 4).map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => onNavigate?.("/leads")}
                  className="rounded-[11px] border border-slate-200 bg-white px-3 py-2 text-left hover:border-emerald-300"
                >
                  <p className="truncate text-xs font-bold text-slate-900">{lead.project || lead.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {lead.name} · {lead.status}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="border-b border-slate-100">
          <header className="flex items-center justify-between gap-2.5 px-3.5 pb-2 pt-3">
            <h3 className="text-[13px] font-bold text-slate-900">Recent Login Attempts</h3>
            <button
              type="button"
              onClick={() => onNavigate?.(followUpTrackHref("login_today", fuRange))}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
            >
              View today
            </button>
          </header>
          {loginAttemptRows.length ? (
            loginAttemptRows.slice(0, 5).map((row) => (
              <article key={row.id} className="flex items-center gap-3 border-t border-slate-100 px-3.5 py-2.5 first:border-t-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <UserRound className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{row.name}</p>
                  <p className="truncate text-xs text-slate-500">{row.email || row.role}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-700">{formatClockTime(row.lastLoginAt)}</p>
                  <p className="text-[11px] font-bold text-emerald-600">Successful</p>
                </div>
              </article>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              No logins in {rangeLabel}
            </p>
          )}
        </section>

        <InventorySection
          title="Projects"
          icon={Building2}
          counts={projectCounts}
          periodHint={rangeLabel}
          onCountClick={handleCountClick}
        />
        <InventorySection
          title="Properties"
          icon={Home}
          counts={propertyCounts}
          periodHint={rangeLabel}
          onCountClick={handleCountClick}
        />

        <section className="border-b border-slate-100 last:border-b-0">
          <header className="flex items-center justify-between gap-2.5 px-3.5 pb-2 pt-3">
            <div className="flex items-center gap-2.5">
              <Bell className="h-[18px] w-[18px] text-emerald-600" />
              <h3 className="text-[13px] font-bold text-slate-900">Interactions</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {todayInteractions.length}
            </span>
          </header>
          <div className="flex flex-col gap-2 px-3.5 pb-3.5">
            {todayInteractions.length ? (
              todayInteractions.slice(0, 10).map((item) => {
                const open = expandedId === item.id;
                return (
                  <article
                    key={item.id}
                    className={`overflow-hidden rounded-[11px] border ${
                      open ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleInteraction(item.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left"
                    >
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[item.tone] || toneDot.slate}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                          <span className="shrink-0 text-xs text-slate-400">{formatClockTime(item.time)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.summary}</p>
                      </div>
                      <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="border-t border-slate-100 bg-white px-4 py-3">
                        <ul className="space-y-1.5">
                          {(item.details || []).map((line, index) => (
                            <li key={index} className="text-xs leading-relaxed text-slate-600">
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="py-4 text-center text-xs text-slate-400">
                No interactions in {rangeLabel}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
