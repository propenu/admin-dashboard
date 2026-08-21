import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { getPersonTitleMeta, PERSON_TITLES } from "../fieldMeetingUtils";

/**
 * Animated, color-coded title dropdown for Field Meetings people form.
 */
export default function PersonTitleSelect({
  value = "Manager",
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = getPersonTitleMeta(value);

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

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition ${
          selected.active
        } shadow-sm`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" />
          <span className="truncate">{selected.label}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="inline-flex"
        >
          <ChevronDown className="h-3.5 w-3.5 opacity-90" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute left-0 right-0 z-40 mt-1.5 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          >
            {PERSON_TITLES.map((title, index) => {
              const isSelected = title.value === value;
              return (
                <motion.li
                  key={title.value}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.18 }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange?.(title.value);
                      setOpen(false);
                    }}
                    className={`mb-0.5 flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition hover:brightness-95 ${
                      isSelected ? title.active : `${title.tone} bg-white`
                    }`}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          isSelected ? "bg-white/85" : title.dot
                        }`}
                      />
                      <span className="truncate">{title.label}</span>
                    </span>
                    {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
