import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RowActionsMenu = ({ user, onOpenUser }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
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

  return (
    <div className="relative" ref={rootRef}>
      <button
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
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-xl border border-[#d9ebe0] bg-white py-1 shadow-lg"
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
        </div>
      ) : null}
    </div>
  );
};
