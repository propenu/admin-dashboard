import { FileText, MessageSquare, Link2, PhoneIcon } from "lucide-react";
import { buildPayload } from "../../utils/payloadBuilder";
import { LANGUAGES, MEDIA_ICON } from "../../utils/constants";
import { applyVars, countVars } from "../../utils/helper";



export const PreviewPanel = ({ form }) => {
  const bodyText = applyVars(form.body.text, form.body.examples);
  const headerText =
    form.header.enabled && form.header.format === "TEXT"
      ? form.header.text
      : "";

  const renderHtml = (text) =>
    text
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~(.*?)~/g, "<s>$1</s>")
      .replace(/\n/g, "<br/>");

  return (
    <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Template Preview
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* WhatsApp UI mock */}
      <div className="bg-[#ECE5DD] rounded-2xl p-3 border border-gray-200">
        <div className="flex items-center gap-2 bg-[#075E54] rounded-xl px-3 py-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={13} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-none">Propenu</p>
            <p className="text-green-300 text-[9px]">Business Account</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] overflow-hidden">
            {/* Header preview */}
            {form.header.enabled && (
              <div
                className={`px-3 pt-3 pb-1 ${form.header.format !== "TEXT" ? "bg-gray-100" : ""}`}
              >
                {form.header.format === "TEXT" ? (
                  <p className="text-sm font-bold text-gray-900">
                    {headerText || (
                      <span className="text-gray-300 italic font-normal text-xs">
                        Header text…
                      </span>
                    )}
                  </p>
                ) : form.header.format === "IMAGE" &&
                  form.header.mediaPreview ? (
                  <img
                    src={form.header.mediaPreview}
                    alt="header"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : form.header.format === "VIDEO" &&
                  form.header.mediaPreview ? (
                  <video
                    src={form.header.mediaPreview}
                    className="w-full h-24 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-200 rounded-lg flex flex-col items-center justify-center gap-1">
                    {MEDIA_ICON[form.header.format]}
                    <span className="text-xs text-gray-400">
                      {form.header.format}
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Body */}
            <div className="px-3 py-2">
              {form.body.text ? (
                <p
                  className="text-xs text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderHtml(bodyText) }}
                />
              ) : (
                <p className="text-xs text-gray-300 italic">
                  Message body will appear here…
                </p>
              )}
            </div>
            {/* Footer */}
            {form.footer.enabled && form.footer.text && (
              <div className="px-3 pb-1">
                <p className="text-[10px] text-gray-400">{form.footer.text}</p>
              </div>
            )}
            <div className="flex justify-end px-3 pb-2">
              <span className="text-[9px] text-gray-400">12:15 ✓✓</span>
            </div>
            {/* Buttons */}
            {form.buttons.length > 0 && (
              <div className="border-t border-gray-100">
                {form.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075E54] ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    {btn.type === "URL" && <Link2 size={11} />}
                    {btn.type === "PHONE_NUMBER" && <PhoneIcon size={11} />}
                    {btn.text || (
                      <span className="text-gray-300 italic">Button label</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Payload */}
      {/* <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
          <FileText size={13} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            API Payload
          </span>
        </div>
        <pre className="p-3 text-[10px] text-gray-600 font-mono whitespace-pre-wrap break-all leading-relaxed bg-gray-50 max-h-52 overflow-y-auto">
          {JSON.stringify(buildPayload(form), null, 2)}
        </pre>
      </div> */}

      {/* Summary */}
      {/* <div className="border border-gray-200 rounded-2xl p-3 bg-white">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
          Summary
        </p>
        {[
          ["Name", form.name || "—"],
          [
            "Language",
            LANGUAGES.find((l) => l.code === form.language)?.label ||
              form.language,
          ],
          ["Category", form.category],
          ["Variables", countVars(form.body.text)],
          ["Buttons", form.buttons.length],
          ["Header", form.header.enabled ? form.header.format : "None"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0"
          >
            <span className="text-gray-400 font-semibold">{k}</span>
            <span className="font-bold text-gray-700">{String(v)}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
};
