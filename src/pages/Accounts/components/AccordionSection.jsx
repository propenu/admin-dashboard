// src/features/users/components/AccordionSection.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "./shared";

/**
 * AccordionSection
 * ─────────────────
 * Props:
 *   title       string
 *   icon        lucide component
 *   accent      hex color
 *   badge       string | number  — shown in header when collapsed (e.g. count)
 *   defaultOpen boolean
 *   children    ReactNode
 */
const AccordionSection = ({
  title,
  icon: Icon,
  accent = C.accent,
  badge,
  defaultOpen = false,
  children,
  headerRight,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: C.card,
        borderRadius: "16px",
        border: `1px solid ${open ? accent + "40" : C.border}`,
        overflow: "hidden",
        boxShadow: open
          ? `0 4px 20px ${accent}14`
          : "0 1px 4px rgba(0,0,0,0.04)",
        marginBottom: "12px",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* ── Header (always visible, click to toggle) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          background: open ? accent + "08" : "#fafbfc",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          borderBottom: open ? `1px solid ${accent}20` : "none",
          transition: "background 0.2s",
        }}
      >
        {/* Left: icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: open ? accent + "20" : accent + "12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <Icon size={16} strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: C.text,
              letterSpacing: "-0.2px",
            }}
          >
            {title}
          </span>
          {badge !== undefined && badge !== null && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "99px",
                fontSize: "10px",
                fontWeight: "700",
                background: accent + "18",
                color: accent,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Right: extra action + chevron */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {headerRight && open && headerRight}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronDown
              size={14}
              color={C.muted}
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
              }}
            />
          </div>
        </div>
      </button>

      {/* ── Body (animated expand) ── */}
      {open && (
        <div
          style={{
            padding: "18px",
            animation: "slideDown 0.2s ease forwards",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
