import {
  Copy,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { countVars, formatDate } from "../utils/helper";

function bodyPreview(item) {
  const body = item.components?.find((c) => c.type === "BODY");
  return body?.text || "";
}

function varTokens(text = "") {
  const matches = text.match(/\{\{\d+\}\}/g) || [];
  return [...new Set(matches)];
}

/**
 * Compact template card — grid or list, matching Template library mockup.
 */
export function TemplateCard({
  item,
  viewMode = "grid",
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const body = bodyPreview(item);
  const vars = varTokens(body);
  const varCount = countVars(body);
  const category = String(item.category || "UTILITY").toUpperCase();
  const status = String(item.status || "PENDING").toUpperCase();
  const updated =
    formatDate(item.updatedAt || item.createdAt) === "—"
      ? "—"
      : formatDate(item.updatedAt || item.createdAt);

  const stop = (e, fn) => {
    e.stopPropagation();
    fn?.(item);
  };

  const actions = (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="View"
        onClick={(e) => stop(e, onView)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <Eye size={14} />
      </button>
      <button
        type="button"
        title="Edit copy"
        onClick={(e) => stop(e, onEdit)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        title="Duplicate"
        onClick={(e) => stop(e, onDuplicate || onEdit)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <Copy size={14} />
      </button>
      <button
        type="button"
        title="Delete"
        onClick={(e) => stop(e, onDelete)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-500 hover:bg-rose-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onView?.(item)}
        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {item.name}
              </p>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600">
                {category}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {body || "No body text"}
            </p>
          </div>

          <div className="shrink-0 lg:w-36">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {status}
            </span>
            <p className="mt-1 text-[11px] text-slate-400">
              {updated === "—" ? "No date" : updated}
              <span className="text-slate-300"> · </span>
              by Admin
            </p>
          </div>

          <div className="shrink-0 lg:w-32">
            <p className="text-xs font-semibold text-slate-600">
              {varCount} Variable{varCount === 1 ? "" : "s"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {vars.length ? (
                vars.map((v) => (
                  <span
                    key={v}
                    className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
                  >
                    {v}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-300">—</span>
              )}
            </div>
          </div>

          <div className="shrink-0">{actions}</div>
        </div>
      </div>
    );
  }

  // Compact grid card
  return (
    <div
      onClick={() => onView?.(item)}
      className="flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {status}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
        {item.name}
      </p>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">
        {body || "No body text"}
      </p>

      {vars.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {vars.slice(0, 4).map((v) => (
            <span
              key={v}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-2 h-5" />
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <p className="text-[11px] text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 align-middle" />{" "}
          Updated {updated}
        </p>
        {actions}
      </div>
    </div>
  );
}

export default TemplateCard;
