import { useState } from "react";
import { toast } from "sonner";
import { updateFollowUpWorkStatus } from "../../../features/user/userService";
import CompletionReasonDialog from "./CompletionReasonDialog";

export const FOLLOW_UP_WORK_OPTIONS = [
  { value: "assigned", label: "Assigned", className: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "in_progress", label: "In progress", className: "bg-sky-50 text-sky-800 border-sky-200" },
  { value: "completed", label: "Completed", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
];

export const normalizeFollowUpWorkStatus = (value) => {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (key === "in_progress" || key === "completed" || key === "assigned") return key;
  return "assigned";
};

export const followUpWorkLabel = (value) =>
  FOLLOW_UP_WORK_OPTIONS.find((o) => o.value === normalizeFollowUpWorkStatus(value))?.label ||
  "Assigned";

/**
 * CCE / Team Lead process dropdown.
 * Does not change journey stage (Stuck at location / KYC) — only CCE work status.
 */
export default function FollowUpWorkStatusSelect({
  userId,
  value,
  disabled = false,
  onUpdated,
  compact = false,
}) {
  const current = normalizeFollowUpWorkStatus(value);
  const [saving, setSaving] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);
  const meta = FOLLOW_UP_WORK_OPTIONS.find((o) => o.value === current);

  const saveStatus = async (next, completionReason) => {
    if (!userId || next === current || saving) return;
    setSaving(true);
    try {
      await updateFollowUpWorkStatus(userId, next, completionReason);
      onUpdated?.(userId, next, { completionReason: completionReason || null });
      toast.success(`Process set to ${followUpWorkLabel(next)}`);
      setPendingComplete(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update process");
    } finally {
      setSaving(false);
    }
  };

  const onChange = (event) => {
    event.stopPropagation();
    const next = event.target.value;
    if (!userId || next === current || saving) return;
    if (next === "completed") {
      setPendingComplete(true);
      return;
    }
    saveStatus(next);
  };

  return (
    <>
    <select
      value={current}
      disabled={disabled || saving || !userId}
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
    <CompletionReasonDialog
      open={pendingComplete}
      saving={saving}
      title="How was this case completed?"
      onCancel={() => {
        if (!saving) setPendingComplete(false);
      }}
      onConfirm={(reason) => saveStatus("completed", reason)}
    />
    </>
  );
}
