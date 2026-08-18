// locations/components/LocationDetailCard.jsx
import { useMemo, useState, useEffect } from "react";
import { Edit2, Trash2, X, Building2, MapPin, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

export default function LocationDetailCard({
  data,
  onClose,
  onEditCity,
  onEditLocality,
  onDeleteCity,
  onDeleteLocality,
  onAddLocality,
}) {
  const [query, setQuery] = useState("");
  const localities = Array.isArray(data?.localities) ? data.localities : [];

  useEffect(() => {
    setQuery("");
  }, [data?._id]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return localities;
    return localities.filter((loc) => normalize(loc.name).includes(q));
  }, [localities, query]);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="overflow-hidden rounded-2xl border-2 border-green-200 bg-white shadow-xl sm:rounded-3xl"
    >
      {/* Header — compact mobile app bar */}
      <div className="bg-gradient-to-r from-[#27AE60] to-green-600 px-4 py-4 text-white sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold sm:text-xl">{data.city}</h2>
            <p className="text-sm text-green-100">{data.state}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                {data.category || "city"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  data.isHome === true
                    ? "bg-emerald-400/30"
                    : "bg-red-500/80"
                }`}
              >
                {data.isHome === true ? "Home · Live" : "Home · Hidden"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 active:bg-white/25"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-3 sm:p-5">
        {/* City actions — thumb-friendly */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEditCity(data)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 text-sm font-semibold text-white active:bg-blue-600"
          >
            <Edit2 size={16} />
            Edit city
          </button>
          {onAddLocality ? (
            <button
              type="button"
              onClick={() => onAddLocality(data)}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#27AE60] text-sm font-semibold text-white active:bg-green-700"
            >
              <Plus size={16} />
              Add
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDeleteCity}
            className="flex min-h-[44px] w-12 items-center justify-center rounded-xl bg-red-500 text-white active:bg-red-600"
            aria-label="Delete city"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Localities */}
        <div>
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              <MapPin size={14} className="text-[#27AE60]" />
              {filtered.length === localities.length
                ? `Localities (${localities.length})`
                : `Showing ${filtered.length} of ${localities.length}`}
            </h3>

            <div className="relative w-full sm:max-w-[240px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search localities…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-[#27AE60]/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400"
                  aria-label="Clear"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {localities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
              <MapPin size={36} className="mx-auto mb-2 opacity-30" />
              No localities added yet
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
              No localities match “{query}”
            </div>
          ) : (
            <div
              className="max-h-[260px] overflow-y-auto overscroll-contain rounded-xl border border-gray-100 bg-gray-50/50 p-2 sm:max-h-[320px] [-webkit-overflow-scrolling:touch]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#86efac transparent",
              }}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filtered.map((locality, idx) => {
                  const coordinates = locality.location?.coordinates || [];
                  return (
                    <div
                      key={`${locality.name}-${idx}`}
                      className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-gray-800">
                            {locality.name}
                          </h4>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-gray-400">
                            {coordinates[1]?.toFixed?.(4) ?? "0"},{" "}
                            {coordinates[0]?.toFixed?.(4) ?? "0"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditLocality(locality)}
                          className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg bg-blue-50 text-xs font-semibold text-blue-600"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLocality(locality)}
                          className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 text-xs font-semibold text-red-600"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
