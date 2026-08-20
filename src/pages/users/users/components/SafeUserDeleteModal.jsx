import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

const CONFIRM_WORD = "DELETE";

/**
 * Super Admin only — permanent delete requires typing DELETE.
 */
export default function SafeUserDeleteModal({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open, user?._id]);

  if (!user) return null;

  const canDelete = typed === CONFIRM_WORD && !loading;
  const label = user.name || user.email || "this user";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="safe-user-delete-title"
          >
            <div className="relative bg-red-600 px-5 py-4 text-white">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-white/20 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 id="safe-user-delete-title" className="text-lg font-bold">
                    Permanent delete
                  </h2>
                  <p className="text-sm text-red-100">Super Admin only · cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-slate-600">
                You are about to permanently remove{" "}
                <strong className="text-slate-900">{label}</strong>
                {user.email ? (
                  <>
                    {" "}
                    (<span className="font-mono text-xs text-slate-500">{user.email}</span>)
                  </>
                ) : null}
                . Type <span className="font-mono font-bold text-red-600">{CONFIRM_WORD}</span>{" "}
                to confirm.
              </p>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Type {CONFIRM_WORD} to delete
                </span>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  disabled={loading}
                  placeholder={CONFIRM_WORD}
                  autoComplete="off"
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:opacity-60"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={() => onConfirm?.(user)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {loading ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
