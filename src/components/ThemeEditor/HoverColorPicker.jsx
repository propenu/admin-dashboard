import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, X, Copy, Sparkles } from "lucide-react";
import { getContrastTextColor } from "../../utils/colorUtils";

export default function HoverColorPicker({
  position,
  initialColor,
  onColorChange,
  onClose,
  elementName,
  isHovering,
}) {
  const [color, setColor] = useState(initialColor);
  const [copied, setCopied] = useState(false);
  const [isPickerHovered, setIsPickerHovered] = useState(false);
  const pickerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Optimize positioning
  const optimizedPosition = useCallback(() => {
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 450;
    return {
      x: Math.min(Math.max(20, position.x), maxX),
      y: Math.min(Math.max(20, position.y), maxY),
    };
  }, [position]);

  const pos = optimizedPosition();

  // Real-time color update as user picks
  useEffect(() => {
    onColorChange(color);
  }, [color, onColorChange]);

  // Auto-close when mouse leaves both element and picker
  useEffect(() => {
    if (!isHovering && !isPickerHovered) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose(color);
      }, 500); // 500ms delay before auto-close
    } else {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isHovering, isPickerHovered, onClose, color]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose(initialColor); // Cancel
      if (e.key === "Enter") onClose(color); // Apply
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [color, initialColor, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetColors = [
    "#ff6600",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  return (
    <div
      ref={pickerRef}
      onMouseEnter={() => setIsPickerHovered(true)}
      onMouseLeave={() => setIsPickerHovered(false)}
      className="fixed z-[100] bg-white rounded-2xl shadow-2xl border-2 p-5 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        borderColor: color,
      }}
      role="dialog"
      aria-label={`Color picker for ${elementName}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color }} />
            <span className="text-sm font-bold text-slate-900">
              {elementName}
            </span>
          </div>
          <button
            onClick={() => onClose(initialColor)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close picker"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Color Picker */}
        <HexColorPicker
          color={color}
          onChange={setColor}
          style={{ width: "220px", height: "160px" }}
        />

        {/* Hex Input with Copy */}
        <div className="flex gap-2">
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 px-3 py-2.5 border-2 border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            aria-label="Hex color code"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Copy color code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {/* Preview Card */}
        <div
          className="w-full h-20 rounded-xl flex items-center justify-center font-bold shadow-inner transition-all"
          style={{
            backgroundColor: color,
            color: getContrastTextColor(color),
          }}
        >
          Preview Text
        </div>

        {/* Preset Colors */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">
            Quick Colors
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {presetColors.map((preset) => (
              <button
                key={preset}
                onClick={() => setColor(preset)}
                className="w-full aspect-square rounded-lg border-2 border-white hover:border-slate-400 transition-all hover:scale-110 shadow-sm"
                style={{ backgroundColor: preset }}
                aria-label={`Select color ${preset}`}
              />
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={() => onClose(color)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
          style={{
            backgroundColor: color,
            color: getContrastTextColor(color),
          }}
          aria-label="Apply color"
        >
          <Check className="w-4 h-4" />
          Apply Color
        </button>

        {/* Hint */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Color updates in real-time. Hover away to close.
          </p>
        </div>
      </div>
    </div>
  );
}
