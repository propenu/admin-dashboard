import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Clock, Send, ShieldCheck, Trash2, Users } from "lucide-react";
import { useDeletedAccess } from "../../features/property/useDeletedAccess";
import { useMyPendingAccessAreas } from "../../features/property/useAccessRequests";
import RequestAccessModal from "../../components/access/RequestAccessModal";
import DeletedAccessPanel from "./DeletedAccessPanel";

const GROUP_ITEMS = {
  properties: [
    { area: "properties", label: "Deleted properties", path: "/properties/deleted", Icon: Trash2 },
    { area: "propertyLeads", label: "Deleted property leads", path: "/properties/deleted-leads", Icon: Users },
  ],
  projects: [
    { area: "projects", label: "Deleted projects", path: "/projects/deleted", Icon: Trash2 },
    { area: "projectLeads", label: "Deleted project leads", path: "/projects/deleted-leads", Icon: Users },
  ],
};

export default function DeletedMenu({ group = "properties" }) {
  const navigate = useNavigate();
  const access = useDeletedAccess();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const rootRef = useRef(null);

  const [requestArea, setRequestArea] = useState("");
  const items = GROUP_ITEMS[group] || GROUP_ITEMS.properties;
  const pages = items.filter((item) => access[item.area]?.view);
  const canRequest = Boolean(access.access) && access.level !== "super_admin";
  const requestable = canRequest ? items.filter((item) => !access[item.area]?.view) : [];
  const pendingAreas = useMyPendingAccessAreas(canRequest);
  const approverLabel = access.level === "head" ? "Super Admin" : "your head";

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!access.canManage && pages.length === 0 && requestable.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
      >
        <Trash2 className="h-4 w-4" />
        Deleted
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-xl border border-rose-100 bg-white py-1 shadow-xl"
        >
          {pages.map(({ area, label, path, Icon }) => (
            <button
              key={area}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate(path);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700"
            >
              <Icon className="h-4 w-4 text-rose-500" />
              {label}
            </button>
          ))}
          {access.canManage ? (
            <>
              {pages.length ? <div className="my-1 border-t border-slate-100" /> : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setPanelOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700"
              >
                <ShieldCheck className="h-4 w-4 text-rose-500" />
                Deleted access
              </button>
            </>
          ) : null}
          {requestable.length ? (
            <>
              {pages.length || access.canManage ? <div className="my-1 border-t border-slate-100" /> : null}
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Request access from {approverLabel}
              </p>
              {requestable.map(({ area, label }) => {
                const pending = pendingAreas.has(area);
                return (
                  <button
                    key={`request-${area}`}
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() => {
                      setOpen(false);
                      setRequestArea(area);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#128C45] disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
                  >
                    {pending ? (
                      <Clock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Send className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {pending ? (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        Pending
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </>
          ) : null}
        </div>
      ) : null}

      {panelOpen ? <DeletedAccessPanel group={group} onClose={() => setPanelOpen(false)} /> : null}
      {requestArea ? (
        <RequestAccessModal
          area={requestArea}
          approverLabel={approverLabel}
          onClose={() => setRequestArea("")}
        />
      ) : null}
    </div>
  );
}
