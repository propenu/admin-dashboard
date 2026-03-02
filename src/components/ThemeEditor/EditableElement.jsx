import { useState } from "react";
import { Edit3 } from "lucide-react";

export default function EditableElement({
  children,
  onColorClick,
  elementName,
  isEditMode,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (isEditMode) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      onColorClick({
        x: rect.right + 10,
        y: rect.top,
        element: e.currentTarget,
      });
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => isEditMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {children}

      {isEditMode && isHovered && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none bg-blue-500/5">
          <div className="absolute -top-7 left-0 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-lg">
            <Edit3 className="w-3 h-3" />
            {elementName}
          </div>
        </div>
      )}
    </div>
  );
}
