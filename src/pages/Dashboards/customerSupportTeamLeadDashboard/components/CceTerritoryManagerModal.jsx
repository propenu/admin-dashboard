import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getUserWorkingLocations,
  updateUserWorkingLocations,
} from "../../../../features/accessControl/accessControlService";
import SearchableSelect from "../../../../components/common/location/SearchableSelect";
import {
  CITY_OTHER,
  canAddCustomLocation,
  getCitySuggestions,
  getSavedCityNamesForState,
  getSavedLocalitySuggestions,
  getStateSuggestions,
  locationsFromFeaturedOptions,
  mergeSavedLocationSources,
  normalizeComparisonValue,
  searchLocalitiesWithPhoton,
  titleCase,
  unwrapLocationList,
} from "../../../../components/common/location/searchableLocationUtils";
import { fetchSearchableLocationsService } from "../../../../services/LocationsServices/LocationServices";
import { fetchListingLocationOptions } from "../../../../services/PostAPropertyService";
import { fetchLoggedInUser } from "../../../../services/UserServices/userServices";

const emptyRow = () => ({ state: "", city: "", locality: "" });

const ALL_CITIES = {
  label: "All cities (entire state)",
  value: "__all_cities__",
  isClear: true,
};
const ALL_LOCALITIES = {
  label: "All localities (entire city)",
  value: "__all_localities__",
  isClear: true,
};

const formatHint = (row) => {
  if (!row.state?.trim()) return "State required";
  if (!row.city?.trim()) return "Entire state";
  if (!row.locality?.trim()) return "Entire city";
  return "Exact locality";
};

const formatTerritoryLine = (row) => {
  const state = String(row?.state || "").trim();
  const city = String(row?.city || "").trim();
  const locality = String(row?.locality || "").trim();
  if (!state) return "";
  if (!city) return `${state} (entire state)`;
  if (!locality) return `${city}, ${state} (entire city)`;
  return `${locality}, ${city}, ${state}`;
};

function TerritoryRow({
  row,
  index,
  savedLocations,
  canAddCustom,
  onChange,
  onRemove,
}) {
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [localityLoading, setLocalityLoading] = useState(false);
  const [preferOtherCity, setPreferOtherCity] = useState(false);

  const savedCities = useMemo(
    () => getSavedCityNamesForState(savedLocations, row.state),
    [savedLocations, row.state],
  );

  useEffect(() => {
    if (!stateOpen) {
      setStateSuggestions([]);
      return;
    }
    const tid = setTimeout(() => {
      setStateLoading(true);
      setStateSuggestions(getStateSuggestions(stateSearch));
      setStateLoading(false);
    }, 200);
    return () => clearTimeout(tid);
  }, [stateOpen, stateSearch]);

  useEffect(() => {
    if (!cityOpen) {
      setCitySuggestions([]);
      return;
    }
    const tid = setTimeout(() => {
      if (!row.state) {
        setCitySuggestions([]);
        return;
      }
      setCityLoading(true);
      const list = getCitySuggestions(row.state, citySearch || undefined, {
        includeOther: canAddCustom,
        savedCities,
      });
      setCitySuggestions([ALL_CITIES, ...list]);
      setCityLoading(false);
    }, 200);
    return () => clearTimeout(tid);
  }, [cityOpen, citySearch, row.state, savedCities, canAddCustom]);

  useEffect(() => {
    if (!localityOpen) {
      setLocalitySuggestions([]);
      return;
    }
    if (!row.city) {
      setLocalitySuggestions([]);
      return;
    }

    const trimmed = localitySearch.trim();
    const saved = getSavedLocalitySuggestions(
      savedLocations,
      row.state,
      row.city,
      trimmed,
    );

    if (trimmed.length < 2) {
      setLocalitySuggestions([ALL_LOCALITIES, ...saved]);
      return;
    }

    const ctrl = new AbortController();
    const tid = setTimeout(async () => {
      setLocalityLoading(true);
      const results = await searchLocalitiesWithPhoton(
        trimmed,
        ctrl.signal,
        row.state || undefined,
        row.city || undefined,
        trimmed,
      );
      const seen = new Set(saved.map((s) => normalizeComparisonValue(s.label)));
      const merged = [...saved];
      for (const r of results) {
        const key = normalizeComparisonValue(r.label);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(r);
      }
      if (
        canAddCustom &&
        !merged.some(
          (r) =>
            normalizeComparisonValue(r.label) ===
            normalizeComparisonValue(trimmed),
        )
      ) {
        merged.push({
          label: titleCase(trimmed),
          isCustom: true,
          city: row.city,
          state: row.state,
        });
      }
      setLocalitySuggestions([ALL_LOCALITIES, ...merged]);
      setLocalityLoading(false);
    }, 350);

    return () => {
      ctrl.abort();
      clearTimeout(tid);
    };
  }, [
    localityOpen,
    localitySearch,
    row.city,
    row.state,
    savedLocations,
    canAddCustom,
  ]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
          <MapPin size={12} className="text-emerald-600" /> Territory {index + 1}{" "}
          · {formatHint(row)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SearchableSelect
          required
          label="State"
          value={row.state || ""}
          placeholder="Select state"
          open={stateOpen}
          onToggle={() => {
            setStateOpen((o) => !o);
            setCityOpen(false);
            setLocalityOpen(false);
            if (!stateOpen) setStateSearch("");
          }}
          onClose={() => setStateOpen(false)}
          searchValue={stateSearch}
          onSearchChange={setStateSearch}
          searchPlaceholder="Search state..."
          loading={stateLoading}
          options={stateSuggestions}
          onSelect={(opt) => {
            setPreferOtherCity(false);
            onChange({ state: opt.label, city: "", locality: "" });
            setStateOpen(false);
          }}
          emptyHint={
            stateSearch.trim().length >= 2
              ? "No state found"
              : "Type to search Indian states"
          }
          optionKey={(opt) => opt.isoCode || opt.label}
        />

        <div className="space-y-2">
          <SearchableSelect
            label="City (optional)"
            value={
              canAddCustom && preferOtherCity && !row.city
                ? "Other (custom city)"
                : row.city || ""
            }
            placeholder={row.state ? "All cities if empty" : "Select state first"}
            disabled={!row.state}
            open={cityOpen}
            onToggle={() => {
              if (!row.state) return;
              setCityOpen((o) => !o);
              setStateOpen(false);
              setLocalityOpen(false);
              if (!cityOpen) setCitySearch("");
            }}
            onClose={() => setCityOpen(false)}
            searchValue={citySearch}
            onSearchChange={setCitySearch}
            searchPlaceholder="Search city…"
            loading={cityLoading}
            options={citySuggestions}
            onSelect={(opt) => {
              if (opt.isClear) {
                setPreferOtherCity(false);
                onChange({ ...row, city: "", locality: "" });
              } else if (opt.isOther || opt.value === CITY_OTHER) {
                setPreferOtherCity(true);
                onChange({ ...row, city: "", locality: "" });
              } else {
                setPreferOtherCity(false);
                onChange({ ...row, city: opt.label, locality: "" });
              }
              setCityOpen(false);
            }}
            emptyHint={
              citySearch.trim().length >= 2
                ? "No city found"
                : row.state
                  ? "Suggested cities for selected state"
                  : "Select state first"
            }
            optionKey={(opt, idx) =>
              `${opt.value || opt.label}-${opt.isSaved ? "saved" : "pkg"}-${idx}`
            }
            renderOption={(opt) => (
              <span className="min-w-0 flex-1 truncate">
                {opt.label}
                {opt.isSaved ? (
                  <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                    (saved)
                  </span>
                ) : null}
              </span>
            )}
          />
          {canAddCustom && preferOtherCity ? (
            <input
              value={row.city || ""}
              onChange={(e) =>
                onChange({ ...row, city: e.target.value, locality: "" })
              }
              onBlur={(e) =>
                onChange({ ...row, city: titleCase(e.target.value) })
              }
              placeholder="Type custom city / mandal"
              className="w-full rounded-xl border border-[#d1d5db] px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10"
            />
          ) : null}
        </div>

        <SearchableSelect
          label="Locality (optional)"
          value={row.locality || ""}
          placeholder={row.city ? "All localities if empty" : "Select city first"}
          disabled={!row.city}
          open={localityOpen}
          onToggle={() => {
            if (!row.city) return;
            setLocalityOpen((o) => !o);
            setStateOpen(false);
            setCityOpen(false);
            if (!localityOpen) {
              setLocalitySearch("");
              setLocalitySuggestions([]);
            }
          }}
          onClose={() => setLocalityOpen(false)}
          searchValue={localitySearch}
          onSearchChange={setLocalitySearch}
          searchPlaceholder="Search locality..."
          loading={localityLoading}
          options={localitySuggestions}
          onSelect={(opt) => {
            if (opt.isClear) {
              onChange({ ...row, locality: "" });
            } else {
              onChange({ ...row, locality: opt.label });
            }
            setLocalityOpen(false);
          }}
          emptyHint={
            !row.city
              ? "Select city first"
              : localitySearch.trim().length >= 2
                ? canAddCustom
                  ? "No locality found — keep typing to use a custom name"
                  : "No locality found — pick a saved or suggested locality"
                : "Saved localities for this city, or type to search"
          }
          optionKey={(opt, idx) =>
            `${opt.label}-${opt.city || ""}-${opt.isSaved ? "s" : "p"}-${idx}`
          }
          renderOption={(opt) => (
            <span className="min-w-0 flex-1 truncate">
              {opt.label}
              {opt.isSaved ? (
                <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                  (saved)
                </span>
              ) : null}
            </span>
          )}
        />
      </div>
    </div>
  );
}

/**
 * Hierarchy territory modal (CCE, CSH, Sales Executive, RM, BD Manager, …).
 * State / City / Locality use the same searchable dropdowns as project & property post.
 * - State only = whole state
 * - State + city = whole city
 * - State + city + locality = exact locality
 */
export default function CceTerritoryManagerModal({
  open,
  member,
  onClose,
  onSaved,
  readOnly = false,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([emptyRow()]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [viewerRole, setViewerRole] = useState("");

  const canAddCustom = canAddCustomLocation(viewerRole);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchLoggedInUser()
      .then((user) => {
        if (!cancelled) setViewerRole(String(user?.roleName || ""));
      })
      .catch(() => {
        if (!cancelled) setViewerRole("");
      });
    Promise.all([
      fetchSearchableLocationsService().catch(() => null),
      fetchListingLocationOptions().catch(() => null),
    ]).then(([locRes, listingRes]) => {
      if (cancelled) return;
      setSavedLocations(
        mergeSavedLocationSources(
          unwrapLocationList(locRes),
          locationsFromFeaturedOptions(listingRes),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !member?.id) return;
    let cancelled = false;
    setLoading(true);
    getUserWorkingLocations(member.id)
      .then((payload) => {
        if (cancelled) return;
        const data = payload?.data || payload || {};
        setHomeLocation(data.homeLocation || null);
        const list = Array.isArray(data.workingLocations)
          ? data.workingLocations
          : [];
        setRows(
          list.length
            ? list.map((row) => ({
                state: row.state || "",
                city: row.city || "",
                locality: row.locality || "",
              }))
            : [emptyRow()],
        );
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to load territories",
        );
        setRows([emptyRow()]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, member?.id]);

  if (!open || !member) return null;

  const updateRow = (index, next) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...next } : row)),
    );
  };

  const addRow = () => setRows((current) => [...current, emptyRow()]);
  const removeRow = (index) =>
    setRows((current) =>
      current.length <= 1 ? [emptyRow()] : current.filter((_, i) => i !== index),
    );

  const save = async () => {
    if (readOnly) {
      toast.error("Only your manager can change working locations");
      return;
    }
    const cleaned = rows
      .map((row) => ({
        state: String(row.state || "").trim(),
        city: String(row.city || "").trim(),
        locality: String(row.locality || "").trim(),
      }))
      .filter((row) => row.state);

    if (!cleaned.length) {
      toast.error("Add at least one territory with a state");
      return;
    }

    setSaving(true);
    try {
      await updateUserWorkingLocations(
        member.id,
        cleaned.map((row) => ({
          state: row.state,
          ...(row.city ? { city: row.city } : {}),
          ...(row.city && row.locality ? { locality: row.locality } : {}),
        })),
      );
      toast.success("Working locations updated");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-3 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Working locations</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {member.name} ·{" "}
              {readOnly
                ? "view only — your manager assigns territories"
                : "territory for tickets / clients / onboarding under this role"}
            </p>
            {homeLocation?.state ? (
              <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                Home / credential location:{" "}
                {[homeLocation.locality, homeLocation.city, homeLocation.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3">
          <p className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-[11px] text-emerald-900">
            {readOnly ? (
              <>
                Territories are controlled by your <strong>parent manager</strong>{" "}
                only. You can view the assigned coverage below.
              </>
            ) : (
              <>
                Same searchable State / City / Locality as project &amp; property
                post. Leave <strong>city</strong> empty for entire state. Leave{" "}
                <strong>locality</strong> empty for entire city.
              </>
            )}
          </p>

          {loading ? (
            <div className="space-y-2 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <>
              {rows.some((row) => row.state?.trim()) ? (
                <div className="rounded-xl border border-slate-300 bg-slate-900 px-3 py-2.5 text-[11px] text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Saved territories
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {rows
                      .map((row, i) => ({ line: formatTerritoryLine(row), i }))
                      .filter((item) => item.line)
                      .map(({ line, i }) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 font-semibold text-slate-50"
                        >
                          <MapPin
                            size={12}
                            className="mt-0.5 shrink-0 text-emerald-400"
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              {!readOnly
                ? rows.map((row, index) => (
                    <TerritoryRow
                      key={index}
                      row={row}
                      index={index}
                      savedLocations={savedLocations}
                      canAddCustom={canAddCustom}
                      onChange={(next) => updateRow(index, next)}
                      onRemove={() => removeRow(index)}
                    />
                  ))
                : null}
            </>
          )}

          {!readOnly ? (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Plus size={14} /> Add territory
            </button>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly ? (
            <button
              type="button"
              disabled={saving || loading}
              onClick={save}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save territories"}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
