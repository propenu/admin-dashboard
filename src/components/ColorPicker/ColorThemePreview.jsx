import {
  generateColorPalette,
  getContrastTextColor,
} from "../../utils/colorUtils";

export default function ColorThemePreview({ color }) {
  const palette = generateColorPalette(color);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        Color Palette Preview
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(palette).map(([name, value]) => (
          <div
            key={name}
            className="p-3 rounded-lg shadow-sm border border-slate-200"
            style={{
              backgroundColor: name === "text" ? "#f8fafc" : value,
              color: name === "text" ? value : getContrastTextColor(value),
            }}
          >
            <p className="text-xs font-medium capitalize">{name}</p>
            <p className="text-xs font-mono mt-1 opacity-80">
              {name === "text" ? value : value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
