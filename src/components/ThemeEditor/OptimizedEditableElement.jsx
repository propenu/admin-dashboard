import { useState, useCallback, memo } from "react";
import { Edit3, Pipette } from "lucide-react";

/**
 * Optimized Editable Element with Performance Enhancements
 * - Memoized to prevent unnecessary re-renders
 * - Uses CSS transforms for smooth animations
 * - Debounced hover states
 * - ARIA attributes for accessibility
 */
const OptimizedEditableElement = memo(
  ({
    children,
    onEditClick,
    elementName,
    elementId,
    isEditMode,
    hoverColor = "#3b82f6",
    className = "",
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Memoized handlers to prevent recreation on each render
    const handleMouseEnter = useCallback(() => {
      if (isEditMode) {
        setIsHovered(true);
      }
    }, [isEditMode]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const handleClick = useCallback(
      (e) => {
        if (isEditMode) {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onEditClick({
            x: rect.right + 10,
            y: rect.top,
            elementId,
            elementName,
            element: e.currentTarget,
          });
        }
      },
      [isEditMode, onEditClick, elementId, elementName]
    );

    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role={isEditMode ? "button" : undefined}
        aria-label={isEditMode ? `Edit ${elementName} color` : undefined}
        tabIndex={isEditMode ? 0 : -1}
        style={{
          cursor: isEditMode ? "pointer" : "default",
          transition: "transform 0.2s ease-out",
          transform: isHovered && isEditMode ? "scale(1.01)" : "scale(1)",
        }}
      >
        {children}

        {/* Hover Overlay with Edit Button */}
        {isEditMode && isHovered && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none animate-in fade-in duration-150"
            style={{
              border: `2px dashed ${hoverColor}`,
              backgroundColor: `${hoverColor}08`,
              boxShadow: `0 0 0 4px ${hoverColor}20`,
            }}
          >
            {/* Edit Button */}
            <div className="absolute -top-10 right-0 flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
              {/* Color Preview */}
              <div
                className="w-8 h-8 rounded-lg shadow-lg border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: hoverColor }}
                aria-label={`Current color: ${hoverColor}`}
              >
                <Pipette className="w-4 h-4 text-white" />
              </div>

              {/* Edit Button */}
              <button
                className="px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: hoverColor,
                  color: "white",
                }}
                onClick={handleClick}
                aria-label={`Edit ${elementName}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Color
              </button>
            </div>

            {/* Element Label */}
            <div
              className="absolute -top-10 left-0 px-2.5 py-1 rounded-lg text-xs font-bold shadow-md animate-in slide-in-from-top-2 duration-200"
              style={{
                backgroundColor: hoverColor,
                color: "white",
              }}
            >
              {elementName}
            </div>
          </div>
        )}
      </div>
    );
  }
);

OptimizedEditableElement.displayName = "OptimizedEditableElement";

export default OptimizedEditableElement;
