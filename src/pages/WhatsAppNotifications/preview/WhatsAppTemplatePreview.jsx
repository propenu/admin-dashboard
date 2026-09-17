import { ExternalLink, Phone } from "lucide-react";

function formatPreviewHtml(text) {
  const escaped = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(
      /(\+?\d[\d\s-]{8,}\d)/g,
      '<span style="color:#128C7E;font-weight:600">$1</span>',
    )
    .replace(/\n/g, "<br/>");
}

/**
 * Recipient-style WhatsApp template card (white, header image, CTA buttons).
 */
export function WhatsAppTemplatePreview({
  headerFormat = "",
  headerText = "",
  headerImage = "",
  bodyText = "",
  footerText = "",
  buttons = [],
  timeLabel = "",
}) {
  const format = String(headerFormat || "").toUpperCase();
  const showImage = format === "IMAGE" || Boolean(headerImage);
  const showTextHeader = format === "TEXT" && headerText;

  return (
    <div className="w-full overflow-hidden rounded-[7px] bg-white shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
      {showImage ? (
        headerImage ? (
          <img
            src={headerImage}
            alt=""
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[#f0f2f5] text-xs text-slate-400">
            Header image
          </div>
        )
      ) : null}

      {showTextHeader ? (
        <p className="px-3 pt-2 text-[14px] font-bold text-[#111b21]">
          {headerText}
        </p>
      ) : null}

      <div className="px-3 pb-1.5 pt-2">
        {bodyText ? (
          <p
            className="whitespace-pre-wrap text-[14.5px] leading-[1.4] text-[#111b21]"
            dangerouslySetInnerHTML={{
              __html: formatPreviewHtml(bodyText),
            }}
          />
        ) : (
          <p className="text-xs italic text-slate-400">Message preview</p>
        )}
        {footerText ? (
          <p className="mt-1 text-[12px] leading-snug text-[#667781]">
            {footerText}
          </p>
        ) : null}
        {timeLabel ? (
          <p className="mt-0.5 text-right text-[11px] leading-none text-[#667781]">
            {timeLabel}
          </p>
        ) : null}
      </div>

      {buttons?.length ? (
        <div className="border-t border-[#e9edef] bg-white">
          {buttons.map((btn, i) => {
            const type = String(btn.type || "").toUpperCase();
            const Icon = type === "PHONE_NUMBER" ? Phone : ExternalLink;
            return (
              <div
                key={`${btn.text}-${i}`}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-[14px] font-medium text-[#00a884] ${
                  i > 0 ? "border-t border-[#e9edef]" : ""
                }`}
              >
                {type === "URL" || type === "PHONE_NUMBER" ? (
                  <Icon size={15} strokeWidth={2} />
                ) : null}
                <span>{btn.text || "Button"}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default WhatsAppTemplatePreview;
