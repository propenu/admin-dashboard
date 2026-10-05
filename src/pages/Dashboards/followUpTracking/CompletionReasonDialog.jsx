import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function CompletionReasonDialog({
  open,
  title = "How was this completed?",
  saving = false,
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !saving) onCancel?.();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, saving, onCancel]);

  if (!open) return null;

  const trimmed = reason.replace(/\s+/g, " ").trim();

  const submit = (event) => {
    event.preventDefault();
    if (trimmed.length < 8 || saving) return;
    onConfirm(trimmed);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-reason-title"
      onClick={saving ? undefined : onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="completion-reason-title" className="text-base font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Write how this case was finished. The status stays unchanged until this is saved.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <label htmlFor="completion-reason" className="mb-1.5 block text-xs font-semibold text-slate-700">
            Completion reason
          </label>
          <textarea
            id="completion-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={5}
            autoFocus
            placeholder="What was done, and what the customer confirmed."
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p className={`mt-1.5 text-[11px] ${trimmed.length > 0 && trimmed.length < 8 ? "text-amber-700" : "text-slate-400"}`}>
            {trimmed.length}/500
            {trimmed.length < 8 ? " · at least 8 characters" : ""}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || trimmed.length < 8}
            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save completion"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
