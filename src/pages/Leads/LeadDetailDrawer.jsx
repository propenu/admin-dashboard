import { Link } from "react-router-dom";
import {
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  X,
  Route,
  Layers,
  Clock3,
  Copy,
} from "lucide-react";

const label = (value) =>
  value
    ? String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "—";

const tone = {
  featured: "bg-violet-50 text-violet-700",
  residential: "bg-blue-50 text-blue-700",
  commercial: "bg-amber-50 text-amber-700",
  land: "bg-emerald-50 text-emerald-700",
  agricultural: "bg-lime-50 text-lime-700",
};

const promotionLabel = (type) => {
  const key = String(type || "normal").trim().toLowerCase();
  if (key === "featured" || key === "top_selling" || key === "topselling") {
    return "Top Selling";
  }
  if (key === "prime") return "Prime";
  if (key === "sponsored") return "Sponsored";
  if (key === "normal") return "Normal";
  return label(key);
};

const promotionTone = {
  "Top Selling": "bg-rose-50 text-rose-700",
  Prime: "bg-amber-50 text-amber-800",
  Sponsored: "bg-indigo-50 text-indigo-700",
  Normal: "bg-slate-100 text-slate-600",
};

const categoryBadge = (project = {}) => {
  if (String(project.category || "").toLowerCase() === "featured") {
    const text = promotionLabel(project.promotionType);
    return { text, className: promotionTone[text] || promotionTone.Normal };
  }
  return {
    text: label(project.category),
    className: tone[project.category] || "bg-slate-100 text-slate-600",
  };
};

const statusTone = {
  new_lead: "bg-sky-500 text-white ring-1 ring-sky-400",
  interested: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  follow_up: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  site_visit: "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200",
  sale: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  not_interested: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
};

const formatWhen = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (project) => {
  const from = project?.priceFrom ?? project?.price;
  const to = project?.priceTo;
  if (from == null && to == null) return null;
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  if (from != null && to != null && Number(from) !== Number(to)) {
    return `${fmt(from)} – ${fmt(to)}`;
  }
  return fmt(from ?? to);
};

const assetHref = (project) => {
  if (!project?._id) return null;
  if (project.category === "featured") return `/featured-project/${project._id}`;
  return `/property/${project.category}/${project._id}`;
};

export default function LeadDetailDrawer({ lead, onClose }) {
  if (!lead) return null;

  const project = lead.project || {};
  const origin = lead.origin || {
    channel: label(lead.source),
    entryPoint: label(lead.source),
    path: [label(lead.source), "Lead created"],
    label: label(lead.source),
  };
  const href = assetHref(project);
  const location = [project.locality, project.city, project.state]
    .filter(Boolean)
    .join(", ");
  const priceLabel = formatPrice(project);
  const submissions = Array.isArray(lead.submissions) ? lead.submissions : [];

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close lead details"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Lead tracking
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
              {lead.name || "Unknown lead"}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone[lead.status] || "bg-slate-100 text-slate-600"}`}
              >
                {label(lead.status)}
              </span>
              {(() => {
                const badge = categoryBadge(project);
                return (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
                  >
                    {badge.text}
                  </span>
                );
              })()}
              {lead.submissionCount > 1 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Copy className="h-3 w-3" />
                  {lead.submissionCount} submissions · unique enquiry
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Unique enquiry
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Project / property card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
            <div className="aspect-[16/9] w-full bg-slate-200">
              {project.heroImage ? (
                <img
                  src={project.heroImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Interested in
                  </p>
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {project.title || "Untitled"}
                  </h3>
                </div>
                {String(project.category || "").toLowerCase() === "featured" ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      promotionTone[promotionLabel(project.promotionType)] ||
                      promotionTone.Normal
                    }`}
                  >
                    {promotionLabel(project.promotionType)}
                  </span>
                ) : null}
              </div>
              <p className="flex items-start gap-1.5 text-xs text-slate-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{location || "Location unavailable"}</span>
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                {project.code ? <span>Code · {project.code}</span> : null}
                {project.listingType ? (
                  <span className="capitalize">For {project.listingType}</span>
                ) : null}
                {priceLabel ? (
                  <span className="font-semibold text-emerald-700">{priceLabel}</span>
                ) : null}
              </div>
              {href ? (
                <Link
                  to={href}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Open full{" "}
                  {project.category === "featured" ? "project" : "property"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </section>

          {/* Where lead came from */}
          <section className="rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Route className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Where this lead came from
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">{origin.channel}</p>
            <p className="mt-0.5 text-xs text-slate-500">{origin.entryPoint}</p>
            <ol className="mt-3 flex flex-wrap items-center gap-1.5">
              {(origin.path || []).map((step, index) => (
                <li key={`${step}-${index}`} className="flex items-center gap-1.5">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {step}
                  </span>
                  {index < (origin.path || []).length - 1 ? (
                    <span className="text-slate-300">→</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          {/* Contact + meta */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Lead details
              </p>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p className="inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {lead.phone || "—"}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {lead.email || "—"}
              </p>
              <p className="inline-flex items-start gap-2">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  First touch · {formatWhen(lead.firstTouchAt || lead.createdAt)}
                  <br />
                  Last touch · {formatWhen(lead.lastTouchAt || lead.createdAt)}
                </span>
              </p>
              {lead.message ? (
                <p className="rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600">
                  {lead.message}
                </p>
              ) : null}
              {(lead.purchaseTimeline || lead.budgetRange) && (
                <p className="text-[11px] text-slate-500">
                  {[lead.purchaseTimeline, lead.budgetRange]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </section>

          {/* Merged submissions */}
          {submissions.length > 1 ? (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                Merged submissions ({submissions.length})
              </p>
              <p className="mb-3 text-[11px] text-amber-800/80">
                Same phone/email + same project — duplicates hidden from the
                directory; history kept here.
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {submissions.map((row) => (
                  <li
                    key={String(row._id)}
                    className="rounded-xl border border-amber-100 bg-white px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-800">
                        {formatWhen(row.createdAt)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusTone[row.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {label(row.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      via {label(row.source)}
                      {row.message ? ` · ${row.message}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
