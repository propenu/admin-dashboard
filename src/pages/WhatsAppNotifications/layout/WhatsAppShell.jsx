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
    <div className="flex h-[calc(100vh-4.5rem)] min-h-[620px] w-full bg-[#eef1f4]">
      {/* LEFT COLUMN — channel switch + section menu */}
      <aside className="hidden md:flex w-[240px] xl:w-[268px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-100 p-3">
          <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => navigate("/email-notifications")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              <Mail size={14} />
              Email
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] px-2.5 py-2 text-xs font-semibold text-white shadow-sm"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {WHATSAPP_SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange?.(item.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-[#25D366] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight">{item.label}</p>
                    <p
                      className={`mt-0.5 text-[11px] leading-snug ${
                        active ? "text-white/85" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT — main workspace (fills remaining 100%) */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile channel + sections */}
        <div className="md:hidden shrink-0 border-b border-slate-200 bg-white px-3 py-2 space-y-2">
          <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => navigate("/email-notifications")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600"
            >
              <Mail size={14} /> Email
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] px-2 py-2 text-xs font-semibold text-white"
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {WHATSAPP_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange?.(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                  section === item.id
                    ? "bg-[#25D366] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.label}
              </button>
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
