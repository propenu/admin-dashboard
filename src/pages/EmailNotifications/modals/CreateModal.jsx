//src/pages/EmailNotifications/modals/Modal.jsx

import { X } from "lucide-react";

export const Modal = ({ title, icon, wide, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    <div
      style={{ animation: "slideUp .25s cubic-bezier(.22,1,.36,1)" }}
      className={`bg-white rounded-t-2xl md:rounded-2xl w-full ${wide ? "md:max-w-4xl" : "md:max-w-lg"} max-h-[94vh] flex flex-col shadow-2xl`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {icon} {title}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  </div>
);
