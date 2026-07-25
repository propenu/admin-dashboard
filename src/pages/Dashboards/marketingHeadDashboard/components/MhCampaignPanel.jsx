import { ExternalLink } from "lucide-react";
import { titleCase } from "../marketingHeadDashboardData";

const statusTone = (status = "") => {
  const key = String(status).toLowerCase();
  if (["active", "running"].includes(key)) return "bg-emerald-50 text-emerald-700";
  if (["scheduled", "draft"].includes(key)) return "bg-amber-50 text-amber-700";
  if (["paused", "failed"].includes(key)) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

export default function MhCampaignPanel({ campaigns = [], onOpenEmail, onOpenWhatsapp }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Campaign performance</h3>
          <p className="text-[10px] text-slate-500">Email & WhatsApp outreach efficiency</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onOpenEmail}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Email <ExternalLink className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onOpenWhatsapp}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            WhatsApp <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {!campaigns.length ? (
          <p className="px-3 py-10 text-center text-xs text-slate-400">
            No campaign activity yet. Create an email or WhatsApp campaign to populate this table.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-[11px]">
            <thead className="sticky top-0 bg-emerald-50/90 text-[10px] uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                <th className="px-3 py-2 font-bold">Campaign</th>
                <th className="px-3 py-2 font-bold">Channel</th>
                <th className="px-3 py-2 font-bold">Status</th>
                <th className="px-3 py-2 font-bold tabular-nums">Sent</th>
                <th className="px-3 py-2 font-bold tabular-nums">Open %</th>
                <th className="px-3 py-2 font-bold tabular-nums">Click %</th>
                <th className="px-3 py-2 font-bold tabular-nums">Leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/40">
                  <td className="max-w-[220px] truncate px-3 py-2.5 font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{row.channel}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone(row.status)}`}>
                      {titleCase(row.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.sent}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">
                    {row.openRate == null ? "—" : `${row.openRate}%`}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">
                    {row.clickRate == null ? "—" : `${row.clickRate}%`}
                  </td>
                  <td className="px-3 py-2.5 font-black tabular-nums text-slate-900">{row.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
