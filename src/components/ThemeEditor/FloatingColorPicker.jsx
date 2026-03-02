import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, X, Pipette, Copy, Sparkles } from "lucide-react";
import { getContrastTextColor } from "../../utils/colorUtils";

export default function FloatingColorPicker({
  position,
  initialColor,
  onSave,
  onCancel,
  elementName,
}) {
  const [color, setColor] = useState(initialColor);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef(null);

  // Optimize positioning to stay within viewport
  const optimizedPosition = useCallback(() => {
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 450;
    return {
      x: Math.min(Math.max(20, position.x), maxX),
      y: Math.min(Math.max(20, position.y), maxY),
    };
  }, [position]);

  const pos = optimizedPosition();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onCancel();
      }
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onSave(color);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [color, onSave, onCancel]);

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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave(color)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            style={{
              backgroundColor: color,
              color: getContrastTextColor(color),
            }}
            aria-label="Apply color changes"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold text-sm"
            aria-label="Cancel color changes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
              Enter
            </kbd>{" "}
            to apply,
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono ml-1">
              Esc
            </kbd>{" "}
            to cancel
          </p>
        </div>
      </div>
    </div>
  );
}
