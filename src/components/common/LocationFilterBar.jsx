import { useMemo } from "react";
import { X } from "lucide-react";

const uniqueSorted = (items) =>
  [...new Set(items.filter(Boolean).map((item) => String(item)))].sort((a, b) =>
    a.localeCompare(b),
  );

/**
 * Cascading location filters: State → City → Locality → Pincode
 */
export default function LocationFilterBar({
  users = [],
  filters,
  setFilters,
  lockedState = "",
  columns = 4,
  className = "",
}) {
  const states = useMemo(
    () => (lockedState ? [lockedState] : uniqueSorted(users.map((user) => user.state))),
    [users, lockedState],
  );
  const byState = useMemo(
    () => (filters.state ? users.filter((user) => user.state === filters.state) : users),
    [users, filters.state],
  );
  const cities = useMemo(() => uniqueSorted(byState.map((user) => user.city)), [byState]);
  const byCity = useMemo(
    () => (filters.city ? byState.filter((user) => user.city === filters.city) : byState),
    [byState, filters.city],
  );
  const localities = useMemo(() => uniqueSorted(byCity.map((user) => user.locality)), [byCity]);
  const byLocality = useMemo(
    () =>
      filters.locality ? byCity.filter((user) => user.locality === filters.locality) : byCity,
    [byCity, filters.locality],
  );
  const pincodes = useMemo(
    () => uniqueSorted(byLocality.map((user) => user.pincode)),
    [byLocality],
  );

  const activeCount = [filters.state, filters.city, filters.locality, filters.pincode].filter(
    Boolean,
  ).length;

  const update = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "state") Object.assign(next, { city: "", locality: "", pincode: "" });
      if (key === "city") Object.assign(next, { locality: "", pincode: "" });
      if (key === "locality") next.pincode = "";
      return next;
    });
  };

  const clear = () =>
    setFilters({
      state: lockedState || "",
      city: "",
      locality: "",
      pincode: "",
    });

  const Select = ({ label, value, onChange, disabled, children }) => (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {children}
      </select>
    </label>
  );

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/80 p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Filter by location {activeCount > 0 ? `· ${activeCount}` : ""}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>
      <div
        className={`grid gap-2 ${
          columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        <Select
          label="State"
          value={filters.state}
          disabled={Boolean(lockedState)}
          onChange={(value) => update("state", value)}
        >
          <option value="">{lockedState ? lockedState : "All states"}</option>
          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select label="City" value={filters.city} onChange={(value) => update("city", value)}>
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Locality"
          value={filters.locality}
          onChange={(value) => update("locality", value)}
        >
          <option value="">All localities</option>
          {localities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Pincode"
          value={filters.pincode}
          onChange={(value) => update("pincode", value)}
        >
          <option value="">All pincodes</option>
          {pincodes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function applyLocationFilters(users, filters) {
  return users.filter((user) => {
    if (filters.state && user.state !== filters.state) return false;
    if (filters.city && user.city !== filters.city) return false;
    if (filters.locality && user.locality !== filters.locality) return false;
    if (filters.pincode && String(user.pincode || "") !== String(filters.pincode)) return false;
    return true;
  });
}
