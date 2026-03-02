import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, X, Pipette } from "lucide-react";

export default function InlineColorEditor({
  position,
  initialColor,
  onSave,
  onCancel,
  elementName,
}) {
  const [color, setColor] = useState(initialColor);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  return (
    <div
      ref={pickerRef}
      className="fixed z-[100] bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 animate-in fade-in zoom-in duration-200"
      style={{
        top: `${Math.min(position.y, window.innerHeight - 400)}px`,
        left: `${Math.min(position.x, window.innerWidth - 250)}px`,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pipette className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">
              {elementName}
            </span>
          </div>
        </div>

        <HexColorPicker
          color={color}
          onChange={setColor}
          style={{ width: "200px" }}
        />

        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <button
            onClick={() => onSave(color)}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
