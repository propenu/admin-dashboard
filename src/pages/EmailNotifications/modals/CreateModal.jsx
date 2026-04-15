// src/pages/EmailNotifications/modals/CreateModal.jsx
import { X } from "lucide-react";

export const Modal = ({ title, icon, wide, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex  items-end sm:items-center max-sm:items-center  justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <style>{`
      @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(.97); }
        to   { opacity: 1; transform: scale(1);   }
      }
    `}</style>
    <div
      style={{
        animation: "slideUp .25s cubic-bezier(.22,1,.36,1)",
      }}
      className={`
        bg-white
        rounded-t-2xl sm:rounded-2xl *
        max-sm:rounded-2xl
        w-full
        lg:max-w-4xl
        md:max-w-2xl
        max-sm:max-w-xs
        max-h-[92vh] sm:max-h-[90vh]
        max-sm:max-h-[90vh]
        flex flex-col
        shadow-2xl

      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 flex-shrink-0">
        {/* Drag handle — mobile only */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-8 h-1 rounded-full bg-gray-200 sm:hidden" />
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mt-1 sm:mt-0">
          {icon}
          <span className="truncate max-w-[200px] xs:max-w-xs sm:max-w-full">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
          aria-label="Close modal"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 overscroll-contain">
        {children}
      </div>
    </div>
  </div>
);