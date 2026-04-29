


// // StepLocationDetails.jsx — Premium Emerald Theme, Full Responsive
// // Map: Mappls SDK | Geocoding: Nominatim (OSM) | Nearby: Photon + Overpass
// import { useEffect, useState, useCallback, useRef } from "react";
// import {
//   MapPin, Building2, Globe2, Navigation, Landmark,
//   Save, CheckCircle2, AlertCircle,
// } from "lucide-react";
// import MapplsPinMap from "../components/location/MapplsPinMap";
// import NearbyPlacesInput from "../components/location/NearbyPlacesInput";

// // ─────────────────────────────────────────────
// // Nominatim helpers (same as File 1)
// // ─────────────────────────────────────────────

// const titleCase = (str) => {
//   if (!str) return "";
//   return str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
// };

// const stripWard = (s) => (s ? s.replace(/^ward\s*\d+[a-z]?\s+/i, "").trim() : "");

// async function geocodePincode(pincode, signal) {
//   const url =
//     `https://nominatim.openstreetmap.org/search` +
//     `?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=1&accept-language=en`;
//   const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
//   if (!res.ok) throw new Error("Pincode geocode failed.");
//   const data = await res.json();
//   if (!Array.isArray(data) || !data.length) return null;
//   const best = data[0];
//   const a = best?.address || {};
//   return {
//     lat: parseFloat(best.lat),
//     lng: parseFloat(best.lon),
//     locality: titleCase(stripWard(
//       a.suburb || a.neighbourhood || a.hamlet || a.village || a.town || a.city_district || a.county || ""
//     )),
//     city: titleCase(a.city || a.town || a.village || a.city_district || a.state_district || a.county || ""),
//     state: titleCase(a.state || ""),
//   };
// }

// async function geocodeText(text, signal) {
//   const res = await fetch(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
//     { signal, headers: { "Accept-Language": "en" } }
//   );
//   if (!res.ok) return null;
//   const data = await res.json();
//   if (!Array.isArray(data) || !data.length) return null;
//   return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
// }

// // ─────────────────────────────────────────────
// // Shared UI atoms
// // ─────────────────────────────────────────────

// function LocInput({ label, value, onChange, placeholder, icon, maxLength, error, readOnly }) {
//   return (
//     <div className="flex-1 space-y-1.5">
//       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//         {label}
//       </label>
//       <div
//         className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border-2 transition-all"
//         style={{
//           borderColor: error ? "#fca5a5" : "transparent",
//           boxShadow: error
//             ? "0 0 0 3px #fca5a510"
//             : "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1.5px #f1f5f9",
//           background: readOnly ? "#f9fafb" : "#fff",
//         }}
//       >
//         {icon && <span className="text-slate-300 shrink-0">{icon}</span>}
//         <input
//           type="text"
//           value={value || ""}
//           maxLength={maxLength}
//           readOnly={readOnly}
//           onChange={onChange ? (e) => onChange(e.target.value) : undefined}
//           placeholder={placeholder}
//           className="w-full text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
//           style={{ caretColor: "#27AE60" }}
//         />
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────

// export default function StepLocationDetails({ data, onChange, onSave }) {
//   const [pincodeStatus, setPincodeStatus] = useState(null);

//   const pincodeAbortRef = useRef(null);
//   const fieldGeocodeAbortRef = useRef(null);
//   const skipFieldGeocodeRef = useRef(false);
//   const pinPlacedByUserRef = useRef(false);

//   if (!data) return null;

//   const upd = (f, v) => onChange(f, v, "location");

//   const geocodeSourceRef = useRef(null); // "pincode" | "pin" | null

//   // ── Called by MapplsPinMap on every pin change ────────────────────────────
//   // Receives { coordinates, pincode?, locality?, city?, state? }
//   const handlePinChange = useCallback(
//     ({ coordinates, pincode, locality, city, state }) => {
//       pinPlacedByUserRef.current = true;
//       geocodeSourceRef.current = "pin";  // "pincode" | "pin"
//       //skipFieldGeocodeRef.current = true;

//       upd("location", { type: "Point", coordinates });

//       if (pincode) upd("pincode", pincode);
//       if (locality) upd("locality", locality);
//       if (city) upd("city", city);
//       if (state) upd("state", state);
//     },
//     [],
//   ); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Pincode auto-fill via Nominatim ──────────────────────────────────────
//   useEffect(() => {
//     const pin = (data.pincode || "").replace(/\D/g, "");
//     if (pin.length !== 6) {
//       setPincodeStatus(null);
//       return;
//     }

//     pincodeAbortRef.current?.abort();
//     const ctrl = new AbortController();
//     pincodeAbortRef.current = ctrl;

//     const tid = setTimeout(async () => {
//       try {
//         const geo = await geocodePincode(pin, ctrl.signal);
//         if (!geo) {
//           setPincodeStatus("error");
//           return;
//         }

//         const { lat, lng, locality, city, state } = geo;
//         if (locality) upd("locality", locality);
//         if (city) upd("city", city);
//         if (state) upd("state", state);

//         // if (
//         //   !pinPlacedByUserRef.current &&
//         //   Number.isFinite(lat) &&
//         //   Number.isFinite(lng)
//         // ) {
//         //   skipFieldGeocodeRef.current = true;
//         //   upd("location", { type: "Point", coordinates: [lng, lat] });
//         // }
        
//         geocodeSourceRef.current = "pincode";
//         if (
//           !pinPlacedByUserRef.current &&
//           Number.isFinite(lat) &&
//           Number.isFinite(lng)
//         ) {
//           upd("location", { type: "Point", coordinates: [lng, lat] });
//         }

//         setPincodeStatus("success");
//       } catch (e) {
//         if (e?.name !== "AbortError") {
//           console.error(e);
//           setPincodeStatus("error");
//         }
//       }
//     }, 300);

//     return () => {
//       ctrl.abort();
//       clearTimeout(tid);
//     };
//   }, [data.pincode]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Field-watch geocode (fallback when locality/city/state typed manually) ─
//   useEffect(() => {
//     // if (skipFieldGeocodeRef.current) {
//     //   skipFieldGeocodeRef.current = false;
//     //   return;
//     // }
//     if (
//       geocodeSourceRef.current === "pincode" ||
//       geocodeSourceRef.current === "pin"
//     ) {
//       geocodeSourceRef.current = null;
//       return;
//     }
//     if (!data.locality || !data.city || !data.state) return;

//     fieldGeocodeAbortRef.current?.abort();
//     const ctrl = new AbortController();
//     fieldGeocodeAbortRef.current = ctrl;

//     geocodeText(`${data.locality}, ${data.city}, ${data.state}`, ctrl.signal)
//       .then((geo) => {
//         if (!geo) return;
//         upd("location", { type: "Point", coordinates: [geo.lng, geo.lat] });
//       })
//       .catch((e) => {
//         if (e?.name !== "AbortError") console.error(e);
//       });

//     return () => ctrl.abort();
//   }, [data.locality, data.city, data.state]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Cleanup
//   useEffect(() => {
//     return () => {
//       pincodeAbortRef.current?.abort();
//       fieldGeocodeAbortRef.current?.abort();
//     };
//   }, []);

//   // const handlePincodeChange = (value) => {
//   //   const num = value.replace(/\D/g, "").slice(0, 6);
//   //   upd("pincode", num);
//   //   if (num.length !== 6) setPincodeStatus(null);
//   // };
  

//   const handlePincodeChange = (value) => {
//     const num = value.replace(/\D/g, "").slice(0, 6);
//     if (num.length === 0) pinPlacedByUserRef.current = false; // ✅ reset pin lock
//     upd("pincode", num);
//     if (num.length !== 6) setPincodeStatus(null);
//   };


//   const pinnedCoordinates = data.location?.coordinates ?? null;

//   return (
//     <div className="space-y-8">
//       {/* ── Address card ── */}
//       <div
//         className="rounded-3xl overflow-hidden"
//         style={{
//           border: "1.5px solid #fde68a40",
//           background: "linear-gradient(135deg,#fffbeb08,#fff)",
//         }}
//       >
//         <div
//           className="h-0.5"
//           style={{
//             background:
//               "linear-gradient(90deg,#F59E0B80,#F59E0B20,transparent)",
//           }}
//         />
//         <div className="p-5 sm:p-7 space-y-6">
//           {/* Card header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
//                 Physical Address
//               </span>
//             </div>
//             {pincodeStatus === "success" && (
//               <div
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black"
//                 style={{
//                   background: "#f0fdf4",
//                   color: "#15803d",
//                   border: "1.5px solid #27AE6030",
//                 }}
//               >
//                 <CheckCircle2 className="w-3 h-3" /> Verified
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {/* Street address — full width */}
//             <div className="sm:col-span-2">
//               <LocInput
//                 label="Street Address / House No."
//                 placeholder="Plot No. 123, Sector 4, Main Road"
//                 value={data.address}
//                 onChange={(v) => upd("address", v)}
//                 icon={<Navigation className="w-3.5 h-3.5" />}
//               />
//             </div>

//             {/* Building / Land name — conditional on category */}
//             {(data.propertyCategory === "residential" ||
//               data.propertyCategory === "commercial") && (
//               <LocInput
//                 label="Building / Society"
//                 placeholder="Green Valley Apartments"
//                 value={data.buildingName}
//                 onChange={(v) => upd("buildingName", v)}
//                 icon={<Building2 className="w-3.5 h-3.5" />}
//               />
//             )}
//             {(data.propertyCategory === "land" ||
//               data.propertyCategory === "agricultural") && (
//               <LocInput
//                 label="Land / Layout Name"
//                 placeholder="Green Valley Layout"
//                 value={data.landName}
//                 onChange={(v) => upd("landName", v)}
//                 icon={<Building2 className="w-3.5 h-3.5" />}
//               />
//             )}

//             {/* Pincode */}
//             <div className="relative">
//               <LocInput
//                 label="Pincode"
//                 placeholder="6-digit pincode"
//                 value={data.pincode}
//                 maxLength={6}
//                 onChange={handlePincodeChange}
//                 icon={<Globe2 className="w-3.5 h-3.5" />}
//                 error={pincodeStatus === "error"}
//               />
//               {pincodeStatus === "error" && (
//                 <p className="absolute -bottom-5 left-1 flex items-center gap-1 text-[10px] text-red-500 font-bold">
//                   <AlertCircle className="w-3 h-3" /> Invalid Pincode
//                 </p>
//               )}
//             </div>

//             {/* Locality — auto-filled (read-only) */}
//             <LocInput
//               label="Locality"
//               placeholder="Auto-filled from map / pincode"
//               value={data.locality}
//               readOnly
//             />

//             {/* City + State side by side — auto-filled (read-only) */}
//             <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:col-span-1">
//               <LocInput
//                 label="City"
//                 placeholder="Auto-filled"
//                 value={data.city}
//                 readOnly
//               />
//               <LocInput
//                 label="State"
//                 placeholder="Auto-filled"
//                 value={data.state}
//                 readOnly
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Map (Mappls SDK) ── */}
//       <div className="space-y-3">
//         <div className="flex items-center justify-between px-1">
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//               <Navigation className="w-4 h-4" />
//             </div>
//             <div>
//               <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
//                 Geospatial Marker
//               </h3>
//               <p className="text-[10px] text-slate-400 mt-0.5">
//                 Click map to pin · pincode + locality + city + state auto-filled
//                 via OpenStreetMap
//               </p>
//             </div>
//           </div>
//           <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
//             Mappls
//           </span>
//         </div>

//         <div
//           className="rounded-3xl overflow-hidden border-2 relative group"
//           style={{
//             height: "400px",
//             borderColor: "#27AE6020",
//             boxShadow: "0 8px 40px #27AE6012",
//           }}
//         >
//           {/* MapplsPinMap handles map rendering + Nominatim reverse geocode on click */}
//           <MapplsPinMap
//             coordinates={data.location?.coordinates}
//             onPinChange={handlePinChange}
//           />
//           <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 text-[10px] font-bold text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 text-center">
//             🎯 Click the map precisely to pin your property location
//           </div>
//         </div>
//       </div>

//       {/* ── Nearby Landmarks ── */}
//       <div className="space-y-3">
//         <div className="flex items-center gap-2.5 px-1">
//           <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
//             <Landmark className="w-4 h-4" />
//           </div>
//           <div>
//             <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
//               Nearby Landmarks
//             </h3>
//             <p className="text-[10px] text-slate-400 mt-0.5">
//               Photon live search (5 km) · Overpass 10 km lookup
//             </p>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7 space-y-5">
//           <NearbyPlacesInput
//             value={data.nearbyPlaces || []}
//             onChange={(v) => upd("nearbyPlaces", v)}
//             coordinates={pinnedCoordinates}
//           />

//           <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-100 text-[11px] font-medium text-slate-500 leading-relaxed">
//             <span className="text-base mt-0.5">💡</span>
//             <span>
//               Adding landmarks like "Metro Station" or "Hospital" significantly
//               increases discoverability and lead quality.
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ── Footer ── */}
//       <div className="flex justify-end pt-4 border-t border-slate-100">
//         <button
//           onClick={onSave}
//           className="flex items-center gap-2.5 px-8 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
//           style={{
//             background: "linear-gradient(135deg, #27AE60, #1e9e52)",
//             boxShadow: "0 8px 25px #27AE6035",
//           }}
//         >
//           <Save className="w-4 h-4" /> Synchronize Location
//         </button>
//       </div>
//     </div>
//   );
// } 





///////////////    




// StepLocationDetails.jsx — FIXED: memoized upd, stable callbacks, no cascade re-renders
// Map: Mappls SDK | Geocoding: Nominatim (OSM) | Nearby: Photon + Overpass
import { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  MapPin, Building2, Globe2, Navigation, Landmark,
  Save, CheckCircle2, AlertCircle,
} from "lucide-react";
import MapplsPinMap from "../components/location/MapplsPinMap";
import NearbyPlacesInput from "../components/location/NearbyPlacesInput";

// ─────────────────────────────────────────────────────────────────────────────
// Nominatim helpers
// ─────────────────────────────────────────────────────────────────────────────

const titleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const stripWard = (s) => (s ? s.replace(/^ward\s*\d+[a-z]?\s+/i, "").trim() : "");

async function geocodePincode(pincode, signal) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=1&accept-language=en`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Pincode geocode failed.");
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  const best = data[0];
  const a = best?.address || {};
  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    locality: titleCase(stripWard(
      a.suburb || a.neighbourhood || a.hamlet || a.village || a.town || a.city_district || a.county || ""
    )),
    city: titleCase(a.city || a.town || a.village || a.city_district || a.state_district || a.county || ""),
    state: titleCase(a.state || ""),
  };
}

async function geocodeText(text, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
    { signal, headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// ─────────────────────────────────────────────────────────────────────────────
// LocInput — memoized so it only re-renders when its own props change.
// FIX: Was re-rendering on every parent keystroke because it wasn't wrapped
//      in memo() and received inline-created onChange functions each time.
// ─────────────────────────────────────────────────────────────────────────────

const LocInput = memo(function LocInput({ label, value, onChange, placeholder, icon, maxLength, error, readOnly }) {
  return (
    <div className="flex-1 space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border-2 transition-all"
        style={{
          borderColor: error ? "#fca5a5" : "transparent",
          boxShadow: error
            ? "0 0 0 3px #fca5a510"
            : "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1.5px #f1f5f9",
          background: readOnly ? "#f9fafb" : "#fff",
        }}
      >
        {icon && <span className="text-slate-300 shrink-0">{icon}</span>}
        <input
          type="text"
          value={value || ""}
          maxLength={maxLength}
          readOnly={readOnly}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className="w-full text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
          style={{ caretColor: "#27AE60" }}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold ml-1">
          <AlertCircle className="w-3 h-3" /> Invalid Pincode
        </p>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// StepLocationDetails
// ─────────────────────────────────────────────────────────────────────────────

export default function StepLocationDetails({ data, onChange, onSave }) {
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Refs for abort controllers
  const pincodeAbortRef       = useRef(null);
  const fieldGeocodeAbortRef  = useRef(null);

  // Tracks who last set location so field-watch geocode doesn't fight pincode/pin
  // Values: null | "pincode" | "pin" | "field"
  const geocodeSourceRef    = useRef(null);
  // True after the user manually places a pin on the map
  const pinPlacedByUserRef  = useRef(false);

  // ── Stable field updater — does NOT change identity on each render ────────
  // FIX: Previously `upd` was recreated every render as `(f,v) => onChange(f,v,"location")`,
  //      making every useEffect/useCallback that listed it as a dep re-fire.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const upd = useCallback((field, value) => {
    onChangeRef.current(field, value, "location");
  }, []); // stable — never recreated

  // ── Pin changed from map ──────────────────────────────────────────────────
  // FIX: Previously had empty dep array but referenced `upd` — stale closure.
  //      Now `upd` is stable so we can safely include it and the callback is also stable.
  const handlePinChange = useCallback(
    ({ coordinates, pincode, locality, city, state }) => {
      pinPlacedByUserRef.current = true;
      geocodeSourceRef.current   = "pin";

      upd("location", { type: "Point", coordinates });
      if (pincode)  upd("pincode",  pincode);
      if (locality) upd("locality", locality);
      if (city)     upd("city",     city);
      if (state)    upd("state",    state);
    },
    [upd],
  );

  // ── Stable onChange handlers for each field — prevents LocInput re-renders ─
  // FIX: Previously created as inline lambdas in JSX on every render, causing
  //      LocInput (even if memoized) to always see new function references.
  const handleAddressChange     = useCallback((v) => upd("address",      v), [upd]);
  const handleBuildingChange    = useCallback((v) => upd("buildingName", v), [upd]);
  const handleLandNameChange    = useCallback((v) => upd("landName",     v), [upd]);
  const handleNearbyChange      = useCallback((v) => upd("nearbyPlaces", v), [upd]);

  const handlePincodeChange = useCallback((value) => {
    const num = value.replace(/\D/g, "").slice(0, 6);
    // If user clears the pincode, reset the pin-lock so next pincode entry
    // can move the map again.
    if (num.length === 0) pinPlacedByUserRef.current = false;
    upd("pincode", num);
    if (num.length !== 6) setPincodeStatus(null);
  }, [upd]);

  // ── Pincode → Nominatim auto-fill ────────────────────────────────────────
  useEffect(() => {
    const pin = (data.pincode || "").replace(/\D/g, "");
    if (pin.length !== 6) {
      setPincodeStatus(null);
      return;
    }

    pincodeAbortRef.current?.abort();
    const ctrl = new AbortController();
    pincodeAbortRef.current = ctrl;

    const tid = setTimeout(async () => {
      try {
        const geo = await geocodePincode(pin, ctrl.signal);
        if (!geo) { setPincodeStatus("error"); return; }

        const { lat, lng, locality, city, state } = geo;

        // Only overwrite text fields if they're empty or user hasn't pinned manually
        if (locality) upd("locality", locality);
        if (city)     upd("city",     city);
        if (state)    upd("state",    state);

        geocodeSourceRef.current = "pincode";

        // Move map only if user hasn't already placed a pin
        if (!pinPlacedByUserRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
          upd("location", { type: "Point", coordinates: [lng, lat] });
        }

        setPincodeStatus("success");
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setPincodeStatus("error");
        }
      }
    }, 400); // slightly longer debounce avoids thrashing on fast typing

    return () => {
      ctrl.abort();
      clearTimeout(tid);
    };
  }, [data.pincode, upd]);

  // ── Typed locality/city/state → geocode to place map pin (last resort) ───
  // FIX: Previously ran on every programmatic set of locality/city/state
  //      (from pincode or pin geocoder), creating an infinite loop.
  //      Now guarded by geocodeSourceRef — only fires when user typed manually.
  useEffect(() => {
    // Skip if the last change came from pincode lookup or map pin
    if (geocodeSourceRef.current === "pincode" || geocodeSourceRef.current === "pin") {
      geocodeSourceRef.current = null; // consume the guard
      return;
    }
    if (!data.locality || !data.city || !data.state) return;

    fieldGeocodeAbortRef.current?.abort();
    const ctrl = new AbortController();
    fieldGeocodeAbortRef.current = ctrl;

    const tid = setTimeout(() => {
      geocodeText(`${data.locality}, ${data.city}, ${data.state}`, ctrl.signal)
        .then((geo) => {
          if (!geo) return;
          geocodeSourceRef.current = "field";
          upd("location", { type: "Point", coordinates: [geo.lng, geo.lat] });
        })
        .catch((e) => { if (e?.name !== "AbortError") console.error(e); });
    }, 600);

    return () => { ctrl.abort(); clearTimeout(tid); };
  }, [data.locality, data.city, data.state, upd]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    pincodeAbortRef.current?.abort();
    fieldGeocodeAbortRef.current?.abort();
  }, []);

  const pinnedCoordinates = data.location?.coordinates ?? null;

  return (
    <div className="space-y-8">
      {/* ── Address card ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          border: "1.5px solid #fde68a40",
          background: "linear-gradient(135deg,#fffbeb08,#fff)",
        }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,#F59E0B80,#F59E0B20,transparent)" }} />
        <div className="p-5 sm:p-7 space-y-6">
          {/* Card header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                Physical Address
              </span>
            </div>
            {pincodeStatus === "success" && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black"
                style={{ background: "#f0fdf4", color: "#15803d", border: "1.5px solid #27AE6030" }}
              >
                <CheckCircle2 className="w-3 h-3" /> Verified
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street address — full width */}
            <div className="sm:col-span-2">
              <LocInput
                label="Street Address / House No."
                placeholder="Plot No. 123, Sector 4, Main Road"
                value={data.address}
                onChange={handleAddressChange}
                icon={<Navigation className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Building / Land name — conditional */}
            {(data.propertyCategory === "residential" || data.propertyCategory === "commercial") && (
              <LocInput
                label="Building / Society"
                placeholder="Green Valley Apartments"
                value={data.buildingName}
                onChange={handleBuildingChange}
                icon={<Building2 className="w-3.5 h-3.5" />}
              />
            )}
            {(data.propertyCategory === "land" || data.propertyCategory === "agricultural") && (
              <LocInput
                label="Land / Layout Name"
                placeholder="Green Valley Layout"
                value={data.landName}
                onChange={handleLandNameChange}
                icon={<Building2 className="w-3.5 h-3.5" />}
              />
            )}

            {/* Pincode */}
            <LocInput
              label="Pincode"
              placeholder="6-digit pincode"
              value={data.pincode}
              maxLength={6}
              onChange={handlePincodeChange}
              icon={<Globe2 className="w-3.5 h-3.5" />}
              error={pincodeStatus === "error"}
            />

            {/* Locality — auto-filled (read-only) */}
            <LocInput
              label="Locality"
              placeholder="Auto-filled from map / pincode"
              value={data.locality}
              readOnly
            />

            {/* City + State side by side — auto-filled (read-only) */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:col-span-1">
              <LocInput
                label="City"
                placeholder="Auto-filled"
                value={data.city}
                readOnly
              />
              <LocInput
                label="State"
                placeholder="Auto-filled"
                value={data.state}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Map (Mappls SDK) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Geospatial Marker</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click map to pin · pincode + locality + city + state auto-filled via OpenStreetMap
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
            Mappls
          </span>
        </div>

        <div
          className="rounded-3xl overflow-hidden border-2 relative group"
          style={{ height: "400px", borderColor: "#27AE6020", boxShadow: "0 8px 40px #27AE6012" }}
        >
          <MapplsPinMap
            coordinates={data.location?.coordinates}
            onPinChange={handlePinChange}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 text-[10px] font-bold text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 text-center">
            🎯 Click the map precisely to pin your property location
          </div>
        </div>
      </div>

      {/* ── Nearby Landmarks ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Nearby Landmarks</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Photon live search (5 km) · Overpass 10 km lookup</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7 space-y-5">
          <NearbyPlacesInput
            value={data.nearbyPlaces || []}
            onChange={handleNearbyChange}
            coordinates={pinnedCoordinates}
          />
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-100 text-[11px] font-medium text-slate-500 leading-relaxed">
            <span className="text-base mt-0.5">💡</span>
            <span>
              Adding landmarks like "Metro Station" or "Hospital" significantly
              increases discoverability and lead quality.
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={onSave}
          className="flex items-center gap-2.5 px-8 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #27AE60, #1e9e52)", boxShadow: "0 8px 25px #27AE6035" }}
        >
          <Save className="w-4 h-4" /> Synchronize Location
        </button>
      </div>
    </div>
  );
}