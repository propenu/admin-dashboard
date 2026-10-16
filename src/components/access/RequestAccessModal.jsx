import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, X } from "lucide-react";
import { createAccessRequest } from "../../features/property/propertyService";
import { ACCESS_AREA_LABELS, ACCESS_REQUESTS_KEY } from "../../features/property/useAccessRequests";

export default function RequestAccessModal({ area, approverLabel, onClose, onSent }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const label = ACCESS_AREA_LABELS[area] || area;

  const mutation = useMutation({
    mutationFn: () => createAccessRequest(area, reason.trim()),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ACCESS_REQUESTS_KEY });
      onSent?.(response.data?.data);
      onClose();
    },
    onError: (err) => setError(err?.response?.data?.error || "Could not send the request"),
  });

  const tooShort = reason.trim().length < 5;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Request access</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{label}</h3>
            <p className="mt-1 text-xs text-slate-500">
              This creates a ticket for {approverLabel}. You will get an email when it is approved or rejected.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="access-reason">
          Reason
        </label>
        <textarea
          id="access-reason"
          value={reason}
          maxLength={500}
          rows={4}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why do you need this access?"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
        />
        <p className="mt-1 text-right text-[11px] text-slate-400">{reason.length}/500</p>
        {error ? <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p> : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={tooShort || mutation.isPending}
            onClick={() => {
              setError("");
              mutation.mutate();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-sm font-bold text-white hover:bg-[#1f8f4e] disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send request
          </button>
        </div>
      </div>
    </div>
  );
}
