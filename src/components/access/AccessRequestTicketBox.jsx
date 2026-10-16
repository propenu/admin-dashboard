import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";
import { getAccessRequestByTicket } from "../../features/property/propertyService";
import { ACCESS_AREA_LABELS, ACCESS_REQUESTS_KEY } from "../../features/property/useAccessRequests";
import { useAccessLiveUpdates } from "../../features/property/accessLive";
import { AccessRequestActions } from "./PendingAccessRequests";

const STATUS_TONE = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_TEXT = {
  pending: "Pending",
  approved: "Access enabled",
  rejected: "Rejected",
};

const roleLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AccessRequestTicketBox({ ticketId }) {
  const queryClient = useQueryClient();
  const queryKey = [...ACCESS_REQUESTS_KEY, "ticket", ticketId];
  const { data: request, isPending, isError } = useQuery({
    queryKey,
    queryFn: async () => (await getAccessRequestByTicket(ticketId)).data?.data || null,
    enabled: Boolean(ticketId),
    retry: false,
  });

  useAccessLiveUpdates(() => {
    queryClient.invalidateQueries({ queryKey });
  });

  if (isPending) {
    return (
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading access request...
      </div>
    );
  }
  if (isError || !request) return null;

  const status = request.status || "pending";

  return (
    <div className="border-b border-slate-100 p-4">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#128C45]">
            <KeyRound className="h-3.5 w-3.5" />
            Access request · {ACCESS_AREA_LABELS[request.area] || request.area}
          </p>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[status] || STATUS_TONE.pending}`}>
            {STATUS_TEXT[status] || status}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">{request.requester?.name || "Unknown"}</span>
          <span className="text-slate-500"> · {roleLabel(request.requester?.roleName)}</span>
        </p>
        {request.reason ? <p className="mt-1 text-xs text-slate-600">“{request.reason}”</p> : null}
        {status !== "pending" && request.decidedBy?.name ? (
          <p className="mt-2 text-[11px] text-slate-500">
            {status === "approved" ? "Enabled" : "Rejected"} by {request.decidedBy.name}
            {request.decisionNote ? ` — ${request.decisionNote}` : ""}
          </p>
        ) : null}
        {status === "pending" && request.canDecide ? (
          <AccessRequestActions
            request={request}
            onDone={() => {
              queryClient.invalidateQueries({ queryKey: ["tickets"] });
              queryClient.invalidateQueries({ queryKey: ["ticket-dashboard"] });
            }}
          />
        ) : null}
        {status === "pending" && !request.canDecide && request.blockedReason ? (
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{request.blockedReason}</p>
        ) : null}
      </div>
    </div>
  );
}
