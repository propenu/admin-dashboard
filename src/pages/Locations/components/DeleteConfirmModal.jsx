// locations/components/DeleteConfirmModal.jsx
import { Trash2, Building2, MapPin, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({
  show,
  title,
  type, // 'CITY' or 'LOCALITY'
  onConfirm,
  onClose,
  loading,
  success,
  clearSuccess,
}) {
  useEffect(() => {
    if (!success) return;

    toast.success(success);
    onClose();
    clearSuccess();
  }, [success, onClose, clearSuccess]);

  const isCity = type === "CITY";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className={`p-6 ${isCity ? 'bg-red-500' : 'bg-orange-500'} text-white relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  {isCity ? (
                    <Building2 size={32} />
                  ) : (
                    <MapPin size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Delete {isCity ? "City" : "Locality"}
                  </h3>
                  <p className="text-sm text-white/80">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4">
              {/* WARNING */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">
                    Are you absolutely sure?
                  </p>
                  <p className="text-yellow-700">
                    {isCity ? (
                      <>
                        Deleting this city will also <strong>permanently remove all localities</strong> associated with it.
                      </>
                    ) : (
                      <>
                        This locality will be <strong>permanently deleted</strong> from the database.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* TARGET INFO */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  {isCity ? "City to Delete" : "Locality to Delete"}
                </p>
                <p className="text-lg font-bold text-gray-800 break-words">
                  {title}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-3 px-4 ${
                    isCity ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                  } text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete {isCity ? "City" : "Locality"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}