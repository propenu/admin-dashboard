
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmClass = "bg-red-600 hover:bg-red-700 text-white",
  icon,
  iconClass = "text-red-600",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2
          className={`text-lg font-bold flex items-center gap-2 ${iconClass}`}
        >
          {icon} {title}
        </h2>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
