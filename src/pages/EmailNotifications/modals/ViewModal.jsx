


// src/pages/EmailNotifications/modals/ViewModal.jsx
import { Edit2, Mail } from "lucide-react";
import { getCatMeta, formatDate } from "../utils/helpers";
import { Modal } from "./CreateModal";

export const ViewModal = ({ item, onClose, onEdit }) => {
  const meta = getCatMeta(item.category);
  const vars = Array.isArray(item.variables) ? item.variables : [];

  return (
    <Modal title={item.name} icon={<Mail size={16} />} onClose={onClose}>
      <div className="flex flex-col gap-4">

        {/* Header block */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
            <Mail size={20} className="sm:text-[22px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 break-words">{item.name}</h2>
            <p className="text-[10px] sm:text-xs font-mono text-gray-400 mt-0.5 break-all">
              slug: {item.slug}
            </p>
            <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                  item.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {item.status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                )}
                {item.status}
              </span>
              {/* Category badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${meta.color}`}
              >
                {meta.icon} {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Subject
          </p>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 break-words">{item.subject}</p>
        </div>

        {/* Content */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Content
          </p>
          <div
            className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-white prose prose-sm max-w-none text-gray-700 leading-relaxed overflow-x-auto text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>

        {/* Variables */}
        {vars.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Variables
            </p>
            <div className="flex flex-wrap gap-1.5">
              {vars.map((v, i) => {
                const name = typeof v === "string" ? v : v?.name;
                return (
                  <span
                    key={i}
                    className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-lg bg-green-50 border border-green-200 text-green-700"
                  >
                    {`{{${name}}}`}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
          <span>Created: {formatDate(item.createdAt)}</span>
          <span>Updated: {formatDate(item.updatedAt)}</span>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="w-full py-2.5 sm:py-3 bg-green-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={14} /> Edit Template
        </button>
      </div>
    </Modal>
  );
};