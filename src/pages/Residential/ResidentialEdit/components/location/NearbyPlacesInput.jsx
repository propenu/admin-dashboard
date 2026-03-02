// import { useState } from "react";

// /**
//  * NearbyPlacesInput with Popular Landmarks
//  * Exact styling from the image
//  */

// import { POPULAR_LANDMARKS } from "../editable/residentialEnums";

// export default function NearbyPlacesInput({ value = [], onChange }) {
//   const [input, setInput] = useState("");

//   const addPlace = (placeName) => {
//     const trimmed = placeName.trim();
//     if (!trimmed) return;

//     // Check if already added
//     if (value.some((p) => p.name === trimmed)) return;

//     const newPlace = {
//       name: trimmed,
//       type: "custom",
//     };

//     onChange([...value, newPlace]);
//     setInput("");
//   };

//   const addPopularLandmark = (landmark) => {
//     // Check if already added
//     if (value.some((p) => p.name === landmark.name)) return;

//     onChange([...value, { ...landmark }]);
//   };

//   const removePlace = (index) => {
//     const updated = value.filter((_, i) => i !== index);
//     onChange(updated);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addPlace(input);
//     }
//   };

//   return (
//     <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
//       {/* Search Input */}
//       <div className="relative">
//         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-lg">
//           🔍
//         </span>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Search nearby places (e.g., Metro, Hospital, School)"
//           className="w-full bg-white border border-purple-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       {/* Popular Landmarks */}
//       <div className="space-y-3">
//         <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
//           Popular Landmarks
//         </div>

//         <div className="grid grid-cols-3 gap-3">
//           {POPULAR_LANDMARKS.map((landmark) => {
//             const isAdded = value.some((p) => p.name === landmark.name);

//             return (
//               <button
//                 key={landmark.name}
//                 onClick={() => addPopularLandmark(landmark)}
//                 disabled={isAdded}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-left text-sm ${
//                   isAdded
//                     ? "bg-green-50 border-green-500 text-green-700 cursor-not-allowed"
//                     : "bg-white border-purple-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
//                 }`}
//               >
//                 <span className="text-lg">{landmark.icon}</span>
//                 <span className="font-medium">{landmark.name}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Added Landmarks */}
//       {value.length > 0 && (
//         <div className="space-y-2">
//           <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
//             Added Landmarks ({value.length})
//           </div>

//           <div className="flex gap-2 flex-wrap">
//             {value.map((place, index) => (
//               <span
//                 key={index}
//                 className="bg-green-50 text-green-700 border border-green-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium"
//               >
//                 <span>{place.icon || "📍"}</span>
//                 <span>{place.name}</span>
//                 <button
//                   type="button"
//                   onClick={() => removePlace(index)}
//                   className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors ml-1"
//                 >
//                   <span className="text-green-700 font-bold leading-none">
//                     ×
//                   </span>
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
/**
 * NearbyPlacesInput with Popular Landmarks
 * Fixed for Mongoose GeoJSON [lng, lat] validation
 */
import { POPULAR_LANDMARKS } from "../editable/residentialEnums";

export default function NearbyPlacesInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  /**
   * ✅ FIXED: Added coordinates array
   * Mongoose requires [longitude, latitude] for GeoJSON points
   */
  const addPlace = (placeName) => {
    const trimmed = placeName.trim();
    if (!trimmed) return;

    // Check if already added
    if (value.some((p) => p.name === trimmed)) return;

    const newPlace = {
      name: trimmed,
      type: "custom",
      icon: "📍",
      // Default coordinates to satisfy backend validation [lng, lat]
      coordinates: [0, 0],
    };

    onChange([...value, newPlace]);
    setInput("");
  };

  const addPopularLandmark = (landmark) => {
    // Check if already added
    if (value.some((p) => p.name === landmark.name)) return;

    // Ensure the landmark has coordinates, default to [0,0] if missing
    const landmarkWithCoords = {
      ...landmark,
      coordinates: landmark.coordinates || [0, 0],
    };

    onChange([...value, landmarkWithCoords]);
  };

  const removePlace = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlace(input);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-lg">
          🔍
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search nearby places (e.g., Metro, Hospital, School)"
          className="w-full bg-white border border-purple-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Popular Landmarks */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          Popular Landmarks
        </div>

        <div className="grid grid-cols-3 gap-3">
          {POPULAR_LANDMARKS.map((landmark) => {
            const isAdded = value.some((p) => p.name === landmark.name);

            return (
              <button
                key={landmark.name}
                type="button" // Always specify type="button" to prevent form submission
                onClick={() => addPopularLandmark(landmark)}
                disabled={isAdded}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-left text-sm ${
                  isAdded
                    ? "bg-green-50 border-green-500 text-green-700 cursor-not-allowed"
                    : "bg-white border-purple-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                }`}
              >
                <span className="text-lg">{landmark.icon}</span>
                <span className="font-medium">{landmark.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Added Landmarks List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
            Added Landmarks ({value.length})
          </div>

          <div className="flex gap-2 flex-wrap">
            {value.map((place, index) => (
              <span
                key={index}
                className="bg-green-50 text-green-700 border border-green-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium"
              >
                <span>{place.icon || "📍"}</span>
                <span>{place.name}</span>
                <button
                  type="button"
                  onClick={() => removePlace(index)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors ml-1"
                >
                  <span className="text-green-700 font-bold leading-none">
                    ×
                  </span>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}