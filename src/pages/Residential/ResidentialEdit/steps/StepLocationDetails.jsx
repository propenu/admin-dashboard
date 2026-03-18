// import { useEffect, useState } from "react";
// import { search } from "india-pincode-search";
// import {
//   MapPin,
//   Building,
//   Globe,
//   Navigation,
//   Landmark,
//   Save,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";
// import OpenStreetPinMap from "../components/location/OpenStreetPinMap";
// import NearbyPlacesInput from "../components/location/NearbyPlacesInput";

// export default function StepLocationDetails({ data, onChange, onSave }) {
//   const [pincodeStatus, setPincodeStatus] = useState(null); // 'success', 'error', null

//   if (!data) return null;

//   const handleUpdate = (field, value) => {
//     onChange(field, value, "location");
//   };

//   /* -------------------------------------------------------
//       AUTO GEO-CODE LOGIC
//   ------------------------------------------------------- */
//   useEffect(() => {
//     if (!data.locality || !data.city || !data.state) return;

//     const controller = new AbortController();
//     const fetchCoordinates = async () => {
//       try {
//         const query = `${data.locality}, ${data.city}, ${data.state}`;
//         const res = await fetch(
//           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
//           {
//             signal: controller.signal,
//             headers: { "Accept-Language": "en" },
//           },
//         );

//         const geo = await res.json();
//         if (!geo || geo.length === 0) return;

//         handleUpdate("location", {
//           type: "Point",
//           coordinates: [Number(geo[0].lon), Number(geo[0].lat)],
//         });
//       } catch (e) {
//         if (e.name !== "AbortError") console.error("Geocode error", e);
//       }
//     };

//     fetchCoordinates();
//     return () => controller.abort();
//   }, [data.locality, data.city, data.state]);

//   /* -------------------------------------------------------
//       PINCODE AUTO-FILL
//   ------------------------------------------------------- */
//   const handlePincodeChange = (value) => {
//     const numeric = value.replace(/\D/g, "");
//     handleUpdate("pincode", numeric);

//     if (numeric.length !== 6) {
//       setPincodeStatus(null);
//       return;
//     }

//     try {
//       const result = search(numeric);
//       if (!result || result.length === 0) {
//         setPincodeStatus("error");
//         return;
//       }

//       const pin = result[0];
//       if (pin.state) handleUpdate("state", toTitleCase(pin.state));
//       if (pin.city || pin.district)
//         handleUpdate("city", toTitleCase(pin.city || pin.district));
//       if (pin.village || pin.office || pin.taluk) {
//         handleUpdate(
//           "locality",
//           toTitleCase(pin.village || pin.office || pin.taluk),
//         );
//       }
//       setPincodeStatus("success");
//     } catch (error) {
//       setPincodeStatus("error");
//     }
//   };

//   return (
//     <div className="space-y-10">
//       {/* 1. Address Section */}
//       <div className="group bg-white p-1 rounded-[2.5rem] border-2 border-slate-100 hover:border-orange-100 transition-all duration-500 shadow-sm">
//         <div className="bg-orange-50/30 rounded-[2.3rem] p-6 md:p-8 space-y-8">
//           <div className="flex items-center justify-between">
//             <h3 className="text-orange-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
//               <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
//                 <MapPin className="w-4 h-4" />
//               </span>
//               Physical Address
//             </h3>
//             {pincodeStatus === "success" && (
//               <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg animate-pulse">
//                 <CheckCircle2 className="w-3 h-3" /> VERIFIED PINCODE
//               </span>
//             )}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Full Street Address - Spans 2 cols */}
//             <div className="md:col-span-2">
//               <LocationInput
//                 label="Street Address / House No."
//                 placeholder="e.g., Plot No. 123, Sector 4, Main Road"
//                 value={data.address}
//                 onChange={(v) => handleUpdate("address", v)}
//                 icon={<Navigation className="w-4 h-4" />}
//               />
//             </div>

//             <LocationInput
//               label="Building / Society Name"
//               placeholder="e.g., Green Valley Apartments"
//               value={data.buildingName}
//               onChange={(v) => handleUpdate("buildingName", v)}
//               icon={<Building className="w-4 h-4" />}
//             />

//             <div className="relative">
//               <LocationInput
//                 label="Pincode"
//                 placeholder="6 Digit Pincode"
//                 value={data.pincode}
//                 maxLength={6}
//                 onChange={handlePincodeChange}
//                 icon={<Globe className="w-4 h-4" />}
//                 error={pincodeStatus === "error"}
//               />
//               {pincodeStatus === "error" && (
//                 <p className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold flex items-center gap-1">
//                   <AlertCircle className="w-3 h-3" /> Invalid Pincode
//                 </p>
//               )}
//             </div>

//             <LocationInput
//               label="Locality"
//               value={data.locality}
//               onChange={(v) => handleUpdate("locality", v)}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <LocationInput
//                 label="City"
//                 value={data.city}
//                 onChange={(v) => handleUpdate("city", v)}
//               />
//               <LocationInput
//                 label="State"
//                 value={data.state}
//                 onChange={(v) => handleUpdate("state", v)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 2. Map Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
//         <div className="lg:col-span-2 space-y-4">
//           <div className="flex items-center justify-between px-2">
//             <div className="flex items-center gap-2">
//               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
//                 <Navigation className="w-4 h-4" />
//               </div>
//               <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
//                 Geospatial Marker
//               </h3>
//             </div>
//             <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
//               Interactive
//             </span>
//           </div>

//           <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50 h-[400px] relative group">
//             <OpenStreetPinMap
//               value={data.location}
//               onChange={(coords) =>
//                 handleUpdate("location", {
//                   type: "Point",
//                   coordinates: coords,
//                 })
//               }
//             />
//             <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-medium text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
//               Pro Tip: Drag the red marker exactly to the property entrance for
//               better navigation.
//             </div>
//           </div>
//         </div>

//         {/* 3. Landmarks Section */}
//         <div className="space-y-4">
//           <div className="flex items-center gap-2 px-2">
//             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
//               <Landmark className="w-4 h-4" />
//             </div>
//             <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
//               Nearby Points
//             </h3>
//           </div>

//           <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 min-h-[400px]">
//             <NearbyPlacesInput
//               value={data.nearbyPlaces || []}
//               onChange={(places) => handleUpdate("nearbyPlaces", places)}
//             />
//             <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
//               <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
//                 Adding landmarks like "Metro Station" or "Hospitals" increases
//                 property visibility by up to 40%.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Manual Sync Trigger */}
//       <div className="flex justify-end pt-4">
//         <button
//           onClick={onSave}
//           className="group flex items-center gap-3 bg-[#1E293B] hover:bg-black text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-2xl shadow-slate-200"
//         >
//           <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
//           Synchronize Location
//         </button>
//       </div>
//     </div>
//   );
// }

// /**
//  * Custom Styled Input for Location Step
//  */
// function LocationInput({
//   label,
//   value,
//   onChange,
//   placeholder,
//   icon,
//   maxLength,
//   error,
// }) {
//   return (
//     <div className="space-y-1.5 flex-1">
//       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
//         {label}
//       </label>
//       <div
//         className={`flex items-center gap-3 bg-white px-4 py-3.5 rounded-2xl border-2 transition-all ${
//           error
//             ? "border-red-200 ring-4 ring-red-50"
//             : "border-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/5"
//         } shadow-sm`}
//       >
//         {icon && <span className="text-slate-300">{icon}</span>}
//         <input
//           type="text"
//           value={value || ""}
//           maxLength={maxLength}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className="w-full text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
//         />
//       </div>
//     </div>
//   );
// }

// function toTitleCase(str = "") {
//   return str
//     .toLowerCase()
//     .split(" ")
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");
// }


// ci 

// StepLocationDetails.jsx — Premium Emerald Theme, Full Responsive
import { useEffect, useState } from "react";
import { search } from "india-pincode-search";
import { MapPin, Building2, Globe2, Navigation, Landmark, Save, CheckCircle2, AlertCircle } from "lucide-react";
import OpenStreetPinMap from "../components/location/OpenStreetPinMap";
import NearbyPlacesInput from "../components/location/NearbyPlacesInput";

export default function StepLocationDetails({ data, onChange, onSave }) {
  const [pincodeStatus, setPincodeStatus] = useState(null);
  if (!data) return null;
  const upd = (f, v) => onChange(f, v, "location");

  useEffect(() => {
    if (!data.locality || !data.city || !data.state) return;
    const controller = new AbortController();
    const go = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${data.locality}, ${data.city}, ${data.state}`)}&limit=1`, { signal: controller.signal, headers: { "Accept-Language": "en" } });
        const geo = await res.json();
        if (geo?.length) upd("location", { type: "Point", coordinates: [Number(geo[0].lon), Number(geo[0].lat)] });
      } catch (e) { if (e.name !== "AbortError") console.error(e); }
    };
    go();
    return () => controller.abort();
  }, [data.locality, data.city, data.state]);

  const handlePin = (value) => {
    const num = value.replace(/\D/g, "");
    upd("pincode", num);
    if (num.length !== 6) { setPincodeStatus(null); return; }
    try {
      const res = search(num);
      if (!res?.length) { setPincodeStatus("error"); return; }
      const p = res[0];
      if (p.state) upd("state", toTitle(p.state));
      if (p.city || p.district) upd("city", toTitle(p.city || p.district));
      if (p.village || p.office || p.taluk) upd("locality", toTitle(p.village || p.office || p.taluk));
      setPincodeStatus("success");
    } catch { setPincodeStatus("error"); }
  };

  return (
    <div className="space-y-8">
      {/* Address */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          border: "1.5px solid #fde68a40",
          background: "linear-gradient(135deg,#fffbeb08,#fff)",
        }}
      >
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg,#F59E0B80,#F59E0B20,transparent)",
          }}
        />
        <div className="p-5 sm:p-7 space-y-6">
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
                style={{
                  background: "#f0fdf4",
                  color: "#15803d",
                  border: "1.5px solid #27AE6030",
                }}
              >
                <CheckCircle2 className="w-3 h-3" /> Verified
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <LocInput
                label="Street Address / House No."
                placeholder="Plot No. 123, Sector 4, Main Road"
                value={data.address}
                onChange={(v) => upd("address", v)}
                icon={<Navigation className="w-3.5 h-3.5" />}
              />
            </div>
            {/* <LocInput label="Building / Society" placeholder="Green Valley Apartments" value={data.buildingName} onChange={(v) => upd("buildingName", v)} icon={<Building2 className="w-3.5 h-3.5" />} />
             */}
            {data.propertyCategory === "residential" ||
              (data.propertyCategory === "commercial" && (
                <LocInput
                  label="Building / Society"
                  placeholder="Green Valley Apartments"
                  value={data.buildingName}
                  onChange={(v) => upd("buildingName", v)}
                  icon={<Building2 className="w-3.5 h-3.5" />}
                />
              ))}
            {data.propertyCategory === "land" ||
              (data.propertyCategory === "agricultural" && (
                <LocInput
                  label="Land / Society"
                  placeholder="Green Valley Apartments"
                  value={data.landName}
                  onChange={(v) => upd("landName", v)}
                  icon={<Building2 className="w-3.5 h-3.5" />}
                />
              ))}
            <div className="relative">
              <LocInput
                label="Pincode"
                placeholder="6-digit pincode"
                value={data.pincode}
                maxLength={6}
                onChange={handlePin}
                icon={<Globe2 className="w-3.5 h-3.5" />}
                error={pincodeStatus === "error"}
              />
              {pincodeStatus === "error" && (
                <p className="absolute -bottom-5 left-1 flex items-center gap-1 text-[10px] text-red-500 font-bold">
                  <AlertCircle className="w-3 h-3" /> Invalid Pincode
                </p>
              )}
            </div>
            <LocInput
              label="Locality"
              value={data.locality}
              onChange={(v) => upd("locality", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <LocInput
                label="City"
                value={data.city}
                onChange={(v) => upd("city", v)}
              />
              <LocInput
                label="State"
                value={data.state}
                onChange={(v) => upd("state", v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Geospatial Marker
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Drag pin to exact property entrance
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
            Interactive
          </span>
        </div>
        <div
          className="rounded-3xl overflow-hidden border-2 relative group"
          style={{
            height: "400px",
            borderColor: "#27AE6020",
            boxShadow: "0 8px 40px #27AE6012",
          }}
        >
          <OpenStreetPinMap
            value={data.location}
            onChange={(coords) =>
              upd("location", { type: "Point", coordinates: coords })
            }
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 text-[10px] font-bold text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 text-center">
            🎯 Drag the pin precisely to the property entrance
          </div>
        </div>
      </div>

      {/* Nearby */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Nearby Landmarks
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Boost visibility by up to 40%
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7 space-y-5">
          <NearbyPlacesInput
            value={data.nearbyPlaces || []}
            onChange={(v) => upd("nearbyPlaces", v)}
          />
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-100 text-[11px] font-medium text-slate-500 leading-relaxed">
            <span className="text-base mt-0.5">💡</span>
            <span>
              Adding landmarks like "Metro Station" or "Hospitals" significantly
              increases discoverability and lead quality.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={onSave}
          className="flex items-center gap-2.5 px-8 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #27AE60, #1e9e52)",
            boxShadow: "0 8px 25px #27AE6035",
          }}
        >
          <Save className="w-4 h-4" /> Synchronize Location
        </button>
      </div>
    </div>
  );
}

function LocInput({ label, value, onChange, placeholder, icon, maxLength, error }) {
  return (
    <div className="flex-1 space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border-2 transition-all"
        style={{ borderColor: error ? "#fca5a5" : "transparent", boxShadow: error ? "0 0 0 3px #fca5a510" : "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1.5px #f1f5f9" }}>
        {icon && <span className="text-slate-300 shrink-0">{icon}</span>}
        <input type="text" value={value||""} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent" style={{ caretColor: "#27AE60" }} />
      </div>
    </div>
  );
}

function toTitle(s="") { return s.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase()+w.slice(1)).join(" "); }