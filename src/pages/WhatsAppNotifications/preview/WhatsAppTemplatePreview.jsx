import {
  CheckCheck,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Phone,
  PhoneCall,
  Reply,
  UserRound,
  Video,
  Workflow,
} from "lucide-react";

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

function buttonIcon(type) {
  switch (String(type || "").toUpperCase()) {
    case "URL":
      return ExternalLink;
    case "PHONE_NUMBER":
      return Phone;
    case "VOICE_CALL":
      return PhoneCall;
    case "FLOW":
      return Workflow;
    case "COPY_CODE":
      return Copy;
    case "SHARE_CONTACT":
      return UserRound;
    case "QUICK_REPLY":
    default:
      return Reply;
  }
}

function MediaPlaceholder({ icon: Icon, label }) {
  return (
    <div className="flex aspect-[16/10] flex-col items-center justify-center gap-1.5 bg-[#dbe4dc]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#128C7E] shadow-sm">
        <Icon size={20} strokeWidth={1.7} />
      </div>
      {label ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Recipient-style WhatsApp chat preview.
 */
export function WhatsAppTemplatePreview({
  headerFormat = "",
  headerText = "",
  headerImage = "",
  locationName = "",
  locationAddress = "",
  bodyText = "",
  footerText = "",
  buttons = [],
  timeLabel = "",
  businessName = "Propenu",
}) {
  const format = String(headerFormat || "").toUpperCase();
  const showImage = format === "IMAGE";
  const showVideo = format === "VIDEO";
  const showDocument = format === "DOCUMENT";
  const showLocation = format === "LOCATION";
  const showTextHeader = format === "TEXT" && headerText;
  const hasMedia = showImage || showVideo || showDocument || showLocation;

  return (
    <div className="w-full overflow-hidden rounded-[22px] border border-emerald-100 bg-[#0b141a] shadow-[0_12px_28px_rgba(16,185,129,0.14)]">
      <div className="flex items-center gap-2 bg-[#008069] px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
          <span className="text-[11px] font-bold">P</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">
            {businessName}
          </p>
          <p className="text-[10px] text-emerald-100/80">Business account</p>
        </div>
        <MoreVertical size={14} className="text-white/70" />
      </div>

      <div
        className="relative px-2.5 py-3"
        style={{
          backgroundColor: "#efeae2",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(0,0,0,0.035) 0, transparent 28%), radial-gradient(circle at 88% 72%, rgba(0,0,0,0.03) 0, transparent 24%)",
        }}
      >
        <div className="relative ml-0.5 max-w-full overflow-hidden rounded-[10px] rounded-tl-sm bg-white shadow-[0_1px_1px_rgba(11,20,26,0.13)]">
          {showImage ? (
            headerImage ? (
              <img
                src={headerImage}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <MediaPlaceholder icon={ImageIcon} label="Image" />
            )
          ) : null}

          {showVideo ? <MediaPlaceholder icon={Video} label="Video" /> : null}

          {showDocument ? (
            <div className="flex items-center gap-2.5 border-b border-[#e9edef] bg-[#f0f2f5] px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#00a884] shadow-sm">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-[#111b21]">
                  Document.pdf
                </p>
                <p className="text-[10px] text-[#667781]">PDF · sample</p>
              </div>
            </div>
          ) : null}

          {showLocation ? (
            <div>
              <div className="relative flex aspect-[16/10] items-center justify-center bg-[#d7e4d4]">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(#c5d4c8 1px, transparent 1px), linear-gradient(90deg, #c5d4c8 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#ea4335] text-white shadow-md">
                  <MapPin size={18} />
                </div>
              </div>
              {(locationName || locationAddress) && (
                <div className="border-b border-[#e9edef] bg-[#f6f6f6] px-3 py-1.5">
                  {locationName ? (
                    <p className="text-[12px] font-semibold text-[#111b21]">
                      {locationName}
                    </p>
                  ) : null}
                  {locationAddress ? (
                    <p className="text-[11px] text-[#667781]">{locationAddress}</p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {showTextHeader ? (
            <p
              className={`px-3 text-[13px] font-bold text-[#111b21] ${
                hasMedia ? "pt-2" : "pt-2.5"
              }`}
            >
              {headerText}
            </p>
          ) : null}

          <div className="px-3 pb-1.5 pt-2">
            {bodyText ? (
              <p
                className="whitespace-pre-wrap text-[13px] leading-[1.4] text-[#111b21]"
                dangerouslySetInnerHTML={{
                  __html: formatPreviewHtml(bodyText),
                }}
              />
            ) : (
              <p className="text-[12px] italic text-slate-400">
                Your message will appear here
              </p>
            )}
            {footerText ? (
              <p className="mt-1.5 text-[11px] leading-snug text-[#667781]">
                {footerText}
              </p>
            ) : null}
            <div className="mt-1 flex items-center justify-end gap-0.5 text-[#667781]">
              <span className="text-[10px] leading-none">{timeLabel || "now"}</span>
              <CheckCheck size={13} className="text-[#53bdeb]" />
            </div>
          </div>

          {buttons?.length ? (
            <div className="border-t border-[#e9edef] bg-white">
              {buttons.map((btn, i) => {
                const type = String(btn.type || "").toUpperCase();
                const Icon = buttonIcon(type);
                const label =
                  type === "COPY_CODE"
                    ? btn.text || "Copy offer code"
                    : btn.text || "Button";
                return (
                  <div
                    key={`${label}-${i}`}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#00a884] ${
                      i > 0 ? "border-t border-[#e9edef]" : ""
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppTemplatePreview;
