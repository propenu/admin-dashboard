// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { useState } from "react";

// // 🔴 Fix default marker icon
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// // Custom red marker icon
// const redIcon = new L.Icon({
//   iconUrl:
//     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });

// function LocationMarker({ position, onChange }) {
//   useMapEvents({
//     click(e) {
//       onChange([e.latlng.lng, e.latlng.lat]); // lng, lat
//     },
//   });

//   return position ? (
//     <>
//       <Marker position={position} icon={redIcon} />
//     </>
//   ) : null;
// }

// export default function OpenStreetPinMap({ value, onChange }) {
//   const coords = value?.coordinates;
//   const position = coords ? [coords[1], coords[0]] : [17.385, 78.4867]; // fallback Hyderabad
//   const [useCurrentLocation, setUseCurrentLocation] = useState(false);

//   const handleUseCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords;
//           onChange([longitude, latitude]);
//           setUseCurrentLocation(true);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           alert("Unable to get current location");
//         },
//       );
//     } else {
//       alert("Geolocation is not supported by your browser");
//     }
//   };

//   return (
//     <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
//       {/* Map Header */}
//       <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
//         <span className="text-green-600 text-xl">📍</span>
//         <div>
//           <div className="text-sm font-semibold text-gray-900">
//             Select location, City
//           </div>
//           <div className="text-xs text-gray-500">
//             State - {value?.coordinates ? "Pinned" : "000000"}
//           </div>
//         </div>
//       </div>

//       {/* Use Current Location Button */}
//       <button
//         onClick={handleUseCurrentLocation}
//         className="absolute bottom-4 right-4 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm font-medium"
//       >
//         <span>📍</span>
//         Use Current Location
//       </button>

//       {/* Interactive Map Badge */}
//       <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
//         Interactive Map
//       </div>

//       {/* Zoom Controls */}
//       <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
//         <button className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors">
//           +
//         </button>
//         <div className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center text-xs font-medium text-gray-600">
//           13×
//         </div>
//         <button className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors">
//           −
//         </button>
//       </div>

//       {/* Map Container */}
//       <div className="h-96">
//         <MapContainer
//           center={position}
//           zoom={13}
//           scrollWheelZoom
//           style={{ height: "100%", width: "100%" }}
//           zoomControl={false}
//         >
//           <TileLayer
//             attribution="© OpenStreetMap"
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           <LocationMarker
//             position={coords ? position : null}
//             onChange={onChange}
//           />
//         </MapContainer>
//       </div>

//       {/* Property Label on Marker */}
//       {coords && (
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full mb-12 z-[1000] pointer-events-none">
//           <div className="bg-white rounded-lg shadow-lg px-3 py-1 border-2 border-red-500">
//             <div className="text-xs font-semibold text-red-600">
//               Your Property
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// } 



// OpenStreetPinMap.jsx
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

// Fix default marker icon paths (bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom red marker for property pin
const redIcon = new L.Icon({
  iconUrl:      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});

// ─────────────────────────────────────────────
// Inner component — handles map click events
// ─────────────────────────────────────────────

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lng, e.latlng.lat]); // store as [lng, lat] (GeoJSON order)
    },
  });

  return position ? <Marker position={position} icon={redIcon} /> : null;
}

// ─────────────────────────────────────────────
// Main export
// Props:
//   value    – { type: "Point", coordinates: [lng, lat] } | null
//   onChange – ([lng, lat]) => void
// ─────────────────────────────────────────────

export default function OpenStreetPinMap({ value, onChange }) {
  const coords   = value?.coordinates;                          // [lng, lat]
  const position = coords ? [coords[1], coords[0]] : [17.385, 78.4867]; // fallback: Hyderabad
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange([pos.coords.longitude, pos.coords.latitude]);
        setLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to get current location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 h-full">

      {/* Map info badge — top left */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
        <span className="text-green-600 text-xl">📍</span>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {coords ? "Location Pinned" : "Select Location"}
          </div>
          <div className="text-xs text-gray-500">
            {coords
              ? `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`
              : "Click map to pin"}
          </div>
        </div>
      </div>

      {/* Use current location button — bottom right */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="absolute bottom-4 right-4 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg
          flex items-center gap-2 hover:bg-green-700 transition-colors text-sm font-medium
          disabled:opacity-60 disabled:cursor-wait"
      >
        <span>📍</span>
        {locating ? "Detecting…" : "Use Current Location"}
      </button>

      {/* Interactive map badge — bottom left */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
        Interactive Map
      </div>

      {/* Map */}
      <div className="h-full w-full">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={coords ? position : null}
            onChange={onChange}
          />
        </MapContainer>
      </div>

      {/* "Your Property" label above the marker */}
      {coords && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full mb-12 z-[1000] pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg px-3 py-1 border-2 border-red-500">
            <div className="text-xs font-semibold text-red-600">Your Property</div>
          </div>
        </div>
      )}
    </div>
  );
}

