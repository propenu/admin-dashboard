import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock3,
  FileText,
  Inbox,
  Mail,
  MessageCircle,
  Zap,
} from "lucide-react";

export const WHATSAPP_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    description: "Quotas, stats, and quick actions",
    icon: Zap,
  },
  {
    id: "templates",
    label: "Template Creation",
    description: "Create and review Meta templates",
    icon: FileText,
  },
  {
    id: "inbox",
    label: "Inbox",
    description: "Reply to customer chats",
    icon: Inbox,
  },
  {
    id: "campaigns",
    label: "Campaign History",
    description: "Track campaign runs",
    icon: Clock3,
  },
  {
    id: "logs",
    label: "WhatsApp Logs",
    description: "Message delivery logs",
    icon: Activity,
  },
];

/**
 * Layout matches mockup:
 * [ Email | WhatsApp + section nav ] | [ main content fills rest ]
 */
export default function WhatsAppShell({
  section = "inbox",
  onSectionChange,
  children,
  fullBleed = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-4.5rem)] min-h-[620px] w-full bg-[#f7fbf8]">
      <style>{`
        @keyframes waNavGlow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.035);
          }
        }
      `}</style>

      {/* LEFT COLUMN — channel switch + section menu */}
      <aside className="hidden md:flex w-[240px] xl:w-[268px] shrink-0 flex-col border-r border-emerald-100 bg-white shadow-[8px_0_24px_rgba(16,185,129,0.06)]">
        <div className="shrink-0 border-b border-emerald-50 p-3">
          <div className="inline-flex w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 p-1 shadow-[0_6px_16px_rgba(16,185,129,0.08)]">
            <button
              type="button"
              onClick={() => navigate("/email-notifications")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.10)]"
            >
              <Mail size={14} />
              Email
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563eb] px-2.5 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)]"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
          {WHATSAPP_SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <div key={item.id} className="relative">
                {active ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-[3px] rounded-[18px] bg-[#27AE60]/35 blur-md motion-safe:animate-[waNavGlow_3.2s_ease-in-out_infinite]"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => onSectionChange?.(item.id)}
                  className={`relative z-[1] w-full rounded-2xl px-3 py-2.5 text-left ${
                    active
                      ? "bg-[#27AE60] shadow-[0_8px_18px_rgba(37,211,102,0.28)]"
                      : "border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50/80 hover:shadow-[0_8px_18px_rgba(16,185,129,0.14)]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold leading-tight ${
                          active ? "text-white" : "text-[#0f3d2e]"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] leading-snug ${
                          active ? "text-[#e9fff2]" : "text-[#5c7d6d]"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT — main workspace (fills remaining 100%) */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile channel + sections */}
        <div className="md:hidden shrink-0 border-b border-emerald-100 bg-white px-3 py-2 space-y-2">
          <div className="inline-flex w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 p-1">
            <button
              type="button"
              onClick={() => navigate("/email-notifications")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold text-slate-600"
            >
              <Mail size={14} /> Email
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563eb] px-2 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)]"
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {WHATSAPP_SECTIONS.map((item) => (
              <div key={item.id} className="relative shrink-0">
                {section === item.id ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 rounded-full bg-[#27AE60]/35 blur-md motion-safe:animate-[waNavGlow_3.2s_ease-in-out_infinite]"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => onSectionChange?.(item.id)}
                  className={`relative z-[1] rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                    section === item.id
                      ? "bg-[#27AE60] text-white shadow-[0_8px_18px_rgba(37,211,102,0.28)]"
                      : "bg-emerald-50 text-[#0f3d2e]"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        <main
          className={`min-h-0 min-w-0 flex-1 ${
            fullBleed ? "flex flex-col overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
