import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useAdminWorkspace } from "./AdminWorkspaceContext";
import { useInventoryKindOptional } from "../inventoryKind/InventoryKindContext";

const INVENTORY_OPTIONS = [
  { id: "projects", label: "Projects" },
  { id: "properties", label: "Properties" },
];

const MENU_WIDTH = 156;

/**
 * Festive strip: cream track + gold selected tab with outward bottom bends
 * (Amazon specials join — white scoops + drop-shadow stroke).
 */
const RAIL = {
  track: "#FFF8EC",
  stroke: "#C9A227",
  ink: "#232F3E",
};

const tabBaseClass =
  "box-border inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-full border-[1.5px] px-2.5 text-[11px] font-semibold whitespace-nowrap transition-[color,background,border-color,box-shadow] duration-200 ease-out sm:px-2.5 sm:text-[11px] lg:px-3 lg:text-[12px]";

/**
 * Selected tab outline.
 * Bottom fillets use the center outside the tab — (-r, yb-r) and (w+r, yb-r) —
 * so the stroke is horizontal on the gold baseline and vertical on the tab side.
 * sweep 0 / 1 picks that center (the other sweep hooks the wrong way).
 */
function festiveOutlinePath(w, h, bend, topR, stroke) {
  const r = bend;
  const inset = stroke / 2;
  const tr = Math.min(topR, Math.max(8, w / 2 - 4));
  const yb = h - inset;
  const yTop = inset;
  const stub = r;
  // Quarter-circle kappa so both bottom bends are exact mirrors:
  // horizontal on the baseline, vertical on the tab side.
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

function FestiveChip({
  selected,
  isMain,
  label,
  title,
  open,
  buttonRef,
  menu,
  onActivate,
  bend = 22,
}) {
  const localRef = useRef(null);
  const [box, setBox] = useState({ w: 96, h: 48 });

  const setRefs = (node) => {
    localRef.current = node;
    if (!buttonRef) return;
    if (typeof buttonRef === "function") buttonRef(node);
    else buttonRef.current = node;
  };

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el || !selected) return undefined;
    const measure = () => {
      setBox({ w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [selected, label]);

  const stroke = 2;
  const path = festiveOutlinePath(box.w, box.h, bend, 16, stroke);

  return (
    <div className={`ws-festive-item ${selected ? "ws-festive-item--on" : ""}`}>
      <button
        ref={setRefs}
        type="button"
        role="tab"
        aria-selected={selected}
        aria-haspopup={isMain ? "listbox" : undefined}
        aria-expanded={isMain ? open : undefined}
        title={title}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onActivate();
        }}
        className={`ws-festive-chip ${selected ? "ws-festive-chip--on" : ""}`}
      >
        {selected ? (
          <svg
            className="ws-festive-outline"
            width={box.w + bend * 4}
            height={box.h}
            viewBox={`${-(bend * 2)} 0 ${box.w + bend * 4} ${box.h}`}
            style={{ width: box.w + bend * 4, height: box.h, maxWidth: "none" }}
            aria-hidden
          >
            <path d={path.fill} fill="#ffffff" stroke="none" />
            <path
              d={path.outline}
              fill="none"
              stroke={RAIL.stroke}
              strokeWidth={stroke}
              strokeLinejoin="round"
              strokeLinecap="butt"
            />
          </svg>
        ) : null}
        <span>{label}</span>
        {isMain ? (
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 opacity-55 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        ) : null}
      </button>
      {menu}
    </div>
  );
}

/**
 * Product workspace switcher.
 * - variant="tabs"  → compact desktop pills
 * - variant="chips" → mobile festive strip (text only, gold selected pill)
 */
export default function WorkspaceSwitcher({
  sidebarOpen = false,
  onDropdownOpen,
  variant = "tabs",
} = {}) {
  const isChips = variant === "chips";
  const { workspaceId, visibleWorkspaces, setWorkspace } = useAdminWorkspace();
  const inventory = useInventoryKindOptional();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (sidebarOpen && open) setOpen(false);
  }, [sidebarOpen, open]);

  useLayoutEffect(() => {
    if (!isChips) return undefined;
    const el = scrollerRef.current;
    if (!el) return undefined;
    const activeBtn = el.querySelector('[role="tab"][aria-selected="true"]');
    if (!activeBtn) return undefined;
    // Scroll only the chip rail — never the page (scrollIntoView can hide content under the fixed nav).
    const target =
      activeBtn.offsetLeft - (el.clientWidth - activeBtn.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    return undefined;
  }, [isChips, visibleWorkspaces?.length, workspaceId, inventory?.inventoryKind]);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const triggerCenter = rect.left + rect.width / 2;
    let left = triggerCenter - MENU_WIDTH / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
    setMenuPos({
      top: rect.bottom + gap,
      left,
      width: MENU_WIDTH,
      caretLeft: Math.max(12, Math.min(triggerCenter - left, MENU_WIDTH - 12)),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return undefined;
    }
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      const t = event.target;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
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

  const toggleDropdown = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) onDropdownOpen?.();
      return next;
    });
  };

  if (!visibleWorkspaces?.length || visibleWorkspaces.length <= 1) return null;

  const rawKind = inventory?.inventoryKind;
  const inventoryKind =
    rawKind === "projects"
      ? "projects"
      : rawKind === "properties"
        ? "properties"
        : "main";
  const inventoryLabel =
    inventoryKind === "main"
      ? "Properties"
      : INVENTORY_OPTIONS.find((item) => item.id === inventoryKind)?.label ||
        "Properties";
  const mainDeskActive = workspaceId === "main" && inventoryKind === "main";
  const inventoryModeActive =
    workspaceId === "main" &&
    (inventoryKind === "projects" || inventoryKind === "properties");

  const pickInventory = (kind) => {
    setOpen(false);
    // /projects and /properties already belong to the main workspace.
    // setWorkspace("main") would navigate to "/" and light the Main Desk logo.
    inventory?.setInventoryKind?.(kind, { navigateHome: true });
  };

  const tabActiveStyle = {
    color: "#ffffff",
    background: "linear-gradient(180deg, #27AE60 0%, #1e9a4f 100%)",
    borderColor: "#1e9a4f",
    boxShadow: "0 4px 10px rgba(39,174,96,0.28)",
  };
  const tabIdleStyle = {
    color: "#5c7d6d",
    background: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
  };

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Projects or Properties"
            className="fixed z-[200]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              filter:
                "drop-shadow(0 8px 18px rgba(15,61,46,0.14)) drop-shadow(0 1px 2px rgba(201,162,39,0.2))",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t bg-white"
              style={{ left: menuPos.caretLeft, borderColor: "#e8d4a8" }}
            />
            <div
              className="relative z-[1] overflow-hidden rounded-xl bg-white py-1"
              style={{ border: "1px solid #e8d4a8" }}
            >
              {INVENTORY_OPTIONS.map((option) => {
                const selected =
                  inventoryModeActive && option.id === inventoryKind;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      pickInventory(option.id);
                    }}
                    className={`mx-1 flex w-[calc(100%-8px)] items-center rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold transition-all duration-150 ${
                      selected ? "text-white" : "bg-white hover:bg-[#fff8e8]"
                    }`}
                    style={
                      selected
                        ? {
                            background:
                              "linear-gradient(180deg, #E0B12A 0%, #C99212 100%)",
                            color: "#fff",
                          }
                        : { color: RAIL.ink }
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  /** Festive strip — cream track, 2px gold rail, selected tab outline joins it. */
  const STROKE = 2;
  const BEND = 22;
  const CHIP_H = 48;

  const chipItems = visibleWorkspaces.map((workspace) => {
    const active = workspace.id === workspaceId;
    const isMain = workspace.id === "main";
    const selected = isMain ? inventoryModeActive : active;
    const label = isMain
      ? inventoryModeActive
        ? inventoryLabel
        : workspace.label
      : workspace.label;

    return (
      <FestiveChip
        key={workspace.id}
        selected={selected}
        isMain={isMain}
        label={label}
        title={
          isMain
            ? mainDeskActive
              ? "Properties · pick Projects or Properties"
              : `${workspace.label} · ${inventoryLabel}`
            : workspace.label
        }
        open={open}
        buttonRef={isMain ? triggerRef : undefined}
        menu={isMain ? menu : null}
        bend={BEND}
        onActivate={() => {
          if (isMain) {
            toggleDropdown();
            return;
          }
          setOpen(false);
          setWorkspace(workspace.id);
        }}
      />
    );
  });

  if (isChips) {
    return (
      <>
        <style>{`
          .ws-festive-rail {
            display: flex;
            flex-wrap: nowrap;
            align-items: flex-end;
            gap: ${BEND + 8}px;
            width: max-content;
            min-width: 100%;
            /* Gold band is inside the box (padding), so the selected stroke can sit on it */
            padding: 6px ${BEND + 8}px ${STROKE}px;
            background: linear-gradient(to top, ${RAIL.stroke} ${STROKE}px, ${RAIL.track} ${STROKE}px);
            overflow: visible;
          }
          .ws-festive-item {
            position: relative;
            z-index: 1;
            flex-shrink: 0;
            overflow: visible;
          }
          .ws-festive-item--on {
            z-index: 3;
          }
          .ws-festive-chip {
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            height: ${CHIP_H}px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 0 18px;
            margin: 0;
            border: none;
            background: transparent;
            color: ${RAIL.ink};
            font-size: 14px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
            cursor: pointer;
            overflow: visible;
            -webkit-tap-highlight-color: transparent;
          }
          .ws-festive-chip--on {
            /* Drop into the gold band so the outline baseline and the rail line are the same pixels */
            height: calc(${CHIP_H}px + ${STROKE}px);
            padding-bottom: ${STROKE}px;
            background: transparent;
            margin-bottom: -${STROKE}px;
            z-index: 2;
          }
          .ws-festive-outline {
            position: absolute;
            left: -${BEND * 2}px;
            top: 0;
            max-width: none;
            pointer-events: none;
            overflow: visible;
            z-index: 1;
          }
          .ws-festive-chip--on > span,
          .ws-festive-chip--on > svg.lucide {
            position: relative;
            z-index: 2;
          }
        `}</style>
        <div
          ref={scrollerRef}
          className="w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingBottom: 0 }}
        >
          <div
            className="ws-festive-rail"
            role="tablist"
            aria-label="Admin product workspaces"
          >
            {chipItems}
            <span className="inline-block h-12 w-3 shrink-0" aria-hidden />
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="flex h-9 w-max min-w-0 flex-nowrap items-center gap-0.5 overflow-visible rounded-full p-0.5 lg:justify-center"
      role="tablist"
      aria-label="Admin product workspaces"
    >
      {visibleWorkspaces.map((workspace) => {
        const active = workspace.id === workspaceId;
        const isMain = workspace.id === "main";

        if (isMain) {
          const label = inventoryModeActive ? inventoryLabel : workspace.label;
          return (
            <div key={workspace.id} className="relative shrink-0">
              <button
                ref={triggerRef}
                type="button"
                role="tab"
                aria-selected={inventoryModeActive}
                aria-haspopup="listbox"
                aria-expanded={open}
                title={
                  mainDeskActive
                    ? "Properties · pick Projects or Properties"
                    : `${workspace.label} · ${inventoryLabel}`
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleDropdown();
                }}
                className={`relative z-[1] ${tabBaseClass}`}
                style={inventoryModeActive ? tabActiveStyle : tabIdleStyle}
              >
                <span className="inline-block min-w-[4.75rem] text-center">{label}</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 opacity-80 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {menu}
            </div>
          );
        }

        return (
          <button
            key={workspace.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={workspace.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              setWorkspace(workspace.id);
            }}
            className={tabBaseClass}
            style={active ? tabActiveStyle : tabIdleStyle}
          >
            {workspace.label}
          </button>
        );
      })}
    </div>
  );
}
