import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Inbox, Loader2, X } from "lucide-react";
import {
  approveAccessRequest,
  rejectAccessRequest,
} from "../../features/property/propertyService";
import {
  ACCESS_AREA_LABELS,
  ACCESS_REQUESTS_KEY,
  usePendingAccessRequests,
} from "../../features/property/useAccessRequests";

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const roleLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function AccessRequestActions({ request, onDone, compact = false }) {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ACCESS_REQUESTS_KEY });
    await queryClient.invalidateQueries({ queryKey: ["deleted-access"] });
    onDone?.();
  };
  const approve = useMutation({
    mutationFn: () => approveAccessRequest(request._id),
    onSuccess: refresh,
    onError: (err) => setError(err?.response?.data?.error || "Could not approve"),
  });
  const reject = useMutation({
    mutationFn: () => rejectAccessRequest(request._id, note.trim()),
    onSuccess: refresh,
    onError: (err) => setError(err?.response?.data?.error || "Could not reject"),
  });
  const busy = approve.isPending || reject.isPending;

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {rejecting ? (
        <div className="space-y-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="Reason for rejecting"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-rose-300"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || note.trim().length < 3}
              onClick={() => {
                setError("");
                reject.mutate();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {reject.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setRejecting(true)}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setError("");
              approve.mutate();
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#27AE60] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1f8f4e] disabled:opacity-50"
          >
            {approve.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Enable access
          </button>
        </div>
      )}
      {error ? <p className="mt-1 text-right text-[11px] font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}

export default function PendingAccessRequests({ areas }) {
  const { data = [], isPending } = usePendingAccessRequests(areas);

  if (isPending || data.length === 0) return null;

  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
        <Inbox className="h-3.5 w-3.5" />
        Pending requests ({data.length})
      </p>
      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {data.map((request) => (
          <li key={request._id} className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{request.requester?.name || "Unknown"}</p>
                <p className="truncate text-[11px] text-slate-500">
                  {roleLabel(request.requester?.roleName)} · {ACCESS_AREA_LABELS[request.area] || request.area}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-slate-400">
                {request.ticketCode ? `#${request.ticketCode} · ` : ""}
                {formatWhen(request.createdAt)}
              </span>
            </div>
            {request.reason ? <p className="mt-1.5 text-xs text-slate-600">“{request.reason}”</p> : null}
            <AccessRequestActions request={request} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}
