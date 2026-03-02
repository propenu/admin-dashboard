// import { useState } from "react";

// /**
//  * AmenitiesInput
//  * - Chip based input
//  * - Enter → add
//  * - × → remove
//  * - Saves array of { key, title }
//  */
// export default function AmenitiesInput({ value = [], onChange }) {
//   const [input, setInput] = useState("");

//   const addAmenity = () => {
//     const trimmed = input.trim();
//     if (!trimmed) return;

//     const newAmenity = {
//       key: trimmed.toLowerCase().replace(/\s+/g, "-"),
//       title: trimmed,
//     };

//     onChange([...value, newAmenity]);
//     setInput("");
//   };

//   const removeAmenity = (index) => {
//     const updated = value.filter((_, i) => i !== index);
//     onChange(updated);
//   };

//   return (
//     <div className="space-y-2">
//       {/* INPUT */}
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && addAmenity()}
//         placeholder="Add amenity (eg. Lift, Swimming Pool)"
//         className="w-full border rounded-lg px-3 py-2 text-sm"
//       />

//       {/* CHIPS */}
//       <div className="flex gap-2 flex-wrap">
//         {value.map((amenity, index) => (
//           <span
//             key={index}
//             className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-1"
//           >
//             {amenity.title}
//             <button
//               type="button"
//               onClick={() => removeAmenity(index)}
//               className="font-bold leading-none"
//             >
//               ×
//             </button>
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";

/**
 * AmenitiesInput with Popular Amenities
 * Exact styling from the image
 */

const POPULAR_AMENITIES = [
  { key: "lift", title: "Lift/Elevator", icon: "🛗" },
  { key: "swimming-pool", title: "Swimming Pool", icon: "🏊" },
  { key: "power-backup", title: "Power Backup", icon: "⚡" },
  { key: "gym", title: "Gym", icon: "🏋️" },
  { key: "security", title: "24/7 Security", icon: "🛡️" },
  { key: "parking", title: "Reserved Parking", icon: "🚗" },
  { key: "garden", title: "Garden", icon: "🌳" },
  { key: "club-house", title: "Club House", icon: "🏛️" },
  { key: "play-area", title: "Children Play Area", icon: "🎮" },
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

  const addAmenity = (amenityTitle) => {
    const trimmed = amenityTitle.trim();
    if (!trimmed) return;

    // Check if already added
    if (value.some((a) => a.title === trimmed)) return;

    const newAmenity = {
      key: trimmed.toLowerCase().replace(/\s+/g, "-"),
      title: trimmed,
    };

    onChange([...value, newAmenity]);
    setInput("");
  };

  const addPopularAmenity = (amenity) => {
    // Check if already added
    if (value.some((a) => a.key === amenity.key)) return;

    onChange([...value, { ...amenity }]);
  };

  const removeAmenity = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAmenity(input);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-lg">
          🔍
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or add custom amenity (e.g., Lift, Swimming Pool)"
          className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Popular Amenities Grid */}
      <div className="grid grid-cols-3 gap-3">
        {POPULAR_AMENITIES.map((amenity) => {
          const isAdded = value.some((a) => a.key === amenity.key);

          return (
            <button
              key={amenity.key}
              onClick={() => addPopularAmenity(amenity)}
              disabled={isAdded}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                isAdded
                  ? "bg-green-50 border-green-500 cursor-not-allowed"
                  : "bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50"
              }`}
            >
              {/* Checkmark for selected */}
              {isAdded && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}

              <span className="text-xl">{amenity.icon}</span>
              <span
                className={`text-sm font-medium ${
                  isAdded ? "text-green-700" : "text-gray-700"
                }`}
              >
                {amenity.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Added Amenities (Custom) */}
      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {value.map((amenity, index) => {
            const isPopular = POPULAR_AMENITIES.some(
              (p) => p.key === amenity.key,
            );

            return (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium ${
                  isPopular
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-purple-50 text-purple-700 border border-purple-300"
                }`}
              >
                <span>{amenity.icon || "✨"}</span>
                <span>{amenity.title}</span>
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                >
                  <span className="font-bold leading-none">×</span>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}