import { Edit2, Mail } from "lucide-react";
import { getCatMeta, formatDate } from "../utils/Helpers";
import { Modal } from "./Modal";

export const ViewModal = ({ item, onClose, onEdit }) => {
  const meta = getCatMeta(item.category);
  const vars = Array.isArray(item.variables) ? item.variables : [];
  return (
    <Modal title={item.name} icon={<Mail size={16} />} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
            <Mail size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">{item.name}</h2>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              slug: {item.slug}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${item.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
              >
                {item.status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
                {item.status}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}
              >
                {meta.icon} {meta.label}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Subject
          </p>
          <p className="text-sm font-semibold text-gray-700">{item.subject}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Content
          </p>
          <div
            className="border border-gray-200 rounded-xl p-4 bg-white prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
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
                    className="font-mono text-xs px-2 py-0.5 rounded-lg bg-green-50 border border-green-200 text-green-700"
                  >
                    {`{{${name}}}`}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Created: {formatDate(item.createdAt)}</span>
          <span>Updated: {formatDate(item.updatedAt)}</span>
        </div>
        <button
          onClick={onEdit}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={15} /> Edit Template
        </button>
      </div>
    </Modal>
  );
};
