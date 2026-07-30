import { useState } from "react";
import { toast } from "sonner";
import { updateListingFollowUpWorkStatus } from "../../../features/property/propertyService";
import {
  FOLLOW_UP_WORK_OPTIONS,
  followUpWorkLabel,
  normalizeFollowUpWorkStatus,
} from "./FollowUpWorkStatusSelect";

const resolveEntity = (row, isProject) => {
  if (isProject || row?._entity === "project") return "project";
  const cat = String(row?._category || row?.category || "")
    .trim()
    .toLowerCase();
  if (cat === "commercial") return "commercial";
  if (cat === "agricultural" || cat === "agri") return "agricultural";
  if (cat === "land" || cat === "landplot") return "land";
  return "residential";
};

/**
 * Process dropdown for property / project rows in Client Progress Queue.
 */
export default function ListingFollowUpWorkStatusSelect({
  row,
  isProject = false,
  value,
  disabled = false,
  onUpdated,
  compact = false,
}) {
  const current = normalizeFollowUpWorkStatus(value);
  const [saving, setSaving] = useState(false);
  const meta = FOLLOW_UP_WORK_OPTIONS.find((o) => o.value === current);
  const listingId = String(row?._id || row?.id || "");
  const entity = resolveEntity(row, isProject);

  const onChange = async (event) => {
    event.stopPropagation();
    const next = event.target.value;
    if (!listingId || next === current || saving) return;
    setSaving(true);
    try {
      await updateListingFollowUpWorkStatus(entity, listingId, next);
      onUpdated?.(listingId, next, {
        followUpAssignedTo:
          row?.followUpAssignedTo?._id ||
          row?.followUpAssignedTo ||
          null,
      });
      toast.success(`Process set to ${followUpWorkLabel(next)}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update process",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={current}
      disabled={disabled || saving || !listingId}
      onClick={(e) => e.stopPropagation()}
      onChange={onChange}
      title="CCE follow-up process"
      className={`h-8 rounded-lg border px-2.5 text-[10px] font-bold leading-none outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? "w-[116px] min-w-[116px]" : "w-full"
      } ${meta?.className || "border-slate-200 bg-white text-slate-700"}`}
    >
      {FOLLOW_UP_WORK_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
