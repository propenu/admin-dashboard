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
    <div className="w-full space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-emerald-600 shrink-0" />
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              WhatsApp templates
            </p>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-[#0f3d2e]">
            Template library
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-9 w-full sm:w-52 rounded-full border border-emerald-100 bg-white pl-8 pr-3 text-[13px] text-[#0f3d2e] shadow-[0_6px_16px_rgba(16,185,129,0.08)] outline-none placeholder:text-[#5c7d6d] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#27AE60] px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(37,211,102,0.28)] hover:bg-[#1EAF54] shrink-0"
          >
            <Plus size={14} /> Create Template
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
                  ? "bg-[#27AE60] text-white shadow-[0_8px_16px_rgba(37,211,102,0.28)]"
                  : "border border-emerald-100 bg-white text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-emerald-100 bg-white p-1 shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1.5 ${
              viewMode === "grid"
                ? "bg-emerald-50 text-emerald-700"
                : "text-[#5c7d6d]"
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
                : "text-[#5c7d6d]"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#27AE60]" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-100 bg-white py-16 text-center text-sm text-[#5c7d6d] shadow-[0_8px_24px_rgba(16,185,129,0.06)]">
          No templates in this filter
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-3 sm:grid-cols-2"
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
        <p className="text-center text-xs text-[#5c7d6d]">
          Categories available:{" "}
          {CATEGORIES?.join?.(", ") || "MARKETING, UTILITY, AUTHENTICATION"}
        </p>
      ) : null}
    </div>
  );
}
