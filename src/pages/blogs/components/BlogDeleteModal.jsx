// src/features/blogs/components/BlogDeleteModal.jsx
import React from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

const BlogDeleteModal = ({
  isOpen,
  blog,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
          <AlertTriangle size={22} className="text-red-500" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold text-gray-800">Delete Blog</h2>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-700">"{blog?.title}"</span>?
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(blog?._id || blog?.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
          >
            <Trash2 size={14} />
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDeleteModal;
