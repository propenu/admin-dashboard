// src/pages/Agents/components/DeleteConfirmModal.jsx
import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete Agent</h3>
            <p className="text-sm text-slate-600">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-slate-700 mb-6">
          Are you sure you want to delete this agent? All associated data will
          be permanently removed.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
          >
            Delete Agent
          </button>
        </div>
      </div>
    </div>
  );
}
