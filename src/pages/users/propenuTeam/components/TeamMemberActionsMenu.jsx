import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

/**
 * Compact animated actions menu for Team Directory (table + cards).
 */
export default function TeamMemberActionsMenu({
  busy = false,
  showAlign = false,
  showEdit = false,
  showLifecycle = false,
  isActive = true,
  onAlign,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  align = "right",
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, ready: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const hasAny = showAlign || showEdit || showLifecycle;
  if (!hasAny) {
    return <span className="text-slate-300">—</span>;
  }

  const place = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuW = 220;
    const pad = 8;
    let left = align === "left" ? rect.left : rect.right - menuW;
    left = Math.max(pad, Math.min(left, window.innerWidth - menuW - pad));
    const below = rect.bottom + 6;
    const approxH = 220;
    const top =
      below + approxH > window.innerHeight - pad
        ? Math.max(pad, rect.top - approxH - 6)
        : below;
    setCoords({ top, left, ready: true });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
  }, [open, align]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (
        btnRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onScroll = () => place();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold transition disabled:opacity-50";

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[10060] w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.18)] motion-safe:animate-[tlFadeUp_160ms_ease-out]"
          style={{
            top: coords.top,
            left: coords.left,
            opacity: coords.ready ? 1 : 0,
          }}
        >
          <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Manage member
          </p>
          {showAlign ? (
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onAlign?.();
              }}
              className={`${itemClass} text-emerald-800 hover:bg-emerald-50`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <MapPin size={14} />
              </span>
              Align locations
            </button>
          ) : null}
          {showEdit ? (
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className={`${itemClass} text-slate-700 hover:bg-slate-50`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <Pencil size={14} />
              </span>
              Edit profile
            </button>
          ) : null}
          {showLifecycle ? (
            <>
              {isActive ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    onDeactivate?.();
                  }}
                  className={`${itemClass} text-amber-800 hover:bg-amber-50`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Power size={14} />
                  </span>
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    onActivate?.();
                  }}
                  className={`${itemClass} text-emerald-800 hover:bg-emerald-50`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <RotateCcw size={14} />
                  </span>
                  Activate
                </button>
              )}
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  onDelete?.();
                }}
                className={`${itemClass} text-red-600 hover:bg-red-50`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </span>
                Delete permanently
              </button>
            </>
          ) : null}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        title="Actions"
        className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 ${
          open
            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800"
        }`}
      >
        <MoreHorizontal size={15} />
        {!compact ? <span className="hidden sm:inline">Actions</span> : null}
      </button>
      {menu}
    </div>
  );
}
