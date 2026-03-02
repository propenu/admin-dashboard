import { useState, useCallback, memo } from "react";
import { Pipette } from "lucide-react";

/**
 * Hover-Only Edit Element - Shows color picker immediately on hover
 * No edit button needed - direct interaction
 */
const HoverEditElement = memo(
  ({
    children,
    onHover,
    elementName,
    elementId,
    isEditMode,
    currentColor = "#3b82f6",
    className = "",
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    // Show color picker on hover with slight delay
    const handleMouseEnter = useCallback(
      (e) => {
        if (isEditMode) {
          setIsHovered(true);

          // Delay opening picker slightly for smooth UX
          const timeout = setTimeout(() => {
            const rect = e.currentTarget.getBoundingClientRect();
            onHover({
              x: rect.right + 10,
              y: rect.top,
              elementId,
              elementName,
              element: e.currentTarget,
            });
          }, 300); // 300ms delay before showing picker

          setHoverTimeout(timeout);
        }
      },
      [isEditMode, onHover, elementId, elementName]
    );

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    }, [hoverTimeout]);

    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={isEditMode ? "button" : undefined}
        aria-label={isEditMode ? `Edit ${elementName} color` : undefined}
        tabIndex={isEditMode ? 0 : -1}
        style={{
          cursor: isEditMode ? "pointer" : "default",
          transition: "all 0.2s ease-out",
          transform: isHovered && isEditMode ? "scale(1.01)" : "scale(1)",
        }}
      >
        {children}

        {/* Hover Highlight - No Edit Button */}
        {isEditMode && isHovered && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none animate-in fade-in duration-150"
            style={{
              border: `2px dashed ${currentColor}`,
              backgroundColor: `${currentColor}08`,
              boxShadow: `0 0 0 4px ${currentColor}20`,
            }}
          >
            {/* Element Label Only */}
            <div
              className="absolute -top-8 left-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-200 flex items-center gap-2"
              style={{
                backgroundColor: currentColor,
                color: "white",
              }}
            >
              <Pipette className="w-3.5 h-3.5" />
              {elementName}
            </div>
          </div>
        )}
      </div>
    );
  }
);

HoverEditElement.displayName = "HoverEditElement";

export default HoverEditElement;
