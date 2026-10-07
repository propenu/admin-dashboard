import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

export default function CancelPromotionDialog({
  open,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  const trimmed = reason.trim();

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="flex items-center gap-2 text-lg font-bold text-rose-700">
          <XCircle className="h-5 w-5" />
          Cancel promotion
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This returns the project to a normal listing. Live and scheduled
          promotions both stop. The reason is saved in promotion history.
        </p>
        <label className="mt-4 block space-y-1.5">
          <span className="text-xs font-semibold text-slate-700">
            Why are you cancelling?
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Write the reason"
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-rose-400"
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isLoading || !trimmed}
            onClick={() => onConfirm(trimmed)}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Cancelling…" : "Cancel promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}
