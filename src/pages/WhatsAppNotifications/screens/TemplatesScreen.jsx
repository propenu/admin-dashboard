import { useMemo, useState } from "react";
import {
  Grid2X2,
  List,
  Loader2,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { TemplateCard } from "../cards/TemplateCard";
import { CATEGORIES } from "../utils/constants";

export default function TemplatesScreen({
  templates = [],
  loading,
  onCreate,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  const counts = useMemo(() => {
    const base = {
      ALL: templates.length,
      MARKETING: 0,
      UTILITY: 0,
      AUTHENTICATION: 0,
    };
    for (const t of templates) {
      const key = String(t.category || "").toUpperCase();
      if (base[key] !== undefined) base[key] += 1;
    }
    return base;
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const cat = String(t.category || "").toUpperCase();
      const name = String(t.name || "").replace(/_/g, " ").toLowerCase();
      const okCat = category === "ALL" ? true : cat === category;
      const okQ = !q || name.includes(q) || String(t.name || "").toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [templates, search, category]);

  const tabs = [
    { id: "ALL", label: `ALL ${counts.ALL}` },
    { id: "MARKETING", label: `MARKETING ${counts.MARKETING}` },
    { id: "UTILITY", label: `UTILITY ${counts.UTILITY}` },
    { id: "AUTHENTICATION", label: `AUTHENTICATION ${counts.AUTHENTICATION}` },
  ];

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#25D366]" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#25D366]">
              WhatsApp templates
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Template library
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white hover:bg-[#1EAF54]"
          >
            <Plus size={16} /> Create Template
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                category === tab.id
                  ? "bg-[#25D366] text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1.5 ${
              viewMode === "grid"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-400"
            }`}
          >
            <Grid2X2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-1.5 ${
              viewMode === "list"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-400"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#25D366]" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          No templates in this filter
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              : "space-y-2.5"
          }
        >
          {filtered.map((item) => (
            <TemplateCard
              key={item.name || item.id}
              item={item}
              viewMode={viewMode}
              onView={() => onView?.(item)}
              onEdit={() => onEdit?.(item)}
              onDuplicate={() => onDuplicate?.(item)}
              onDelete={() => onDelete?.(item)}
            />
          ))}
        </div>
      )}

      {!loading && templates.length === 0 ? (
        <p className="text-center text-xs text-slate-400">
          Categories available:{" "}
          {CATEGORIES?.join?.(", ") || "MARKETING, UTILITY, AUTHENTICATION"}
        </p>
      ) : null}
    </div>
  );
}
