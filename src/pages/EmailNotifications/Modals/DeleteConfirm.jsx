import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "./CreateModal";



export const DeleteConfirm = ({ item, onClose, onConfirm, deleting }) => (
  <Modal title="Delete Template" icon={<Trash2 size={16} />} onClose={onClose}>
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <Trash2 size={28} className="text-red-400" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-800">
          Delete <span className="text-red-500">"{item.name}"</span>?
        </p>
        <p className="text-sm text-gray-400 mt-1">
          This action is permanent and cannot be undone.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full mt-2">
        <button
          onClick={onClose}
          className="py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {deleting && <Loader2 size={14} className="animate-spin" />}
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </Modal>
);