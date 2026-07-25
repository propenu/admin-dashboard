import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Heart, Share2, Star } from "lucide-react";
import { formatRelativeClock } from "../contentTeamDashboardData";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

export default function CtEngagementPanel({ categoryRows = [], topPosts = [] }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Engagement & categories</h3>
        <p className="text-[10px] text-slate-500">What readers consume and which posts win</p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2">
        <div className="min-h-[150px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Views by category
          </p>
          {categoryRows.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={categoryRows.slice(0, 6)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {categoryRows.slice(0, 6).map((row, i) => (
                    <Cell key={row.key} fill={i === 0 ? "#10b981" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No category data.</p>
          )}
        </div>

        <div className="min-h-0">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Top performing posts
          </p>
          {!topPosts.length ? (
            <p className="py-10 text-center text-xs text-slate-400">Publish content to see rankings.</p>
          ) : (
            <ul className="space-y-1.5">
              {topPosts.slice(0, 5).map((post, index) => (
                <li
                  key={post.id}
                  className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white text-[10px] font-black text-emerald-700 shadow-sm">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">
                      {post.featured && <Star className="mr-1 inline h-3 w-3 text-amber-500" />}
                      {post.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                      <span>{post.category}</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Share2 className="h-3 w-3" />
                        {post.shares}
                      </span>
                      {post.publishedAt && (
                        <span>{formatRelativeClock(post.publishedAt)}</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
