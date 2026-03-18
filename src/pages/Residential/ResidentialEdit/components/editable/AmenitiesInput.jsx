import { useState } from "react";
import { Search, X } from "lucide-react";

const AMENITIES = [
  { key: "lift", title: "Lift/Elevator", icon: "🛗" },
  { key: "swimming-pool", title: "Swimming Pool", icon: "🏊" },
  { key: "power-backup", title: "Power Backup", icon: "⚡" },
  { key: "gym", title: "Gym", icon: "🏋️" },
  { key: "security", title: "24/7 Security", icon: "🛡️" },
  { key: "parking", title: "Reserved Parking", icon: "🚗" },
  { key: "garden", title: "Garden", icon: "🌳" },
  { key: "club-house", title: "Club House", icon: "🏛️" },
  { key: "play-area", title: "Play Area", icon: "🎮" },
  { key: "intercom", title: "Intercom", icon: "📞" },
  { key: "fire-safety", title: "Fire Safety", icon: "🧯" },
  { key: "visitor-parking", title: "Visitor Parking", icon: "🅿️" },
  { key: "water-storage", title: "Water Storage", icon: "💧" },
  { key: "shopping-center", title: "Shopping Center", icon: "🛒" },
  { key: "piped-gas", title: "Piped Gas", icon: "🔥" },
  { key: "maintenance", title: "Maintenance Staff", icon: "👷" },
];

export default function AmenitiesInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  // Add custom amenity
  const addCustom = () => {
    const text = input.trim();
    if (!text) return;

    const key = text.toLowerCase().replace(/\s+/g, "-");

    if (value.some((v) => v.key === key)) return;

    onChange([...value, { key, title: text }]);
    setInput("");
  };

  // Add predefined amenity
  const addPopular = (amenity) => {
    if (value.some((v) => v.key === amenity.key)) return;

    // Only send key + title (no icon)
    onChange([
      ...value,
      {
        key: amenity.key,
        title: amenity.title,
      },
    ]);
  };

  const removeAmenity = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const filtered = AMENITIES.filter((a) =>
    a.title.toLowerCase().includes(input.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Search or add custom amenity..."
          className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#27AE60]/40 bg-white"
        />
      </div>

      {/* Popular Amenities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {filtered.map((amenity) => {
          const added = value.some((v) => v.key === amenity.key);

          return (
            <button
              key={amenity.key}
              type="button"
              onClick={() => addPopular(amenity)}
              disabled={added}
              className="relative flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: added ? "#27AE60" : "#f1f5f9",
                background: added ? "#f0fdf4" : "#fff",
              }}
            >
              {added && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#27AE60] rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}

              <span className="text-lg">{amenity.icon}</span>

              <span
                className={`text-xs ${
                  added ? "text-[#15803d] font-bold" : "text-slate-600"
                }`}
              >
                {amenity.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Amenities */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {value.map((a, i) => {
            const icon = AMENITIES.find((p) => p.key === a.key)?.icon || "✨";

            return (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderColor: "#27AE6025",
                }}
              >
                <span>{icon}</span>
                <span>{a.title}</span>

                <button
                  type="button"
                  onClick={() => removeAmenity(i)}
                  className="ml-1 hover:opacity-60"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
