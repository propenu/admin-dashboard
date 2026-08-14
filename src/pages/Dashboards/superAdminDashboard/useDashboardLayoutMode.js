import { useEffect, useState } from "react";

/** Desktop dashboard starts at lg — avoids xl-only gap where wide laptops still get mobile tabs. */
export const DASHBOARD_DESKTOP_MIN_PX = 1024;

function readViewportWidth() {
  if (typeof window === "undefined") return DASHBOARD_DESKTOP_MIN_PX;
  // visualViewport tracks zoom / mobile browser chrome more reliably than innerWidth alone
  const vv = window.visualViewport?.width;
  if (typeof vv === "number" && Number.isFinite(vv) && vv > 0) return vv;
  return window.innerWidth || document.documentElement?.clientWidth || DASHBOARD_DESKTOP_MIN_PX;
}

/**
 * Cross-browser layout mode for Super Admin dashboard.
 * - compact: phone + tablet → bottom tabs
 * - desktop: large screens → full layout, no bottom tabs
 */
export function useDashboardLayoutMode(minDesktopPx = DASHBOARD_DESKTOP_MIN_PX) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return readViewportWidth() >= minDesktopPx;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const sync = () => {
      setIsDesktop(readViewportWidth() >= minDesktopPx);
    };

    sync();

    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia(`(min-width: ${minDesktopPx}px)`)
        : null;

    const onMq = () => sync();
    if (mq) {
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", onMq);
      } else if (typeof mq.addListener === "function") {
        mq.addListener(onMq);
      }
    }

    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    // orientation / browser UI chrome (Safari, Chrome mobile, etc.)
    window.addEventListener("orientationchange", sync);

    return () => {
      if (mq) {
        if (typeof mq.removeEventListener === "function") {
          mq.removeEventListener("change", onMq);
        } else if (typeof mq.removeListener === "function") {
          mq.removeListener(onMq);
        }
      }
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [minDesktopPx]);

  return {
    isDesktop,
    isCompact: !isDesktop,
  };
}
