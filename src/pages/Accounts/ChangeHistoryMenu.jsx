import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Clock, History, Lock, Pencil, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useDeletedAccess } from "../../features/property/useDeletedAccess";
import { useMyPendingAccessAreas } from "../../features/property/useAccessRequests";
import RequestAccessModal from "../../components/access/RequestAccessModal";
import DeletedAccessPanel from "../Properties/DeletedAccessPanel";

const ITEMS = [
  { area: "editedSubscriptions", label: "Edited subscriptions", hint: "Who created or changed price, discount, duration", icon: Pencil, tone: "bg-sky-100 text-sky-700", action: "updated" },
  { area: "deletedSubscriptions", label: "Deleted subscriptions", hint: "Plans removed permanently", icon: Trash2, tone: "bg-rose-100 text-rose-700", action: "deleted" },
];

const noAccessMessage = (approver) =>
  `You don't have access to this history page. Please ask ${approver} to enable it, or raise a ticket for hierarchy access.`;

/** Header button for the edited / deleted subscription history, gated by the hierarchy enable switches. */
export default function ChangeHistoryMenu() {
  const navigate = useNavigate();
  const access = useDeletedAccess();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [requestArea, setRequestArea] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const width = 290;

  const isSuperAdmin = access.level === "super_admin";
  const canRequest = Boolean(access.access) && !isSuperAdmin;
  const pendingAreas = useMyPendingAccessAreas(canRequest);
  const approverLabel = access.level === "head" ? "Super Admin" : "your head";
  const requestable = canRequest ? ITEMS.filter((item) => !access[item.area]?.view) : [];

  useEffect(() => {
    if (!open || !buttonRef.current) return undefined;
    const place = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      const left = Math.max(8, Math.min(rect.right - width, viewport - width - 8));
      setPos({ top: rect.bottom + 6, left });
    };
    place();
    const close = () => setOpen(false);
    const onScroll = (e) => !menuRef.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (item) => {
    setOpen(false);
    if (!access[item.area]?.view) {
      toast.error(noAccessMessage(approverLabel), { duration: 6000 });
      return;
    }
    navigate(`/builder-plans/history?action=${item.action}`);
  };

  const renderItem = (item, index) => {
    const Icon = item.icon;
    const allowed = Boolean(access[item.area]?.view);
    return (
      <button
        key={item.area}
        type="button"
        onClick={() => go(item)}
        style={{ animation: `historyMenuItem .18s ease-out ${Math.min(index, 10) * 25}ms both` }}
        className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-emerald-50/70"
      >
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${allowed ? item.tone : "bg-slate-100 text-slate-400"}`}>
          <Icon size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[12px] font-semibold group-hover:text-[#219653] ${allowed ? "text-slate-800" : "text-slate-500"}`}>{item.label}</span>
          <span className="block truncate text-[10px] text-slate-400">{allowed ? item.hint : "Not enabled for you"}</span>
        </span>
        {allowed
          ? <ChevronRight size={13} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#27AE60]" />
          : <Lock size={12} className="text-slate-300" />}
      </button>
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-xs font-medium shadow-sm transition ${
          open ? "border-[#27AE60] text-[#219653] ring-2 ring-emerald-100" : "border-slate-200 text-slate-700 hover:border-emerald-200 hover:text-[#219653]"
        }`}
      >
        <History size={16} />
        Change history
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <>
          <style>{"@keyframes historyMenuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}@keyframes historyMenuItem{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}"}</style>
          <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            className="fixed overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/15"
            style={{ zIndex: 10001, top: pos.top, left: pos.left, width, animation: "historyMenuIn .16s ease-out" }}
          >
            <div className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-emerald-50">Change history</p>
            </div>
            <div className="space-y-0.5 p-1.5">{ITEMS.map(renderItem)}</div>

            {access.canManage && (
              <div className="border-t border-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setPanelOpen(true);
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-emerald-50/70"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-[#219653]"><ShieldCheck size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-slate-800 group-hover:text-[#219653]">History access</span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {isSuperAdmin ? "Enable these pages for all heads" : "Enable these pages for my team"}
                    </span>
                  </span>
                  <ChevronRight size={13} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#27AE60]" />
                </button>
              </div>
            )}

            {requestable.length > 0 && (
              <div className="border-t border-slate-100 bg-amber-50/40 p-1.5">
                <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Request access from {approverLabel}
                </p>
                {requestable.map(({ area, label }) => {
                  const pending = pendingAreas.has(area);
                  return (
                    <button
                      key={`request-${area}`}
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setOpen(false);
                        setRequestArea(area);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#219653] disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
                    >
                      {pending ? <Clock className="h-4 w-4 text-amber-500" /> : <Send className="h-4 w-4 text-emerald-600" />}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {pending && (
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Pending</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>,
        document.body,
      )}

      {panelOpen && <DeletedAccessPanel group="subscriptions" onClose={() => setPanelOpen(false)} />}
      {requestArea && (
        <RequestAccessModal area={requestArea} approverLabel={approverLabel} onClose={() => setRequestArea("")} />
      )}
    </>
  );
}
