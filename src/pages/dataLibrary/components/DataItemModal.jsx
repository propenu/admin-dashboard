import { useRef, useState } from "react";
import { CloudUpload, Link2, X, Loader2, Table2 } from "lucide-react";
import { canExtractTable, extractTableFromFile } from "../utils/sheetTable";
import {
  ACCEPTED_FILE_TYPES,
  CATEGORY_SUGGESTIONS,
  MAX_FILE_MB,
  detectLinkType,
  docTypeMeta,
  formatBytes,
  toDayKey,
  todayKey,
} from "../utils/dataLibraryHelpers";

const initialForm = (item) => ({
  title: item?.title || "",
  category: item?.category || "",
  project: item?.project || "",
  notes: item?.notes || "",
  recordDate: item ? toDayKey(item.recordDate || item.createdAt) : todayKey(),
  link: item?.link || "",
});

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300";

/** Mount only while open (with a `key` per item) so state starts fresh each time. */
export default function DataItemModal({
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  loading = false,
  progress = 0,
}) {
  const isEdit = Boolean(initialData);
  const [mode, setMode] = useState(initialData?.sourceType === "link" ? "link" : "file");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState(() => initialForm(initialData));
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [table, setTable] = useState(null);
  const fileInputRef = useRef(null);
  const readRef = useRef(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const pickFile = async (picked) => {
    if (!picked) return;
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File must be below ${MAX_FILE_MB} MB`);
      return;
    }
    setError("");
    setFile(picked);
    setTable(null);
    setForm((prev) =>
      prev.title ? prev : { ...prev, title: picked.name.replace(/\.[^.]+$/, "") },
    );
    if (!canExtractTable(picked.name)) return;
    setReading(true);
    const job = extractTableFromFile(picked)
      .then((result) => {
        if (readRef.current === job) setTable(result);
        return result;
      })
      .catch(() => null)
      .finally(() => {
        if (readRef.current === job) setReading(false);
      });
    readRef.current = job;
  };

  const linkType = mode === "link" ? detectLinkType(form.link) : null;
  const categoryOptions = Array.from(new Set([...categories, ...CATEGORY_SUGGESTIONS]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!isEdit && mode === "file" && !file) return setError("Choose a file to upload");
    if (mode === "link" && !linkType) return setError("Paste a valid link starting with https://");
    setError("");

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      project: form.project.trim(),
      notes: form.notes.trim(),
      recordDate: form.recordDate,
    };
    if (mode === "link") payload.link = form.link.trim();
    if (!isEdit && mode === "file") {
      payload.file = file;
      const ready = readRef.current ? await readRef.current : table;
      if (ready) {
        payload.tableColumns = JSON.stringify(ready.columns);
        payload.tableRows = JSON.stringify(ready.rows);
      }
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit details" : "Add data"}
            </h2>
            <p className="text-xs text-gray-500">
              {isEdit
                ? "Update title, category, date or notes."
                : "Upload a file or save a Google Sheet / Doc / Form link."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
              {[
                { id: "file", label: "Upload file", Icon: CloudUpload },
                { id: "link", label: "Add link", Icon: Link2 },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMode(id);
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    mode === id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          )}

          {mode === "file" && !isEdit && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                dragging ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <CloudUpload size={26} className="mx-auto text-emerald-500" />
              {file ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {file.name}{" "}
                    <span className="font-normal text-gray-400">· {formatBytes(file.size)}</span>
                  </p>
                  {reading && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Loader2 size={12} className="animate-spin" /> Reading table from file…
                    </p>
                  )}
                  {!reading && table && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-emerald-600">
                      <Table2 size={12} /> {table.rows.length} rows · {table.columns.length} columns ready to save
                    </p>
                  )}
                  {!reading && !table && canExtractTable(file.name) && (
                    <p className="mt-1 text-xs text-gray-400">No table found — the file will still be saved.</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    Drop a file here or click to browse
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    PDF, Excel, CSV, Word, PowerPoint, images, ZIP · up to {MAX_FILE_MB} MB
                  </p>
                </>
              )}
            </div>
          )}

          {isEdit && initialData?.sourceType === "file" && (
            <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
              File: <span className="font-medium text-gray-700">{initialData.file?.originalName}</span>
            </p>
          )}

          {mode === "link" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Link *</label>
              <input
                value={form.link}
                onChange={set("link")}
                placeholder="https://docs.google.com/spreadsheets/d/…"
                className={inputCls}
              />
              {form.link && (
                <p className={`mt-1 text-xs ${linkType ? "text-emerald-600" : "text-red-500"}`}>
                  {linkType ? `Detected: ${docTypeMeta(linkType).label}` : "Not a valid URL"}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Title *</label>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Leads Sheet – Park Avenue"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
              <input
                value={form.category}
                onChange={set("category")}
                list="data-library-categories"
                placeholder="Leads, Reports…"
                className={inputCls}
              />
              <datalist id="data-library-categories">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Data date</label>
              <input
                type="date"
                value={form.recordDate}
                onChange={set("recordDate")}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Project / Tag</label>
            <input
              value={form.project}
              onChange={set("project")}
              placeholder="Optional — e.g. Park Avenue"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              placeholder="Optional"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          {loading && mode === "file" && !isEdit && progress > 0 && (
            <div className="mr-auto flex items-center gap-2 text-xs text-gray-500">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              {progress}%
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
            style={{ background: "#27AE60" }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save changes" : "Save to library"}
          </button>
        </div>
      </form>
    </div>
  );
}
