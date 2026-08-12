import { CheckCircle2, CreditCard, ListTodo } from "lucide-react";
import {
  formatShortDate,
  HUB_TODAY_CHECKLIST,
  meetingResultText,
} from "../salesExecutiveHubData";

export default function SeHubRightRail({
  followUps = [],
  propertyCounts = {},
  projectCounts = {},
  subscription,
  onOpenFollowUp,
  onOpenFieldMeetings,
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">Follow-ups due</h3>
            <p className="text-[11px] font-semibold text-amber-700">
              {followUps.length} open
            </p>
          </div>
          <ListTodo className="h-4 w-4 text-amber-600" />
        </div>
        {!followUps.length ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            No follow-ups due. Punch out a meeting to create one.
          </p>
        ) : (
          <ul className="max-h-36 space-y-2 overflow-y-auto">
            {followUps.slice(0, 5).map((m) => (
              <li
                key={m.id || m._id}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
              >
                <p className="truncate text-xs font-bold text-slate-900">
                  {m.client?.name || m.people?.[0]?.name || "Client"}
                </p>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  {meetingResultText(m)} · {formatShortDate(m.nextAction?.dueAt || m.punchOutAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenFieldMeetings}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={onOpenFollowUp}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    Client Progress
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-sm font-black text-slate-900">
          Properties &amp; Projects handled
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-500">For selected client</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50 px-2 py-2.5 text-center">
            <p className="text-lg font-black text-emerald-800">
              {propertyCounts.active || 0}
            </p>
            <p className="text-[10px] font-semibold text-emerald-700">Live</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
            <p className="text-lg font-black text-slate-800">
              {propertyCounts.draft || 0}
            </p>
            <p className="text-[10px] font-semibold text-slate-500">Draft</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-2 py-2.5 text-center">
            <p className="text-lg font-black text-amber-800">
              {(projectCounts.pending || 0) + (projectCounts.draft || 0)}
            </p>
            <p className="text-[10px] font-semibold text-amber-700">Project pending</p>
          </div>
        </div>
      </section>

      <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Subscription</h3>
          <CreditCard className="h-4 w-4 text-emerald-600" />
        </div>
        {subscription ? (
          <>
            <p className="text-base font-black text-slate-950">{subscription.plan}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Status: {subscription.status}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Renews {formatShortDate(subscription.renewsAt)}
            </p>
            <button
              type="button"
              onClick={onOpenFollowUp}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Upsell / Upgrade plan
            </button>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">
            No active subscription on this client.
          </p>
        )}
      </section>

      <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">What SE does today</h3>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <ul className="space-y-2">
          {HUB_TODAY_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
