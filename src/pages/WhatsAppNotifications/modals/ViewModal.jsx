import { MessageSquare, Edit2, Globe, PhoneIcon, Link2 } from "lucide-react";
import { CAT_COLOR, getStatusMeta } from "../utils/constants";
import { Modal } from "./Modal";



export const ViewModal = ({ item, onClose, onEdit }) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY");
  const headerComp = item.components?.find((c) => c.type === "HEADER");
  const footerComp = item.components?.find((c) => c.type === "FOOTER");
  const btnComp = item.components?.find((c) => c.type === "BUTTONS");
  const sm = getStatusMeta(item.status);
  const Icon = sm.icon;

  return (
    <Modal
      title={item.name}
      icon={<MessageSquare size={16} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={22} className="text-[#27AE60]" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 font-mono break-all">
              {item.name}
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              ID: {item.id || item._id || "—"}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${sm.color}`}
              >
               <Icon size={10} /> {sm.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${CAT_COLOR[item.category] || "bg-gray-100 text-gray-500 border-gray-200"}`}
              >
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-500 border-gray-200">
                <Globe size={10} /> {item.language}
              </span>
            </div>
          </div>
        </div>

        {headerComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Header · {headerComp.format}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {headerComp.text || `[${headerComp.format} media]`}
            </p>
          </div>
        )}

        {bodyComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Body
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {bodyComp.text}
            </p>
            {bodyComp.example?.body_text?.[0]?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                  Variable Samples
                </p>
                {bodyComp.example.body_text[0].map((val, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-mono text-[#27AE60] font-semibold">{`{{${i + 1}}}`}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {footerComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Footer
            </p>
            <p className="text-sm text-gray-500">{footerComp.text}</p>
          </div>
        )}

        {btnComp?.buttons?.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              {btnComp.buttons.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[#075E54] font-semibold"
                >
                  {b.type === "URL" && <Link2 size={11} />}
                  {b.type === "PHONE_NUMBER" && <PhoneIcon size={11} />}
                  {b.text}
                  {b.url && (
                    <span className="text-gray-400 font-normal truncate max-w-[120px]">
                      · {b.url}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* <button
          onClick={onEdit}
          className="w-full py-2.5 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={15} /> Edit Template
        </button> */}
      </div>
    </Modal>
  );
};
