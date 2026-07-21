import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Palette, Check, X } from "lucide-react";
import { getContrastTextColor } from "../../utils/colorUtils";

export default function ColorPickerButton({
  color = "#ff6600",
  onChange,
  label = "Choose Color",
  showLabel = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const popoverRef = useRef(null);

  useEffect(() => {
    setTextColor(getContrastTextColor(color));
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
        setTempColor(color); // Reset if clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, color]);

  const handleSave = () => {
    onChange(tempColor);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempColor(color);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg border border-slate-300 hover:border-blue-400 transition-colors bg-white"
      >
        <div
          className="w-8 h-8 rounded-md border-2 border-white shadow-md flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Palette className="w-4 h-4" style={{ color: textColor }} />
        </div>
        {showLabel && (
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-500 font-mono">
              {color.toUpperCase()}
            </p>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-slate-200"
        >
          <div className="space-y-4">
            <HexColorPicker color={tempColor} onChange={setTempColor} />

            {/* Color Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hex Color Code
              </label>
              <input
                type="text"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#000000"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Preview</p>
              <div
                className="w-full h-16 rounded-lg flex items-center justify-center font-semibold shadow-inner"
                style={{
                  backgroundColor: tempColor,
                  color: getContrastTextColor(tempColor),
                }}
              >
                Sample Text
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                Apply
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
