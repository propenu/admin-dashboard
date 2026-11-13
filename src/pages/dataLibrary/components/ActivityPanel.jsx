import { Loader2, RotateCcw, X } from "lucide-react";
import { useDataLibraryActivity, useDeletedDataLibrary, useRestoreDataLibraryItem } from "../hooks/useDataLibrary";
import { docTypeMeta, formatTime, toDayKey } from "../utils/dataLibraryHelpers";

const ACTION_LABELS = {
  uploaded: "Uploaded",
  link_added: "Link added",
  updated: "Updated",
  deleted: "Deleted",
  restored: "Restored",
  downloaded: "Downloaded",
  data_extracted: "Data saved as table",
  data_synced: "Table refreshed",
  data_exported: "Table exported",
};

const ACTION_TONE = {
  uploaded: "bg-emerald-50 text-emerald-700",
  link_added: "bg-blue-50 text-blue-700",
  data_extracted: "bg-emerald-50 text-emerald-700",
  data_synced: "bg-emerald-50 text-emerald-700",
  deleted: "bg-red-50 text-red-600",
  restored: "bg-amber-50 text-amber-700",
};

export default function ActivityPanel({ onClose, canRestore }) {
  const activity = useDataLibraryActivity({ limit: 150 }, true);
  const deleted = useDeletedDataLibrary(true);
  const restore = useRestoreDataLibraryItem();
  const events = activity.data?.items || [];
  const deletedItems = deleted.data?.items || [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Activity</h2>
            <p className="text-xs text-gray-500">Uploads, downloads, table saves and deletions.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {deletedItems.length > 0 && (
          <div className="border-b border-gray-100 px-5 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Deleted · {deletedItems.length}
            </p>
            <div className="space-y-1.5">
              {deletedItems.map((item) => (
                <div key={item._id} className="flex items-center gap-2 rounded-xl bg-red-50/70 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{item.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {item.deletedBy?.name ? `by ${item.deletedBy.name} · ` : ""}
                      {item.deletedAt ? `${toDayKey(item.deletedAt)} ${formatTime(item.deletedAt)}` : ""}
                    </p>
                  </div>
                  {canRestore && (
                    <button
                      onClick={() => restore.mutate(item._id)}
                      disabled={restore.isPending}
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {restore.isPending ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {activity.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No activity yet.</p>
          ) : (
            <ol className="space-y-2">
              {events.map((event) => (
                <li key={event._id} className="flex gap-2.5">
                  <span
                    className={`mt-0.5 h-fit shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      ACTION_TONE[event.action] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ACTION_LABELS[event.action] || event.action}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{event.itemTitle || "—"}</p>
                    <p className="truncate text-[11px] text-gray-400">
                      {event.by?.name || "Unknown"}
                      {event.createdAt ? ` · ${toDayKey(event.createdAt)} ${formatTime(event.createdAt)}` : ""}
                      {event.docType ? ` · ${docTypeMeta(event.docType).label}` : ""}
                    </p>
                    {event.details && <p className="truncate text-[11px] text-gray-500">{event.details}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
