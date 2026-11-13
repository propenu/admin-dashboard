import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAdminWorkspace } from "./AdminWorkspaceContext";
import { useInventoryKindOptional } from "../inventoryKind/InventoryKindContext";
import {
  getInventoryCatalog,
  isInventoryLinkActive,
} from "../inventoryKind/inventoryKindConfig";

const INVENTORY_OPTIONS = [
  { id: "projects", label: "Projects" },
  { id: "properties", label: "Properties" },
];

const MENU_WIDTH = 720;
const MENU_ANIM_MS = 200;

function MegaColumn({ title, links, isActive, onPick, className = "", listClassName = "space-y-0.5" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a8f98] md:mb-2">
        {title}
      </p>
      <ul className={listClassName}>
        {links.map((link) => {
          const active = isActive(link.path);
          return (
            <li key={link.path}>
              <button
                type="button"
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPick(link.path);
                }}
                className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[14px] transition-colors duration-150 ${
                  active
                    ? "bg-[#effaf3] font-semibold text-[#1e8f4d]"
                    : "font-medium text-[#232F3E] hover:bg-[#fff8e8] hover:text-[#1e8f4d]"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-[#27AE60]" : "bg-transparent"}`}
                />
                <span className="truncate">{link.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Festive strip: cream track + gold selected tab with outward bottom bends
 * (Amazon specials join — white scoops + drop-shadow stroke).
 */
const RAIL = {
  track: "#F7FBF8",
  stroke: "#27AE60",
  ink: "#0f3d2e",
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
        aria-haspopup={isMain ? "menu" : undefined}
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
            pointerEvents="none"
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
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [previewKind, setPreviewKind] = useState("projects");
  const [menuPos, setMenuPos] = useState(null);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const scrollerRef = useRef(null);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    if (sidebarOpen && open) setOpen(false);
  }, [sidebarOpen, open]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = scrollLeftRef.current;
  }, [workspaceId]);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const width = Math.min(MENU_WIDTH, window.innerWidth - 16);
    const triggerCenter = rect.left + rect.width / 2;
    let left = triggerCenter - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setMenuPos({
      top: rect.bottom + gap,
      left,
      width,
      maxHeight: Math.max(240, window.innerHeight - rect.bottom - gap - 12),
      caretLeft: Math.max(12, Math.min(triggerCenter - left, width - 12)),
    });
  };

  // Keep the menu mounted briefly after close so it can fade/slide out.
  useEffect(() => {
    if (open) {
      setMenuMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setMenuVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setMenuVisible(false);
    const t = setTimeout(() => setMenuMounted(false), MENU_ANIM_MS);
    return () => clearTimeout(t);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
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
    if (!open) {
      const current = inventory?.inventoryKind;
      setPreviewKind(current === "properties" ? "properties" : "projects");
    }
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
  const inventoryModeActive =
    workspaceId === "main" &&
    (inventoryKind === "projects" || inventoryKind === "properties");

  // /projects and /properties already belong to the main workspace.
  // setWorkspace("main") would navigate to "/" and light the Main Desk logo.
  const pickInventoryLink = (kind, path) => {
    setOpen(false);
    inventory?.setInventoryKind?.(kind, { navigateHome: false });
    navigate(path);
  };

  const catalog = getInventoryCatalog(previewKind);
  const isMegaLinkActive = (path) => {
    if (!inventoryModeActive || inventoryKind !== previewKind) return false;
    const match = isInventoryLinkActive(path, location.pathname, location.search);
    if (match !== null) return match;
    return location.pathname === String(path).split("?")[0];
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
    menuMounted && menuPos && catalog
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Projects and Properties"
            aria-hidden={!open}
            className="fixed z-[200]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              filter:
                "drop-shadow(0 12px 28px rgba(15,61,46,0.14)) drop-shadow(0 1px 2px rgba(201,162,39,0.2))",
              opacity: menuVisible ? 1 : 0,
              transform: menuVisible
                ? "translateY(0) scale(1)"
                : "translateY(-8px) scale(0.98)",
              transformOrigin: `${menuPos.caretLeft}px 0`,
              transition: `opacity ${MENU_ANIM_MS}ms ease, transform ${MENU_ANIM_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
              pointerEvents: open ? "auto" : "none",
              willChange: "opacity, transform",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t bg-white"
              style={{ left: menuPos.caretLeft, borderColor: "#e8d4a8" }}
            />
            <div
              className="relative z-[1] flex flex-col overflow-hidden rounded-2xl bg-white md:flex-row"
              style={{ border: "1px solid #e8d4a8", maxHeight: menuPos.maxHeight }}
            >
              {/* Kinds — hover (desktop) or tap (mobile) previews the columns */}
              <div
                className="flex shrink-0 gap-1 border-b p-2 md:w-44 md:flex-col md:gap-1 md:border-b-0 md:border-r md:px-4 md:py-5"
                style={{ borderColor: "#f1e6cc", background: "#fffdf8" }}
              >
                {INVENTORY_OPTIONS.map((option) => {
                  const on = previewKind === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={on}
                      onMouseEnter={() => setPreviewKind(option.id)}
                      onFocus={() => setPreviewKind(option.id)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Touch has no hover: first tap previews, second tap opens the board.
                        if (previewKind !== option.id) {
                          setPreviewKind(option.id);
                          return;
                        }
                        const target = getInventoryCatalog(option.id);
                        pickInventoryLink(option.id, target.overview.path);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-center text-[14px] transition-colors duration-150 md:flex-none md:px-0 md:py-1.5 md:text-left md:text-[20px] md:leading-tight ${
                        on
                          ? "bg-white font-semibold text-[#232F3E] shadow-[0_1px_4px_rgba(15,61,46,0.12)] md:bg-transparent md:shadow-none"
                          : "font-medium text-[#8a8f98] hover:text-[#232F3E]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 md:px-6 md:py-5">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={isMegaLinkActive(catalog.overview.path) ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pickInventoryLink(previewKind, catalog.overview.path);
                  }}
                  className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors duration-150 md:mb-4 ${
                    isMegaLinkActive(catalog.overview.path)
                      ? "border-[#27AE60] bg-[#27AE60] text-white"
                      : "border-[#cdebd8] bg-[#f3fbf6] text-[#1e8f4d] hover:border-[#27AE60]"
                  }`}
                >
                  {catalog.overview.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 md:grid-cols-3 md:gap-x-6 md:gap-y-5">
                  <MegaColumn
                    title="Category"
                    links={catalog.categories}
                    isActive={isMegaLinkActive}
                    onPick={(path) => pickInventoryLink(previewKind, path)}
                  />
                  <MegaColumn
                    title="Listing tier"
                    links={catalog.tiers}
                    isActive={isMegaLinkActive}
                    onPick={(path) => pickInventoryLink(previewKind, path)}
                  />
                  <MegaColumn
                    title="Manage"
                    className="col-span-2 border-t border-[#f1e6cc] pt-3 md:col-span-1 md:border-t-0 md:pt-0"
                    listClassName="grid grid-cols-2 gap-x-5 gap-y-0.5 md:block md:space-y-0.5"
                    links={catalog.manage}
                    isActive={isMegaLinkActive}
                    onPick={(path) => pickInventoryLink(previewKind, path)}
                  />
                </div>
              </div>
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
    const label = workspace.label;

    return (
      <FestiveChip
        key={workspace.id}
        selected={selected}
        isMain={isMain}
        label={label}
        title={isMain ? "Projects & Properties" : workspace.label}
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
            z-index: 2;
            flex-shrink: 0;
            overflow: visible;
          }
          .ws-festive-item--on {
            z-index: 1;
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
          onScroll={(e) => {
            scrollLeftRef.current = e.currentTarget.scrollLeft;
          }}
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
          const label = workspace.label;
          return (
            <div key={workspace.id} className="relative shrink-0">
              <button
                ref={triggerRef}
                type="button"
                role="tab"
                aria-selected={inventoryModeActive}
                aria-haspopup="menu"
                aria-expanded={open}
                title="Projects & Properties"
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
