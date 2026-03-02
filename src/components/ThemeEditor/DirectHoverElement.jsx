import { useState, useCallback, memo } from "react";
import { Pipette } from "lucide-react";

const DirectHoverElement = memo(
  ({
    children,
    onHover,
    onHoverEnd,
    elementName,
    elementId,
    isEditMode,
    currentColor,
    className = "",
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(
      (e) => {
        if (isEditMode) {
          setIsHovered(true);
          const rect = e.currentTarget.getBoundingClientRect();
          onHover({
            x: rect.right + 10,
            y: rect.top,
            elementId,
            elementName,
          });
        }
      },
      [isEditMode, onHover, elementId, elementName]
    );

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      // Small delay before closing picker
      setTimeout(() => {
        onHoverEnd();
      }, 100);
    }, [onHoverEnd]);

    return (
      <div
        className={`relative transition-all duration-200 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered && isEditMode ? "scale(1.01)" : "scale(1)",
        }}
      >
        {children}

        {/* Hover Indicator */}
        {isEditMode && isHovered && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none animate-in fade-in duration-150"
            style={{
              border: `2px dashed ${currentColor}`,
              backgroundColor: `${currentColor}08`,
              boxShadow: `0 0 0 3px ${currentColor}15`,
            }}
          >
            {/* Floating Label */}
            <div
              className="absolute -top-8 left-0 px-2 py-1 rounded-md text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-200"
              style={{
                backgroundColor: currentColor,
                color: "white",
              }}
            >
              <Pipette className="w-3 h-3" />
              {elementName}
            </div>
          </div>
        )}
      </div>
    );
  }
);

DirectHoverElement.displayName = "DirectHoverElement";

export default DirectHoverElement;
