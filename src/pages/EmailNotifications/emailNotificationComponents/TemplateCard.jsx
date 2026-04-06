
import {
  Trash2,
  Edit2,
  Mail,
  Send,
} from "lucide-react";
import { getCatMeta, formatDate } from "../utils/Helpers";


const TemplateCard = ({ item, onView, onEdit, onDelete, onSend }) => {
  const meta = getCatMeta(item.category);
  const vars = Array.isArray(item.variables) ? item.variables : [];
  return (
    <div
      onClick={() => onView(item)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
    >


      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
          <Mail size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">
            {item.name}
          </p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
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
        <div
          className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => onSend(item)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
      <div className="mx-4 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
          Subject
        </p>
        <p className="text-xs font-medium text-gray-600 truncate">
          {item.subject}
        </p>
      </div>


      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Vars:
          </span>
          {vars.length > 0 ? (
            vars.slice(0, 5).map((v, i) => {
              const name = typeof v === "string" ? v : v?.name;
              return (
                <span
                  key={i}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-green-50 border border-green-100 text-green-700"
                >
                  {`{{${name}}}`}
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-gray-300">None</span>
          )}
          {vars.length > 5 && (
            <span className="text-[10px] text-gray-400">
              +{vars.length - 5}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">
          {formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
};



export default TemplateCard;