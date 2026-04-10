
import { Globe, Hash, MessageSquare, Trash2 } from "lucide-react";
import { CAT_COLOR, getStatusMeta } from "../utils/constants";
import { countVars, formatDate } from "../utils/helper";


export const TemplateCard = ({ item, onView, onEdit, onDelete }) => {
  const sm = getStatusMeta(item.status);
  const Icon = sm.icon;

  const bodyComp = item.components?.find((c) => c.type === "BODY");
  const btnComp = item.components?.find((c) => c.type === "BUTTONS");
  const hdrComp = item.components?.find((c) => c.type === "HEADER");
  const varCount = countVars(bodyComp?.text || "");

  return (
    <div
      onClick={() => onView(item)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#C2EDD6] transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] border border-[#C2EDD6] flex items-center justify-center text-[#27AE60] flex-shrink-0">
          <MessageSquare size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate font-mono">
            {item.name
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sm.color}`}
            >
              <Icon size={11} /> {sm.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CAT_COLOR[item.category] || "bg-gray-100 text-gray-500 border-gray-200"}`}
            >
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
              <Globe size={9} /> {item.language}
            </span>
            {hdrComp && hdrComp.format !== "TEXT" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
                {hdrComp.format}
              </span>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {bodyComp?.text && (
        <div className="mx-4 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            Body
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {bodyComp.text}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {varCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <Hash size={9} /> {varCount} var{varCount > 1 ? "s" : ""}
            </span>
          )}
          {btnComp?.buttons?.length > 0 && (
            <span className="text-[10px] text-gray-400 font-semibold">
              · {btnComp.buttons.length} btn
              {btnComp.buttons.length > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[10px] font-mono text-gray-300">
            #{item.id || item._id || ""}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          {formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
};