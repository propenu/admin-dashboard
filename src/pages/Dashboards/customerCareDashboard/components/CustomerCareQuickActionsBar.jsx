import {
  ArrowUpRight,
  BookOpen,
  Mail,
  MessageCircle,
  PhoneCall,
  Plus,
} from "lucide-react";

const actions = [
  { key: "create-ticket", label: "Create Ticket", icon: Plus, primary: true },
  { key: "log-callback", label: "Log Callback", icon: PhoneCall },
  { key: "send-email", label: "Send Email", icon: Mail },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "escalate", label: "Escalate", icon: ArrowUpRight },
  { key: "knowledge-base", label: "Knowledge Base", icon: BookOpen },
];

export default function CustomerCareQuickActionsBar({ onAction }) {
  return (
    <section className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50/80 px-2 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="mr-0.5 shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">
          Quick Actions
        </p>
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onAction(action.key)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${
              action.primary
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <action.icon className="h-3 w-3" />
            <span className="whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
