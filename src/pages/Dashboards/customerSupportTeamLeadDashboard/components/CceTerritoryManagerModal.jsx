import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getUserWorkingLocations,
  updateUserWorkingLocations,
} from "../../../../features/accessControl/accessControlService";

const emptyRow = () => ({ state: "", city: "", locality: "" });

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

/** Force dark typed/saved values (avoids label color looking like placeholder). */
const territoryInputStyle = (filled) => ({
  color: filled ? "#0f172a" : "#0f172a",
  WebkitTextFillColor: filled ? "#0f172a" : "#0f172a",
  fontWeight: 700,
  backgroundColor: filled ? "#f1f5f9" : "#ffffff",
  borderColor: filled ? "#475569" : "#e2e8f0",
});

/**
 * Team Lead / Support Head modal to expand a CCE's working territories.
 * - State only = whole Telangana / AP
 * - State + city = whole city
 * - State + city + locality = exact locality
 */
export default function CceTerritoryManagerModal({ open, member, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([emptyRow()]);
  const [homeLocation, setHomeLocation] = useState(null);

  useEffect(() => {
    if (!open || !member?.id) return;
    let cancelled = false;
    setLoading(true);
    getUserWorkingLocations(member.id)
      .then((payload) => {
        if (cancelled) return;
        const data = payload?.data || payload || {};
        setHomeLocation(data.homeLocation || null);
        const list = Array.isArray(data.workingLocations) ? data.workingLocations : [];
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
        toast.error(err?.response?.data?.message || err?.message || "Failed to load territories");
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

  const updateRow = (index, key, value) => {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [key]: value };
        if (key === "state") {
          // Keep city/locality when editing state text; clear only if state emptied
          if (!value.trim()) {
            next.city = "";
            next.locality = "";
          }
        }
        if (key === "city" && !value.trim()) next.locality = "";
        return next;
      }),
    );
  };

  const addRow = () => setRows((current) => [...current, emptyRow()]);
  const removeRow = (index) =>
    setRows((current) => (current.length <= 1 ? [emptyRow()] : current.filter((_, i) => i !== index)));

  const save = async () => {
    const cleaned = rows
      .map((row) => ({
        state: row.state.trim(),
        city: row.city.trim(),
        locality: row.locality.trim(),
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Working locations</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {member.name} · tickets in these areas auto-assign to this executive
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
            Leave <strong>city</strong> empty for entire state (e.g. all Telangana). Leave{" "}
            <strong>locality</strong> empty for entire city. Add multiple rows for TG + AP.
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
                        <li key={i} className="flex items-start gap-1.5 font-semibold text-slate-50">
                          <MapPin size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                          <span>{line}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              {rows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      <MapPin size={12} className="text-emerald-600" /> Territory {index + 1} ·{" "}
                      {formatHint(row)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { key: "state", label: "State *", placeholder: "e.g. Telangana", required: true },
                      { key: "city", label: "City (optional)", placeholder: "All cities if empty" },
                      { key: "locality", label: "Locality (optional)", placeholder: "All localities if empty" },
                    ].map((field) => {
                      const value = String(row[field.key] || "");
                      const filled = Boolean(value.trim());
                      const disabled = field.key === "locality" && !String(row.city || "").trim();
                      return (
                        <div key={field.key} className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {field.label}
                          </span>
                          <input
                            value={value}
                            onChange={(e) => updateRow(index, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={disabled}
                            style={territoryInputStyle(filled)}
                            className="cce-territory-input mt-1 w-full rounded-lg border px-2.5 py-2 text-xs outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Plus size={14} /> Add territory
          </button>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={save}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save territories"}
          </button>
        </footer>
      </div>
    </div>
  );
}
