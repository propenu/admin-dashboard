import { ExternalLink, FileType, MapPin, Phone, Video } from "lucide-react";

function formatPreviewHtml(text) {
  const escaped = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(/```(.*?)```/g, "<code>$1</code>")
    .replace(
      /(\+?\d[\d\s-]{8,}\d)/g,
      '<span style="color:#128C7E;font-weight:600">$1</span>',
    )
    .replace(/\n/g, "<br/>");
}

/**
 * Recipient-style WhatsApp template card (Meta Create-template preview).
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
  const showVideo = format === "VIDEO";
  const showDocument = format === "DOCUMENT";
  const showLocation = format === "LOCATION";
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

      {showVideo ? (
        <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-[#111b21] text-white">
          <Video size={28} className="opacity-80" />
          <span className="text-xs opacity-70">Video header</span>
        </div>
      ) : null}

      {showDocument ? (
        <div className="flex items-center gap-3 border-b border-[#e9edef] bg-[#f0f2f5] px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#00a884] shadow-sm">
            <FileType size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#111b21]">
              Document.pdf
            </p>
            <p className="text-[11px] text-[#667781]">PDF document</p>
          </div>
        </div>
      ) : null}

      {showLocation ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8f0e6]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(#c5d4c8 1px, transparent 1px), linear-gradient(90deg, #c5d4c8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ea4335] text-white shadow-md">
              <MapPin size={20} />
            </div>
            <p className="rounded bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#111b21] shadow-sm">
              Project location
            </p>
          </div>
        </div>
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
