import {
  CheckCheck,
  Eye,
  ExternalLink,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import { countVars } from "../utils/helper";

function renderWhatsAppHtml(text) {
  return String(text || "")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(/\n/g, "<br/>");
}

/**
 * Template review modal — structure + live WhatsApp preview.
 */
export function ViewModal({ item, onClose }) {
  if (!item) return null;

  const bodyComp = item.components?.find((c) => c.type === "BODY");
  const headerComp = item.components?.find((c) => c.type === "HEADER");
  const footerComp = item.components?.find((c) => c.type === "FOOTER");
  const btnComp = item.components?.find((c) => c.type === "BUTTONS");
  const varCount = countVars(bodyComp?.text || "");
  const examples = bodyComp?.example?.body_text?.[0] || [];

  const nowLabel = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const meta = [
    { label: "STATUS", value: item.status || "—" },
    { label: "CATEGORY", value: item.category || "—" },
    { label: "LANGUAGE", value: item.language || "—" },
    {
      label: "HEADER",
      value: headerComp ? headerComp.format || "TEXT" : "NONE",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                {item.name}
              </h2>
              <p className="text-sm text-slate-500">
                Template structure, review status, and live-style preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {meta.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {m.label}
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left structure */}
            <div className="space-y-3">
              <section className="rounded-xl border border-slate-200 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Message body
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {bodyComp?.text || "—"}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Variables
                </p>
                {varCount === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No variables.</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {Array.from({ length: varCount }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-700">
                          {`{{${i + 1}}}`}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-600">
                          {examples[i] || "sample"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Components
                </p>
                <div className="mt-2 divide-y divide-slate-100">
                  {(item.components || []).map((c, i) => {
                    let detail = "—";
                    if (c.format) detail = c.format;
                    else if (c.buttons?.length)
                      detail = `${c.buttons.length} buttons`;
                    else if (c.text) detail = "TEXT";
                    return (
                      <div
                        key={`${c.type}-${i}`}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span className="font-bold text-slate-700">
                          {c.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {detail}
                        </span>
                      </div>
                    );
                  })}
                  {!item.components?.length ? (
                    <p className="py-2 text-sm text-slate-400">No components</p>
                  ) : null}
                </div>
              </section>

              {footerComp?.text ? (
                <section className="rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Footer
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{footerComp.text}</p>
                </section>
              ) : null}
            </div>

            {/* Right preview */}
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  WhatsApp Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Template as it will appear in chat.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#ECE5DD]">
                <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                    W
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      WhatsApp Business
                    </p>
                    <p className="text-[11px] text-emerald-200">online</p>
                  </div>
                  <Search size={16} className="text-white/80" />
                  <MoreVertical size={16} className="text-white/80" />
                </div>

                <div className="min-h-[320px] p-3">
                  <div className="max-w-[92%] overflow-hidden rounded-xl rounded-tl-sm bg-[#DCF8C6] shadow-sm">
                    {headerComp?.format === "IMAGE" ||
                    headerComp?.format === "VIDEO" ||
                    headerComp?.format === "DOCUMENT" ? (
                      <div className="flex h-28 flex-col items-center justify-center gap-1 bg-slate-200/80 text-slate-500">
                        <span className="text-xs font-semibold">
                          {headerComp.format === "IMAGE"
                            ? "Image header"
                            : `${headerComp.format} header`}
                        </span>
                      </div>
                    ) : null}
                    {headerComp?.format === "TEXT" && headerComp.text ? (
                      <p className="px-3 pt-2 text-sm font-bold text-slate-900">
                        {headerComp.text}
                      </p>
                    ) : null}

                    <div className="px-3 py-2">
                      <p
                        className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800"
                        dangerouslySetInnerHTML={{
                          __html: renderWhatsAppHtml(bodyComp?.text || ""),
                        }}
                      />
                    </div>

                    {footerComp?.text ? (
                      <p className="px-3 pb-1 text-[11px] text-slate-500">
                        {footerComp.text}
                      </p>
                    ) : null}

                    <div className="flex items-center justify-end gap-1 px-3 pb-1.5">
                      <span className="text-[10px] text-slate-500">
                        {nowLabel}
                      </span>
                      <CheckCheck size={14} className="text-[#53bdeb]" />
                    </div>

                    {btnComp?.buttons?.length ? (
                      <div className="border-t border-black/5 bg-white/50">
                        {btnComp.buttons.map((btn, i) => (
                          <div
                            key={`${btn.text}-${i}`}
                            className={`flex flex-col items-center px-3 py-2.5 text-xs font-semibold text-[#075E54] ${
                              i > 0 ? "border-t border-black/5" : ""
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {btn.type === "URL" ? (
                                <ExternalLink size={12} />
                              ) : null}
                              {btn.text}
                            </span>
                            {btn.url ? (
                              <span className="mt-0.5 max-w-full truncate text-[10px] font-normal text-slate-400">
                                {btn.url}
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
