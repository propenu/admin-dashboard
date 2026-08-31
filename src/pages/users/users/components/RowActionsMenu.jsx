import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Power, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { canManageUserLifecycle } from "../../../../utils/userLifecycleAccess";

const MENU_WIDTH = 192; // w-48

export const RowActionsMenu = ({
  user,
  onOpenUser,
  actorRoleName = "",
  /** @deprecated use actorRoleName — kept for older call sites */
  isSuperAdmin = false,
  currentUserId = "",
  statusBusy = false,
  onActivate,
  onDeactivate,
  onRequestDelete,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    const place = () => {
      const btn = triggerRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const gap = 4;
      const estimatedHeight = 168;
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const spaceAbove = r.top - gap;
      const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      const left = Math.min(
        Math.max(8, r.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8,
      );

      setMenuStyle({
        position: "fixed",
        left,
        width: MENU_WIDTH,
        zIndex: 9999,
        ...(openUp
          ? { bottom: window.innerHeight - r.top + gap }
          : { top: r.bottom + gap }),
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      const t = event.target;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const userId = user?._id;
  if (!userId) return null;

  const targetRole = String(user?.roleName || user?.role || user?.roleId?.name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  const isSelf = Boolean(currentUserId && String(userId) === String(currentUserId));
  const actorRole =
    actorRoleName || (isSuperAdmin ? "super_admin" : "");
  const canManage =
    canManageUserLifecycle({
      actorRole,
      targetRole,
      isSelf,
    }) && typeof onActivate === "function";
  const isInactive = user?.isActive === false;

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={menuStyle}
            className="overflow-hidden rounded-xl border border-[#d9ebe0] bg-white py-1 shadow-lg shadow-slate-900/15"
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-[#102033] hover:bg-[#f4fbf6]"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (typeof onOpenUser === "function") onOpenUser(userId);
                else navigate(`/dashboard/users/${userId}`);
              }}
            >
              View user
            </button>

            {canManage ? (
              <>
                <div className="my-1 border-t border-slate-100" />
                {isInactive ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={statusBusy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onActivate?.(user);
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Activate
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={statusBusy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onDeactivate?.(user);
                    }}
                  >
                    <Power className="h-3.5 w-3.5" aria-hidden />
                    Deactivate
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={statusBusy}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onRequestDelete?.(user);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete…
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
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${user?.name || "user"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#12A150]/10 hover:text-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/15"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {menu}
    </div>
  );
};
