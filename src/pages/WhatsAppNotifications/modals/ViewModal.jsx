import { Eye, X } from "lucide-react";
import { applyVars, countVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";

const STATUS_TONE = {
  APPROVED: "text-emerald-700",
  PENDING: "text-amber-600",
  REJECTED: "text-rose-600",
  PAUSED: "text-slate-500",
};

/**
 * Template review modal — structure + live WhatsApp preview.
 */
export function ViewModal({ item, onClose }) {
  if (!item) return null;

  const bodyComp = item.components?.find((c) => c.type === "BODY") || {};
  const headerComp = item.components?.find((c) => c.type === "HEADER") || {};
  const footerComp = item.components?.find((c) => c.type === "FOOTER") || {};
  const btnComp = item.components?.find((c) => c.type === "BUTTONS") || {};
  const varCount = countVars(bodyComp.text || "");
  const examples = bodyComp.example?.body_text?.[0] || [];
  const previewBody = applyVars(bodyComp.text || "", examples);
  const headerImage =
    headerComp.example?.header_handle?.[0] ||
    headerComp.example?.header_url?.[0] ||
    "";
  const status = String(item.status || "PENDING").toUpperCase();

  const nowLabel = new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const meta = [
    { label: "Status", value: status, tone: STATUS_TONE[status] || "text-slate-800" },
    { label: "Category", value: item.category || "—" },
    { label: "Language", value: item.language || "—" },
    {
      label: "Header",
      value: headerComp.type ? headerComp.format || "TEXT" : "NONE",
    },
  ];

  const buttons = (btnComp.buttons || []).map((b) => ({
    type: b.type,
    text: b.text,
    url: b.url,
    phone: b.phone_number,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[min(820px,88vh)] w-full max-w-[960px] flex-col overflow-hidden rounded-[28px] bg-[#f7fbf8] shadow-[0_24px_80px_rgba(16,185,129,0.16)]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-emerald-100 bg-white px-6 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_8px_18px_rgba(37,211,102,0.35)]">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-semibold text-slate-900">
                {item.name}
              </h2>
              <p className="mt-1 text-[12px] text-slate-500">
                Template structure, review status, and live-style preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-emerald-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {meta.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-emerald-100 bg-white px-3.5 py-3 shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  {m.label}
                </p>
                <p
                  className={`mt-1.5 text-sm font-semibold ${
                    m.tone || "text-slate-800"
                  }`}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-3">
              <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Message body
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700">
                  {bodyComp.text || "—"}
                </p>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Variables
                </p>
                {varCount === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No variables.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {Array.from({ length: varCount }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[12px] font-semibold text-emerald-700">
                          {`{{${i + 1}}}`}
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className="font-medium text-slate-700">
                          {examples[i] || "sample"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Components
                </p>
                <div className="mt-2 divide-y divide-emerald-50">
                  {(item.components || []).map((c, i) => {
                    let detail = "—";
                    if (c.format) detail = c.format;
                    else if (c.buttons?.length)
                      detail = `${c.buttons.length} buttons`;
                    else if (c.text) detail = "TEXT";
                    return (
                      <div
                        key={`${c.type}-${i}`}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="font-semibold text-slate-700">
                          {c.type}
                        </span>
                        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
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
            </div>

            <aside className="min-w-0">
              <div className="mb-2">
                <h3 className="text-[14px] font-semibold text-slate-900">
                  WhatsApp Preview
                </h3>
                <p className="text-[12px] text-slate-500">
                  Template as it will appear in chat.
                </p>
              </div>
              <WhatsAppTemplatePreview
                headerFormat={headerComp.format || ""}
                headerText={
                  headerComp.format === "TEXT"
                    ? applyVars(headerComp.text || "", [
                        headerComp.example?.header_text?.[0] || "",
                      ])
                    : ""
                }
                headerImage={
                  String(headerImage).startsWith("http") ? headerImage : ""
                }
                bodyText={previewBody || bodyComp.text || ""}
                footerText={footerComp.text || ""}
                buttons={buttons}
                timeLabel={nowLabel}
                businessName="WhatsApp Business"
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
