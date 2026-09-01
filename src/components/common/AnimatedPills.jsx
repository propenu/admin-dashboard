import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Animated pill / segment control with sliding emerald highlight.
 */
export default function AnimatedPills({
  items = [],
  value,
  onChange,
  ariaLabel = "Options",
  size = "md",
  className = "",
  fullWidth = false,
}) {
  const trackRef = useRef(null);
  const btnRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  const measure = () => {
    const btn = btnRefs.current[value];
    const track = trackRef.current;
    if (!btn || !track) return;
    const trackBox = track.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    setPill({
      left: btnBox.left - trackBox.left,
      width: btnBox.width,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    measure();
  }, [value, items]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, items]);

  const trackH =
    size === "lg" ? "h-11 p-1" : size === "sm" ? "h-9 p-0.5" : "h-10 p-1";
  const btnH =
    size === "lg"
      ? "h-9 px-2.5 text-[12px]"
      : size === "sm"
        ? "h-8 px-2 text-[10px]"
        : "h-8 px-2 text-[11px]";

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center overflow-hidden rounded-full bg-slate-100 ${trackH} ${
        fullWidth ? "w-full min-w-0" : "max-w-full"
      } ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/20 transition-all duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
        style={{
          left: pill.left,
          width: pill.width,
          opacity: pill.ready ? 1 : 0,
        }}
      />
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            ref={(node) => {
              btnRefs.current[item.key] = node;
            }}
            onClick={() => onChange?.(item.key)}
            className={`relative z-[1] inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-bold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${btnH} ${
              fullWidth ? "min-w-0 flex-1" : ""
            } ${active ? "text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            {item.label}
            {item.badge > 0 ? (
              <span
                className={`ml-1 inline-grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[8px] font-black ${
                  active ? "bg-white/25 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
