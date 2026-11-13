import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileDown,
  History,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthUserProfile } from "../../hooks/useAuthUser";
import ActivityPanel from "./components/ActivityPanel";
import DataItemModal from "./components/DataItemModal";
import {
  useCreateDataLibraryItem,
  useDataLibraryList,
  useDeleteDataLibraryItem,
  useUpdateDataLibraryItem,
} from "./hooks/useDataLibrary";
import { downloadDataLibraryFile } from "../../features/dataLibrary/dataLibraryService";
import {
  DATE_PRESETS,
  DOC_TYPES,
  docTypeMeta,
  exportItemsCsv,
  formatBytes,
  formatTime,
  googleExportUrl,
  linkHost,
  presetRange,
} from "./utils/dataLibraryHelpers";

const useDataLibraryAccess = () => {
  const { permissions, roleName } = useAuthUserProfile();
  const role = String(roleName || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const list = Array.isArray(permissions) ? permissions : [];
  const bypass = role === "super_admin" || role === "admin" || list.includes("*");
  const can = (action) => bypass || list.includes(`data_library:${action}`);
  return {
    canCreate: can("create"),
    canUpdate: can("update"),
    canDelete: can("delete"),
    canDownload: can("download"),
  };
};

const selectCls =
  "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300";

export default function DataLibrary() {
  const access = useDataLibraryAccess();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("all");
  const [category, setCategory] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pageTab, setPageTab] = useState("documents");
  const [page, setPage] = useState(1);
  const [activityOpen, setActivityOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters = useMemo(
    () => ({
      q: debouncedSearch,
      docType,
      category,
      ...presetRange(datePreset, customFrom, customTo),
      page,
      ...(pageTab === "tables" ? { hasTable: "1" } : {}),
    }),
    [debouncedSearch, docType, category, datePreset, customFrom, customTo, page, pageTab],
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, docType, category, datePreset, customFrom, customTo, pageTab]);

  const { data, isLoading, isError, isFetching, refetch } = useDataLibraryList(filters);
  const items = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);
  const summary = data?.summary || {};
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const total = data?.total ?? items.length;
  const totalPages = data?.totalPages || 1;

  const createMutation = useCreateDataLibraryItem();
  const updateMutation = useUpdateDataLibraryItem();
  const deleteMutation = useDeleteDataLibraryItem();

  const hasFilters =
    Boolean(search.trim()) || docType !== "all" || category !== "all" || datePreset !== "all";

  const clearFilters = () => {
    setSearch("");
    setDocType("all");
    setCategory("all");
    setDatePreset("all");
    setCustomFrom("");
    setCustomTo("");
  };

  const handleSubmit = (payload) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem._id, payload },
        { onSuccess: () => setEditItem(null) },
      );
      return;
    }
    setUploadProgress(0);
    createMutation.mutate(
      { payload, onProgress: setUploadProgress },
      {
        onSuccess: () => setModalOpen(false),
        onSettled: () => setUploadProgress(0),
      },
    );
  };

  const handleDownload = async (item) => {
    if (item.sourceType === "link") {
      const exportUrl = googleExportUrl(item.link);
      window.open(exportUrl || item.link, "_blank", "noopener,noreferrer");
      return;
    }
    setDownloadingId(item._id);
    try {
      await downloadDataLibraryFile(item);
    } catch (err) {
      toast.error(err?.response?.status === 403 ? "You don't have download access" : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Library</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Upload PDFs, sheets, docs and Google Form links — browse them date-wise, filter and download.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivityOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <History size={15} /> Activity
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => exportItemsCsv(items)}
            disabled={!items.length}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Export the filtered list as CSV"
          >
            <FileDown size={15} /> Export list
          </button>
          {access.canCreate && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-95"
              style={{ background: "#27AE60" }}
            >
              <Plus size={15} /> Add Data
            </button>
          )}
        </div>
      </div>

      {/* Type tabs with counts */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: "all", label: "All", Icon: FolderOpen }, ...DOC_TYPES].map(({ id, label, Icon }) => {
          const active = docType === id;
          return (
            <button
              key={id}
              onClick={() => setDocType(id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
              }`}
              style={active ? { background: "#27AE60" } : {}}
            >
              <Icon size={13} />
              {label}
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {summary[id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, file, project, notes…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-8 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={15} className="text-gray-400" />
            <select value={datePreset} onChange={(e) => setDatePreset(e.target.value)} className={selectCls}>
              {DATE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={selectCls}
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className={selectCls}
              />
            </div>
          )}
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-gray-500">Failed to load the data library.</p>
          <button onClick={() => refetch()} className="text-xs font-medium text-emerald-600 hover:underline">
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <FolderOpen size={20} className="text-emerald-500" />
          </div>
          <p className="text-sm text-gray-500">
            {hasFilters
              ? "Nothing matches these filters."
              : pageTab === "tables"
                ? "No saved tables yet. Upload a PDF or sheet and its rows appear here."
                : "No documents yet. Add your first PDF, sheet or link."}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              {[
                { id: "documents", label: "Documents" },
                { id: "tables", label: "Table format" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPageTab(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    pageTab === tab.id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {items.map((item) => (
              <DataRow
                key={item._id}
                item={item}
                mode={pageTab}
                access={access}
                downloading={downloadingId === item._id}
                onOpen={() =>
                  navigate(
                    `/data-library/${item._id}?view=${pageTab === "tables" ? "table" : "document"}`,
                  )
                }
                onDownload={() => handleDownload(item)}
                onEdit={() => setEditItem(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(page - 1) * 12 + (items.length ? 1 : 0)}–{(page - 1) * 12 + items.length} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || isFetching}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {(modalOpen || editItem) && (
        <DataItemModal
          key={editItem?._id || "new"}
          initialData={editItem}
          categories={categories}
          loading={createMutation.isPending || updateMutation.isPending}
          progress={uploadProgress}
          onClose={() => {
            setModalOpen(false);
            setEditItem(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {activityOpen && (
        <ActivityPanel onClose={() => setActivityOpen(false)} canRestore={access.canDelete} />
      )}

      {deleteItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete this item?</h3>
            <p className="mt-1 text-sm text-gray-500">
              “{deleteItem.title}” will be removed
              {deleteItem.sourceType === "file" ? " along with the uploaded file" : ""}. This can't be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteItem(null)}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteMutation.mutate(deleteItem._id, { onSuccess: () => setDeleteItem(null) })
                }
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataRow({ item, mode, access, downloading, onOpen, onDownload, onEdit, onDelete }) {
  const meta = docTypeMeta(item.docType);
  const isLink = item.sourceType === "link";
  const canDownloadLink = isLink && Boolean(googleExportUrl(item.link));
  const showDownload = access.canDownload && (!isLink || canDownloadLink);
  const source = isLink
    ? linkHost(item.link)
    : [item.file?.originalName, formatBytes(item.file?.size)].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${meta.tone}`}>
          <meta.Icon size={18} />
        </span>
        <div className="min-w-0">
          <button
            onClick={onOpen}
            className="block max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-emerald-700"
            title={item.title}
          >
            {item.title}
          </button>
          <p className="truncate text-xs text-gray-500" title={source}>
            {isLink && <ExternalLink size={11} className="mr-1 inline -translate-y-px" />}
            {source}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
            <span className={`rounded-md px-1.5 py-0.5 font-semibold ring-1 ${meta.tone}`}>{meta.label}</span>
            {item.category && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{item.category}</span>
            )}
            {item.project && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                {item.project}
              </span>
            )}
            <span>
              {item.uploadedBy?.name ? `by ${item.uploadedBy.name}` : ""}
              {item.createdAt ? ` · ${formatTime(item.createdAt)}` : ""}
            </span>
            {item.table?.rowCount > 0 && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                {item.table.rowCount} rows saved
              </span>
            )}
            {item.downloads > 0 && <span>· {item.downloads} downloads</span>}
          </div>
          {item.notes && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.notes}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:pl-2">
        <button
          onClick={onOpen}
          className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          {mode === "tables" ? "Open table" : "Open document"}
        </button>
        {showDownload && (
          <button
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-60"
            style={{ background: "#27AE60" }}
          >
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Download
          </button>
        )}
        {access.canUpdate && (
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
        )}
        {access.canDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
