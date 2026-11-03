import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  KeyRound,
  UserCog,
  Users,
  Network,
  ArrowLeftRight,
  UserPlus,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import {
  OPERATIONS_TABS,
  isOperationsPath,
  resolveOperationsTabId,
} from "./operationsNavConfig";

export const OPEN_TRANSFER_CREDENTIALS_EVENT = "propenu:open-transfer-credentials";
export const OPEN_ASSIGN_REPORTS_EVENT = "propenu:open-assign-reports";

const TAB_ICONS = {
  "create-role": Shield,
  "create-credentials": KeyRound,
  "user-permissions": UserCog,
  "team-directory": Users,
  "team-management": Network,
  "transfer-credentials": ArrowLeftRight,
  "assign-reports": UserPlus,
};

const RAIL = {
  track: "#f8fffb",
  stroke: "#27AE60",
  ink: "#0f3d2e",
  idle: "#5c7d6d",
  active: "#128C45",
};

const STROKE = 2;
const BEND = 12;
const CHIP_H = 42;

/** Same smooth bottom fillets as the product workspace strip. */
function outlinePath(w, h, bend, topR, stroke) {
  const r = bend;
  const inset = stroke / 2;
  const tr = Math.min(topR, Math.max(8, w / 2 - 4));
  const yb = h - inset;
  const yTop = inset;
  const stub = r;
  const k = r * 0.5522847498;
  const leftBend = `C ${-r + k} ${yb} 0 ${yb - r + k} 0 ${yb - r}`;
  const rightBend = `C ${w} ${yb - r + k} ${w + r - k} ${yb} ${w + r} ${yb}`;
  const outline = [
    `M ${-r - stub} ${yb}`,
    `L ${-r} ${yb}`,
    leftBend,
    `L 0 ${yTop + tr}`,
    `A ${tr} ${tr} 0 0 1 ${tr} ${yTop}`,
    `L ${w - tr} ${yTop}`,
    `A ${tr} ${tr} 0 0 1 ${w} ${yTop + tr}`,
    `L ${w} ${yb - r}`,
    rightBend,
    `L ${w + r + stub} ${yb}`,
  ].join(" ");
  const fill = [
    `M ${-r} ${yb}`,
    leftBend,
    `L 0 ${yTop + tr}`,
    `A ${tr} ${tr} 0 0 1 ${tr} ${yTop}`,
    `L ${w - tr} ${yTop}`,
    `A ${tr} ${tr} 0 0 1 ${w} ${yTop + tr}`,
    `L ${w} ${yb - r}`,
    rightBend,
    `L ${w + r} ${h}`,
    `L ${-r} ${h}`,
    "Z",
  ].join(" ");
  return { outline, fill };
}

function OpsChip({ active, label, Icon, onSelect }) {
  const localRef = useRef(null);
  const [box, setBox] = useState({ w: 120, h: CHIP_H + STROKE });

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el || !active) return undefined;
    const measure = () => {
      setBox({ w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [active, label]);

  const path = outlinePath(box.w, box.h, BEND, 10, STROKE);

  return (
    <div className={`ops-rail-item ${active ? "ops-rail-item--on" : ""}`}>
      <button
        ref={localRef}
        type="button"
        aria-expanded={active}
        onClick={onSelect}
        className={`ops-rail-chip ${active ? "ops-rail-chip--on" : ""}`}
      >
        {active ? (
          <svg
            className="ops-rail-outline"
            width={box.w + BEND * 4}
            height={box.h}
            viewBox={`${-(BEND * 2)} 0 ${box.w + BEND * 4} ${box.h}`}
            style={{ width: box.w + BEND * 4, height: box.h, maxWidth: "none" }}
            aria-hidden
          >
            <path d={path.fill} fill="#ffffff" stroke="none" />
            <path
              d={path.outline}
              fill="none"
              stroke={RAIL.stroke}
              strokeWidth={STROKE}
              strokeLinejoin="round"
              strokeLinecap="butt"
            />
          </svg>
        ) : null}
        {Icon ? (
          <Icon
            className="relative z-[2] h-3.5 w-3.5 shrink-0"
            strokeWidth={active ? 2.4 : 2}
            aria-hidden
          />
        ) : null}
        <span className="relative z-[2] inline-flex max-w-[5.75rem] items-center justify-center gap-0.5 text-center leading-tight">
          {label}
          <ChevronDown
            className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${
              active ? "rotate-180" : "rotate-0"
            }`}
            strokeWidth={2.4}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}

/**
 * Operations strip — same labels/icons/green colors.
 * Mobile: smooth bend selected tab (like product workspaces). Desktop: underline tabs.
 */
export default function OperationsHorizontalNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [actionOpenId, setActionOpenId] = useState(null);

  if (!isOperationsPath(pathname)) return null;

  const activeId = resolveOperationsTabId(pathname);

  const onSelect = (tab) => {
    if (tab.action === "openTranforCredentialsModal") {
      setActionOpenId(tab.id);
      window.dispatchEvent(new CustomEvent(OPEN_TRANSFER_CREDENTIALS_EVENT));
      return;
    }
    if (tab.action === "openAssignAgentModal") {
      setActionOpenId(tab.id);
      window.dispatchEvent(new CustomEvent(OPEN_ASSIGN_REPORTS_EVENT));
      return;
    }
    setActionOpenId(null);
    if (tab.path) navigate(tab.path);
  };

  return (
    <>
      <style>{`
        .ops-rail-mobile {
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-end;
          gap: ${BEND + 10}px;
          width: max-content;
          min-width: 100%;
          padding: 4px ${BEND + 6}px ${STROKE}px;
          background: linear-gradient(to top, ${RAIL.stroke} ${STROKE}px, ${RAIL.track} ${STROKE}px);
          overflow: visible;
        }
        .ops-rail-item {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          overflow: visible;
        }
        .ops-rail-item--on {
          z-index: 3;
        }
        .ops-rail-chip {
          position: relative;
          box-sizing: border-box;
          display: inline-flex;
          height: ${CHIP_H}px;
          max-width: 6.5rem;
          flex-shrink: 0;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 2px 6px 0;
          margin: 0;
          border: none;
          background: transparent;
          color: ${RAIL.idle};
          font-size: 9px;
          font-weight: 700;
          line-height: 1.1;
          white-space: normal;
          cursor: pointer;
          overflow: visible;
          -webkit-tap-highlight-color: transparent;
        }
        .ops-rail-chip--on {
          height: calc(${CHIP_H}px + ${STROKE}px);
          padding-bottom: ${STROKE}px;
          background: transparent;
          color: ${RAIL.active};
          margin-bottom: -${STROKE}px;
          z-index: 2;
        }
        .ops-rail-outline {
          position: absolute;
          left: -${BEND * 2}px;
          top: 0;
          max-width: none;
          pointer-events: none;
          overflow: visible;
          z-index: 1;
        }
      `}</style>

      {/* Mobile — smooth bend selected tab, swipe only */}
      <div className="sticky top-14 z-20 -mx-3 mb-2 lg:hidden sm:-mx-4">
        <div className="w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="ops-rail-mobile" role="tablist" aria-label="Operations tools">
            <span className="mb-0.5 flex w-12 shrink-0 flex-col items-center gap-0.5 px-0.5 pb-1.5 text-[9px] font-bold leading-tight text-[#0f3d2e]">
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
              Operations
            </span>
            <span className="mb-1.5 h-6 w-px shrink-0 self-center bg-[#27AE60]" aria-hidden />
            {OPERATIONS_TABS.map((tab) => {
              // Only one bend outline at a time — action modals override the path tab.
              const active = actionOpenId
                ? tab.id === actionOpenId
                : !tab.action && tab.id === activeId;
              return (
                <OpsChip
                  key={tab.id}
                  active={active}
                  label={tab.label}
                  Icon={TAB_ICONS[tab.id]}
                  onSelect={() => onSelect(tab)}
                />
              );
            })}
            <span className="inline-block h-10 w-2 shrink-0" aria-hidden />
          </div>
        </div>
      </div>

      {/* Desktop — same green underline strip */}
      <div className="sticky top-16 z-20 -mx-3 mb-2 hidden border-b border-[#c8f3d9] bg-[#f8fffb] shadow-[0_4px_12px_-4px_rgba(15,61,46,0.12)] sm:-mx-4 lg:-mx-6 lg:block">
        <div className="w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-end gap-1 px-3 pb-1.5 pt-0.5 sm:gap-2 sm:px-4 lg:px-6">
            <span className="flex shrink-0 flex-col items-center gap-0.5 px-2.5 pb-1 pt-0.5 text-[11px] font-bold text-[#0f3d2e] sm:px-3 sm:text-[12px]">
              <Briefcase className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.4} aria-hidden />
              Operations
            </span>
            <span className="mx-0.5 mb-1.5 h-7 w-px shrink-0 self-center bg-[#27AE60]" aria-hidden />
            <nav className="flex items-stretch gap-0.5 sm:gap-1" aria-label="Operations tools">
              {OPERATIONS_TABS.map((tab) => {
                const active = actionOpenId
                  ? tab.id === actionOpenId
                  : !tab.action && tab.id === activeId;
                const Icon = TAB_ICONS[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-expanded={active}
                    onClick={() => onSelect(tab)}
                    className={`flex shrink-0 flex-col items-center gap-0.5 whitespace-nowrap rounded-none px-2.5 pb-1 pt-0.5 text-[10px] font-semibold transition-colors sm:px-3 sm:text-[11px] ${
                      active
                        ? "border-b-2 border-[#27AE60] text-[#128C45]"
                        : "border-b-2 border-transparent text-[#5c7d6d] hover:text-[#0f3d2e]"
                    }`}
                  >
                    {Icon ? (
                      <Icon
                        className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        strokeWidth={active ? 2.4 : 2}
                        aria-hidden
                      />
                    ) : null}
                    <span className="inline-flex items-center gap-0.5">
                      {tab.label}
                      <ChevronDown
                        className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                          active ? "rotate-180" : "rotate-0"
                        }`}
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
