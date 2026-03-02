// ============================================
// FILE: src/components/ThemeEditor/LiveThemeEditor.jsx
// ============================================
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Palette,
  Check,
  X,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Home,
  Calendar,
  Building2,
} from "lucide-react";
import {
  getContrastTextColor,
  generateColorPalette,
} from "../../utils/colorUtils";

export default function LiveThemeEditor({
  initialColor = "#ff6600",
  onSave,
  onCancel,
}) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const palette = generateColorPalette(selectedColor);
  const textColor = getContrastTextColor(selectedColor);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(selectedColor);
    setIsSaving(false);
  };

  // Apply color to elements in real-time
  const applyColorStyle = (bgColor, opacity = 1) => ({
    backgroundColor:
      opacity === 1
        ? bgColor
        : `${bgColor}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
    color: getContrastTextColor(bgColor),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* LEFT PANEL - Color Picker Controls */}
          <div className="p-6 border-r border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    Theme Editor
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Pick a color and see live changes
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title={showPreview ? "Hide Preview" : "Show Preview"}
                >
                  {showPreview ? (
                    <Eye className="w-5 h-5 text-slate-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Color Picker */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ width: "100%", height: "200px" }}
                  />
                </div>

                {/* Hex Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hex Color Code
                  </label>
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Generated Palette
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(palette)
                    .filter(([key]) => key !== "text")
                    .map(([name, color]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedColor(color)}
                        className="group relative"
                      >
                        <div
                          className="h-16 rounded-lg border-2 border-slate-200 group-hover:border-slate-400 transition-all shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs font-medium text-slate-600 mt-1 capitalize">
                          {name}
                        </p>
                      </button>
                    ))}
                </div>
              </div>

              {/* Quick Colors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Quick Colors
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "#ff6600",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#06b6d4",
                    "#6366f1",
                    "#14b8a6",
                    "#f97316",
                    "#84cc16",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="h-10 rounded-lg border-2 border-white hover:border-slate-400 transition-all shadow-md hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Theme
                    </>
                  )}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isSaving}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Live Preview */}
          {showPreview && (
            <div className="p-6 bg-slate-50 overflow-y-auto max-h-[90vh]">
              <div className="space-y-6">
                {/* Preview Header */}
                <div className="flex items-center gap-2 text-slate-700 mb-4">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold">Live Preview</span>
                </div>

                {/* Hero Section Preview */}
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={applyColorStyle(selectedColor)}
                  >
                    <h1 className="text-2xl font-bold">Property Title</h1>
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold"
                      style={applyColorStyle(palette.dark)}
                    >
                      ● Available
                    </div>
                  </div>
                </div>

                {/* Cards Preview */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Primary Card */}
                  <div
                    className="p-4 rounded-lg shadow-md"
                    style={applyColorStyle(selectedColor, 0.15)}
                  >
                    <p className="text-xs text-slate-600 mb-1">Price Range</p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: selectedColor }}
                    >
                      ₹95L - ₹1.5Cr
                    </p>
                  </div>

                  {/* Light Card */}
                  <div
                    className="p-4 rounded-lg shadow-md"
                    style={applyColorStyle(palette.light, 0.2)}
                  >
                    <p className="text-xs text-slate-600 mb-1">Total Units</p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: palette.dark }}
                    >
                      220 Units
                    </p>
                  </div>
                </div>

                {/* BHK Cards Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    BHK Cards
                  </p>
                  <div className="space-y-2">
                    {["2 BHK", "3 BHK"].map((bhk) => (
                      <div
                        key={bhk}
                        className="p-3 rounded-lg border-2"
                        style={{
                          borderColor: palette.lighter,
                          backgroundColor: `${selectedColor}08`,
                        }}
                      >
                        <p
                          className="font-bold text-sm"
                          style={{ color: selectedColor }}
                        >
                          {bhk}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          1200-1350 sqft
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Buttons
                  </p>

                  {/* Primary Button */}
                  <button
                    className="w-full py-3 px-4 rounded-lg font-semibold shadow-md"
                    style={applyColorStyle(selectedColor)}
                  >
                    Schedule Site Visit
                  </button>

                  {/* Outline Button */}
                  <button
                    className="w-full py-3 px-4 rounded-lg font-semibold border-2 bg-white"
                    style={{
                      borderColor: selectedColor,
                      color: selectedColor,
                    }}
                  >
                    Download Brochure
                  </button>

                  {/* Gradient Button */}
                  <button
                    className="w-full py-3 px-4 rounded-lg font-semibold shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${selectedColor} 0%, ${palette.dark} 100%)`,
                      color: textColor,
                    }}
                  >
                    Contact Agent
                  </button>
                </div>

                {/* Badge/Tag Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Badges & Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={applyColorStyle(selectedColor)}
                    >
                      Featured
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={applyColorStyle(palette.light)}
                    >
                      New Launch
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold border-2"
                      style={{
                        borderColor: selectedColor,
                        color: selectedColor,
                        backgroundColor: "white",
                      }}
                    >
                      Premium
                    </span>
                  </div>
                </div>

                {/* Text Containers */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Text Containers
                  </p>

                  <div
                    className="p-4 rounded-lg"
                    style={applyColorStyle(selectedColor, 0.1)}
                  >
                    <h3
                      className="font-bold mb-1"
                      style={{ color: selectedColor }}
                    >
                      Amenities
                    </h3>
                    <p className="text-sm text-slate-600">
                      Swimming Pool, Gym, Clubhouse
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-lg border-2"
                    style={{
                      borderColor: palette.light,
                      backgroundColor: "white",
                    }}
                  >
                    <h3
                      className="font-bold mb-1"
                      style={{ color: palette.dark }}
                    >
                      Property Details
                    </h3>
                    <p className="text-sm text-slate-600">
                      3 Towers • G+20 Floors • 5.8 Acres
                    </p>
                  </div>
                </div>

                {/* Icons Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Icons</p>
                  <div className="flex gap-4">
                    {[Palette, Home, Check, Sparkles].map((Icon, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                        style={applyColorStyle(selectedColor, 0.15)}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: selectedColor }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Box Preview */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    borderLeftColor: selectedColor,
                    backgroundColor: `${selectedColor}10`,
                  }}
                >
                  <p
                    className="font-semibold text-sm mb-1"
                    style={{ color: selectedColor }}
                  >
                    Special Offer!
                  </p>
                  <p className="text-xs text-slate-600">
                    Get 10% discount on booking this month
                  </p>
                </div>

                {/* Progress Bar Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Progress Bar
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: "70%",
                        background: `linear-gradient(90deg, ${selectedColor} 0%, ${palette.light} 100%)`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 text-center">
                    70% Units Sold
                  </p>
                </div>

                {/* Additional Preview Elements */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Stats Cards
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="bg-white p-3 rounded-lg shadow-sm border-2"
                      style={{ borderColor: palette.lighter }}
                    >
                      <Calendar
                        className="w-5 h-5 mb-2"
                        style={{ color: selectedColor }}
                      />
                      <p className="text-xs text-slate-600">Possession</p>
                      <p className="text-sm font-bold text-slate-900">
                        Jun 2028
                      </p>
                    </div>
                    <div
                      className="bg-white p-3 rounded-lg shadow-sm border-2"
                      style={{ borderColor: palette.lighter }}
                    >
                      <Building2
                        className="w-5 h-5 mb-2"
                        style={{ color: selectedColor }}
                      />
                      <p className="text-xs text-slate-600">Towers</p>
                      <p className="text-sm font-bold text-slate-900">
                        3 Towers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
