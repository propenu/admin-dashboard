import { titleCase, formatRelativeClock } from "../contentTeamDashboardData";

const statusTone = {
  draft: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  featured: "bg-violet-50 text-violet-700",
};

export default function CtQueuePanel({ queueRows = [], onOpenBlogs }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Content work queue</h3>
          <p className="text-[10px] text-slate-500">Drafts first, then recently updated posts</p>
        </div>
        <button
          type="button"
          onClick={onOpenBlogs}
          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Open blogs
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {!queueRows.length ? (
          <p className="px-3 py-10 text-center text-xs text-slate-400">
            No posts yet. Create your first blog to populate the queue.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead className="sticky top-0 bg-emerald-50/90 text-[10px] uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                <th className="px-3 py-2 font-bold">Title</th>
                <th className="px-3 py-2 font-bold">Category</th>
                <th className="px-3 py-2 font-bold">Status</th>
                <th className="px-3 py-2 font-bold tabular-nums">Views</th>
                <th className="px-3 py-2 font-bold tabular-nums">Likes</th>
                <th className="px-3 py-2 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueRows.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/40">
                  <td className="max-w-[240px] truncate px-3 py-2.5 font-semibold text-slate-800">
                    {row.title}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{row.category}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone[row.status] || statusTone.draft}`}
                    >
                      {titleCase(row.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.views}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.likes}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {formatRelativeClock(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
