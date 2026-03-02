
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../store/newIndex";
import { Phone, X, ChevronDown, Check } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { savePropertyData } from "../../../store/common/propertyThunks";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import { search } from "india-pincode-search";
import { toast } from "sonner";

const geocodeByText = async (text) => {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
        };
    }
    return null;
};

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng);
        },
    });
    return null;
}

const FEATURED_PLACES = [
    { label: "Hospital", type: "hospital" },
    { label: "School", type: "education" },
    { label: "Shopping Mall", type: "shopping" },
    { label: "Bus Stop", type: "transport" },
    { label: "Park", type: "park" },
];

export default function Step2LocationDetails({ next, back, category }) {
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const form = useSelector((state) => state[category]?.form || {});
  const [markerPos, setMarkerPos] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const topsetRef = useRef(null);

  const addressRef = useRef(null);
  const buildingNameRef = useRef(null);
  const localityRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const pincodeRef = useRef(null);
  const nearbyPlacesRef = useRef(null);

  useEffect(() => {
    topsetRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const setValue = (key, value) => {
    
    dispatch(actions[category].updateField({ key, value }));

    // Clear error for the field if it exists
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildNearbyPayload = (coords, places) =>
    places.map((p, index) => ({
      name: p.label,
      type: p.type,
      distanceText: "2",
      coordinates: coords,
      order: index,
    }));

  // useEffect(() => {
  //   const run = async () => {
  //     if (!form.pincode || form.pincode.length !== 6) return;
  //     const result = search(form.pincode);
  //     if (!Array.isArray(result) || result.length === 0) return;

  //     const pin = result[0];
  //     //const locality = pin.village || pin.office || pin.taluk || "";
  //     const formatStr = (str) =>
  //       str ? str.charAt(0).toUpperCase() + str.toLowerCase().slice(1) : "";
  //     const locality = formatStr(pin.village || pin.office || pin.taluk || "");
  //     const city = formatStr(pin.district || "");
  //     const state = formatStr(pin.state || "");
  //     setValue("locality", locality);
  //     setValue("city", pin.district || "");
  //     setValue("state", pin.state || "");

  //     const geo = await geocodeByText(
  //       `${locality}, ${pin.district}, ${pin.state}, India`,
  //     );
  //     if (geo) {
  //       const coords = [geo.lng, geo.lat];
  //       setMarkerPos([geo.lat, geo.lng]);
  //       setValue("location", { type: "Point", coordinates: coords });
  //       setValue("nearbyPlaces", buildNearbyPayload(coords, FEATURED_PLACES));
  //     }
  //   };
  //   run();
  // }, [form.pincode]);


  useEffect(() => {
    const run = async () => {
      if (!form.pincode || form.pincode.length !== 6) return;
      const result = search(form.pincode);
      if (!Array.isArray(result) || result.length === 0) return;

      const pin = result[0];
      const formatStr = (str) =>
        str ? str.charAt(0).toUpperCase() + str.toLowerCase().slice(1) : "";

      const locality = formatStr(pin.village || pin.office || pin.taluk || "");
      const city = formatStr(pin.district || ""); // FIXED: Added formatStr
      const state = formatStr(pin.state || ""); // FIXED: Added formatStr

      setValue("locality", locality);
      setValue("city", city);
      setValue("state", state);

      const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);
      if (geo) {
        const coords = [geo.lng, geo.lat];
        setMarkerPos([geo.lat, geo.lng]);
        setValue("location", { type: "Point", coordinates: coords });
        setValue("nearbyPlaces", buildNearbyPayload(coords, FEATURED_PLACES));
      }
    };
    run();
  }, [form.pincode]);

  // const handleMapClick = async ({ lat, lng }) => {
  //   const coords = [lng, lat];
  //   setMarkerPos([lat, lng]);
  //   setValue("location", { type: "Point", coordinates: coords });

  //   // Sync coordinates for existing places
  //   const updatedWithCoords = (form.nearbyPlaces || []).map((p) => ({
  //     ...p,
  //     coordinates: coords,
  //   }));
  //   setValue("nearbyPlaces", updatedWithCoords);

  //   try {
  //     const res = await fetch(
  //       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
  //     );
  //     const data = await res.json();
  //     const addr = data?.address || {};
  //     if (addr.postcode) setValue("pincode", addr.postcode);
  //     if (addr.suburb || addr.neighbourhood)
  //       setValue("locality", addr.suburb || addr.neighbourhood);
  //     if (addr.city || addr.town) setValue("city", addr.city || addr.town);
  //     if (addr.state) setValue("state", addr.state);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const handleMapClick = async ({ lat, lng }) => {
    const coords = [lng, lat];
    setMarkerPos([lat, lng]);
    setValue("location", { type: "Point", coordinates: coords });

    const formatStr = (str) =>
      str ? str.charAt(0).toUpperCase() + str.toLowerCase().slice(1) : "";

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      const addr = data?.address || {};

      if (addr.postcode) setValue("pincode", addr.postcode);

      // FORMAT BEFORE SAVING
      if (addr.suburb || addr.neighbourhood)
        setValue("locality", formatStr(addr.suburb || addr.neighbourhood));

      if (addr.city || addr.town)
        setValue("city", formatStr(addr.city || addr.town));

      if (addr.state) setValue("state", formatStr(addr.state));
    } catch (e) {
      console.error(e);
    }
  };
  const toggleNearbyPlace = (place) => {
    const currentPlaces = form.nearbyPlaces || [];
    const exists = currentPlaces.find((p) => p.type === place.type);
    let updated;

    if (exists) {
      updated = currentPlaces.filter((p) => p.type !== place.type);
    } else {
      updated = [
        ...currentPlaces,
        {
          label: place.label,
          type: place.type,
          name: place.label,
          distanceText: "2",
          coordinates: form.location?.coordinates || [0, 0],
        },
      ];
    }
    setValue("nearbyPlaces", updated);
  };

  
//  const handleContinue = async () => {
//    const propertyId = localStorage.getItem("propertyId");

//    if (!propertyId) {
//      toast.error("Property ID missing.");
//      return;
//    }

//    try {
//      await dispatch(
//        savePropertyData({
//          category,
//          id: propertyId,
//          step: "location",
//        }),
//      ).unwrap();
    
//      toast.success("Location saved!");
//      next();
//    } catch (err) {
//      console.error("API Error:", err);
//      toast.error(err.message || "Failed to save location");
//    }
//  };

const handleContinue = async () => {
  const validationErrors = validateStep2();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const propertyId = localStorage.getItem("propertyId");

  if (!propertyId) {
    toast.error("Property ID missing.");
    return;
  }

  try {
    await dispatch(
      savePropertyData({
        category,
        id: propertyId,
        step: "location",
      }),
    ).unwrap();

    toast.success("Location saved!");
    next();
  } catch (err) {
    console.error("API Error:", err);
    toast.error(err.message || "Failed to save location");
  }
};

  const validateStep2 = () => {
    const errors = {};

    if (!form.address) errors.address = "Address is required";
    // if (!form.buildingName) errors.buildingName = "Building name is required";
    if (!form.pincode || form.pincode.length !== 6)
      errors.pincode = "Valid pincode required";
    if (!form.location) errors.location = "Please pin property location";
    if (!form.locality) errors.locality = "Locality is required";
    if (!form.city) errors.city = "City is required";
    if (!form.state) errors.state = "State is required";

    // if (!form.nearbyPlaces || form.nearbyPlaces.length === 0)
    //   errors.nearbyPlaces = "Please add at least one nearby place";

    return errors;
  };

  return (
    <div
      ref={topsetRef}
      className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-6"
    >
      {/* ================= TOP INFO ================= */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#27AE60] text-white font-bold">
            F
          </div>
          <div className="flex relative right-3 items-center justify-center w-9 h-9 rounded-full bg-[#9747FF] text-white font-bold">
            A
          </div>
        </div>
        <p className="text-sm text-[#111111]">
          <span className="font-semibold">GET 2 extra enquiries</span> if you
          list your property in
          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
            5:35
          </span>
        </p>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-[#111111]">
          Add Basic Details
        </h2>

        <button type="button" className="flex items-center gap-1 text-sm">
          <span>Need help?</span>
          <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
          <span className="font-semibold text-[#27AE60]">Get a callback</span>
        </button>
      </div>

      <div ref={addressRef} className="mb-4">
        <label className="block text-sm text-[#545454] mb-1">
          Address line
        </label>
        <textarea
          rows={3}
          value={form.address || ""}
          onChange={(e) => setValue("address", e.target.value)}
          className="w-full border border-[#D4D4D4] rounded-lg px-3 py-2 text-sm focus:border-[#27AE60] outline-none"
        />
      </div>
      {errors.address && (
        <span className="text-red-500 text-xs relative bottom-5">
          {errors.address}
        </span>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div ref={buildingNameRef}>
            <label className="block text-sm text-[#545454] mb-1">
              Apartment / Society
            </label>
            <input
              value={form.buildingName || ""}
              onChange={(e) => setValue("buildingName", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#27AE60] outline-none"
            />
            {errors.buildingName && (
              <span className="text-red-500 text-xs">
                {errors.buildingName}
              </span>
            )}
          </div>

        <div ref={pincodeRef}>
          <label className="block text-sm text-[#545454] mb-1">Pincode</label>
          <input
            value={form.pincode || ""}
            onChange={(e) => setValue("pincode", e.target.value)}
            className="w-full border border-[#D4D4D4] rounded-lg px-3 py-2 text-sm focus:border-[#27AE60] outline-none"
          />
          {errors.pincode && (
            <span className="text-red-500 text-xs">{errors.pincode}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div ref={localityRef}>
          <label className="block text-sm text-[#545454] mb-1">Locality</label>
          <input
            value={ form.locality || ""}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm outline-none"
          />
          {errors.locality && (
            <span className="text-red-500 text-xs">{errors.locality}</span>
          )}
        </div>
        <div ref={cityRef}>
          <label className="block text-sm text-[#545454] mb-1 ">City</label>
          <input
            value={
              form.city || ""
            }
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm outline-none"
          />
          {errors.city && (
            <span className="text-red-500 text-xs">{errors.city}</span>
          )}
        </div>
        <div ref={stateRef}>
          <label className="block text-sm text-[#545454] mb-1 ">State</label>
          <input
            value={
              form.state || ""
            }
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm outline-none"
          />
          {errors.state && (
            <span className="text-red-500 text-xs">{errors.state}</span>
          )}
        </div>
      </div>

      <label className="block text-sm text-[#545454] mb-2 font-medium">
        Pin property location
      </label>
      <div className="w-full  relative z-10 h-60 rounded-lg overflow-hidden border mb-6">
        <MapContainer
          center={[28.4595, 77.0266]}
          zoom={13}
          className="w-full h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onSelect={handleMapClick} />
          {markerPos && <Marker position={markerPos} icon={markerIcon} />}
        </MapContainer>
      </div>

      {/* UPDATED MULTI-SELECT INPUT BOX STYLE */}
      <div
        className="mb-8"
        ref={(el) => {
          dropdownRef.current = el;
          nearbyPlacesRef.current = el;
        }}
      >
        <label className="block text-sm text-[#545454] mb-2 font-medium">
          Nearby places
        </label>
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full border border-[#D4D4D4] rounded-lg px-2 py-1.5 flex flex-wrap gap-2 items-center cursor-pointer bg-white min-h-[42px] focus-within:border-[#27AE60]"
          >
            {form.nearbyPlaces?.length > 0 ? (
              form.nearbyPlaces.map((place) => (
                <span
                  key={place.type}
                  className="bg-[#F1FCF5] text-[#27AE60] text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 border border-[#DEFAEA]"
                >
                  {place.label || place.name}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNearbyPlace(place);
                    }}
                  />
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm px-2">
                Select nearby places
              </span>
            )}
            <div className="ml-auto pr-2">
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          {errors.nearbyPlaces && (
            <span className="text-red-500 text-xs">{errors.nearbyPlaces}</span>
          )}
          {isOpen && (
            <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              {FEATURED_PLACES.map((place) => {
                const isSelected = form.nearbyPlaces?.find(
                  (p) => p.type === place.type,
                );
                return (
                  <div
                    key={place.type}
                    onClick={() => toggleNearbyPlace(place)}
                    className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-50 last:border-none"
                  >
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "text-[#27AE60] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {place.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#27AE60]" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-12">
        <button
          onClick={back}
          className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-[#27AE60] hover:text-white transition-all active:scale-[0.98]"
        >
          back
        </button>
        <button
          onClick={handleContinue}
          className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-[#27AE60] hover:text-white transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}



// c i

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
// import { useDispatch, useSelector } from "react-redux";
// import { actions } from "../../../store/newIndex";
// import { Phone, X, ChevronDown, Check, MapPin, Navigation } from "lucide-react";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import { savePropertyData } from "../../../store/common/propertyThunks";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { useEffect, useState, useRef } from "react";
// import { search } from "india-pincode-search";
// import { toast } from "sonner";

// const geocodeByText = async (text) => {
//   const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`);
//   const data = await res.json();
//   if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
//   return null;
// };

// const markerIcon = new L.Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// function MapClickHandler({ onSelect }) {
//   useMapEvents({ click(e) { onSelect(e.latlng); } });
//   return null;
// }

// const FEATURED_PLACES = [
//   { label: "Hospital", type: "hospital" },
//   { label: "School", type: "education" },
//   { label: "Shopping Mall", type: "shopping" },
//   { label: "Bus Stop", type: "transport" },
//   { label: "Park", type: "park" },
// ];

// const SectionLabel = ({ children }) => (
//   <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">{children}</p>
// );

// const CardWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>{children}</div>
// );

// const InputField = ({ label, children, error }) => (
//   <div className="space-y-1.5">
//     <label className="block text-xs font-semibold text-[#374151]">{label}</label>
//     {children}
//     {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//   </div>
// );

// const inputCls = "w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]";
// const readonlyCls = "w-full border border-[#e5e7eb] rounded-xl px-3.5 py-3 text-sm font-medium text-[#6b7280] bg-[#f9fafb] outline-none";

// export default function Step2LocationDetails({ next, back, category }) {
//   const [errors, setErrors] = useState({});
//   const dispatch = useDispatch();
//   const form = useSelector((state) => state[category]?.form || {});
//   const [markerPos, setMarkerPos] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const topRef = useRef(null);

//   useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);

//   const setValue = (key, value) => {
//     dispatch(actions[category].updateField({ key, value }));
//     if (errors[key]) setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const buildNearbyPayload = (coords, places) =>
//     places.map((p, index) => ({ name: p.label, type: p.type, distanceText: "2", coordinates: coords, order: index }));

//   useEffect(() => {
//     const run = async () => {
//       if (!form.pincode || form.pincode.length !== 6) return;
//       const result = search(form.pincode);
//       if (!Array.isArray(result) || result.length === 0) return;
//       const pin = result[0];
//       const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.toLowerCase().slice(1) : "";
//       const locality = fmt(pin.village || pin.office || pin.taluk || "");
//       const city = fmt(pin.district || "");
//       const state = fmt(pin.state || "");
//       setValue("locality", locality);
//       setValue("city", city);
//       setValue("state", state);
//       const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);
//       if (geo) {
//         const coords = [geo.lng, geo.lat];
//         setMarkerPos([geo.lat, geo.lng]);
//         setValue("location", { type: "Point", coordinates: coords });
//         setValue("nearbyPlaces", buildNearbyPayload(coords, FEATURED_PLACES));
//       }
//     };
//     run();
//   }, [form.pincode]);

//   const handleMapClick = async ({ lat, lng }) => {
//     const coords = [lng, lat];
//     setMarkerPos([lat, lng]);
//     setValue("location", { type: "Point", coordinates: coords });
//     const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.toLowerCase().slice(1) : "";
//     try {
//       const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
//       const data = await res.json();
//       const addr = data?.address || {};
//       if (addr.postcode) setValue("pincode", addr.postcode);
//       if (addr.suburb || addr.neighbourhood) setValue("locality", fmt(addr.suburb || addr.neighbourhood));
//       if (addr.city || addr.town) setValue("city", fmt(addr.city || addr.town));
//       if (addr.state) setValue("state", fmt(addr.state));
//     } catch (e) { console.error(e); }
//   };

//   const toggleNearbyPlace = (place) => {
//     const currentPlaces = form.nearbyPlaces || [];
//     const exists = currentPlaces.find((p) => p.type === place.type);
//     const updated = exists
//       ? currentPlaces.filter((p) => p.type !== place.type)
//       : [...currentPlaces, { label: place.label, type: place.type, name: place.label, distanceText: "2", coordinates: form.location?.coordinates || [0, 0] }];
//     setValue("nearbyPlaces", updated);
//   };

//   const validateStep2 = () => {
//     const e = {};
//     if (!form.address) e.address = "Address is required";
//     if (!form.pincode || form.pincode.length !== 6) e.pincode = "Valid 6-digit pincode required";
//     if (!form.location) e.location = "Please pin property location on map";
//     if (!form.locality) e.locality = "Locality is required";
//     if (!form.city) e.city = "City is required";
//     if (!form.state) e.state = "State is required";
//     return e;
//   };

//   const handleContinue = async () => {
//     const validationErrors = validateStep2();
//     if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
//     const propertyId = localStorage.getItem("propertyId");
//     if (!propertyId) { toast.error("Property ID missing."); return; }
//     try {
//       await dispatch(savePropertyData({ category, id: propertyId, step: "location" })).unwrap();
//       toast.success("Location saved!");
//       next();
//     } catch (err) {
//       console.error("API Error:", err);
//       toast.error(err.message || "Failed to save location");
//     }
//   };

//   return (
//     <div ref={topRef} className="space-y-5">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-[#111827]">Location Details</h2>
//           <p className="text-xs text-[#9ca3af] mt-0.5">Where is your property located?</p>
//         </div>
//         <button type="button" className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors">
//           <Phone size={13} />
//           Get a callback
//         </button>
//       </div>

//       {/* Address */}
//       <CardWrapper>
//         <SectionLabel>Address Information</SectionLabel>
//         <div className="space-y-4">
//           <InputField label="Address Line" error={errors.address}>
//             <textarea
//               rows={3}
//               value={form.address || ""}
//               onChange={(e) => setValue("address", e.target.value)}
//               placeholder="Enter full address..."
//               className={inputCls + " resize-none"}
//             />
//           </InputField>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <InputField label="Apartment / Society" error={errors.buildingName}>
//               <input
//                 value={form.buildingName || ""}
//                 onChange={(e) => setValue("buildingName", e.target.value)}
//                 placeholder="Society / Building name"
//                 className={inputCls}
//               />
//             </InputField>
//             <InputField label="Pincode" error={errors.pincode}>
//               <input
//                 value={form.pincode || ""}
//                 onChange={(e) => setValue("pincode", e.target.value)}
//                 placeholder="6-digit pincode"
//                 maxLength={6}
//                 className={inputCls}
//               />
//             </InputField>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <InputField label="Locality" error={errors.locality}>
//               <input value={form.locality || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
//             </InputField>
//             <InputField label="City" error={errors.city}>
//               <input value={form.city || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
//             </InputField>
//             <InputField label="State" error={errors.state}>
//               <input value={form.state || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
//             </InputField>
//           </div>
//         </div>
//       </CardWrapper>

//       {/* Map */}
//       <CardWrapper>
//         <div className="flex items-center gap-2 mb-4">
//           <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
//             <MapPin size={14} className="text-[#27AE60]" />
//           </div>
//           <div>
//             <SectionLabel>Pin Property Location</SectionLabel>
//             <p className="text-[10px] text-[#9ca3af] -mt-2">Click on the map to mark exact location</p>
//           </div>
//         </div>
//         <div className="relative z-10 h-64 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-inner">
//           <MapContainer center={[28.4595, 77.0266]} zoom={13} className="w-full h-full">
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             <MapClickHandler onSelect={handleMapClick} />
//             {markerPos && <Marker position={markerPos} icon={markerIcon} />}
//           </MapContainer>
//         </div>
//         {!markerPos && (
//           <div className="mt-2 flex items-center gap-1.5 text-[#f59e0b]">
//             <Navigation size={12} />
//             <p className="text-xs font-medium">Click on the map to pin your location</p>
//           </div>
//         )}
//         {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}
//       </CardWrapper>

//       {/* Nearby Places */}
//       <CardWrapper>
//         <SectionLabel>Nearby Places</SectionLabel>
//         <div className="relative" ref={dropdownRef}>
//           <div
//             onClick={() => setIsOpen(!isOpen)}
//             className="w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 flex flex-wrap gap-2 items-center cursor-pointer bg-white min-h-[48px] hover:border-[#27AE60] transition-colors focus-within:border-[#27AE60]"
//           >
//             {form.nearbyPlaces?.length > 0 ? (
//               form.nearbyPlaces.map((place) => (
//                 <span key={place.type} className="bg-[#f0fdf4] text-[#27AE60] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]">
//                   {place.label || place.name}
//                   <X size={12} className="cursor-pointer hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); toggleNearbyPlace(place); }} />
//                 </span>
//               ))
//             ) : (
//               <span className="text-[#9ca3af] text-sm">Select nearby places...</span>
//             )}
//             <div className="ml-auto">
//               <ChevronDown className={`w-4 h-4 text-[#9ca3af] transition-transform ${isOpen ? "rotate-180" : ""}`} />
//             </div>
//           </div>

//           {isOpen && (
//             <div className="absolute z-50 w-full mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl overflow-hidden">
//               {FEATURED_PLACES.map((place) => {
//                 const isSelected = form.nearbyPlaces?.find((p) => p.type === place.type);
//                 return (
//                   <div
//                     key={place.type}
//                     onClick={() => toggleNearbyPlace(place)}
//                     className="px-4 py-3.5 hover:bg-[#f0fdf4] flex justify-between items-center cursor-pointer border-b border-[#f0f0f0] last:border-none transition-colors"
//                   >
//                     <span className={`text-sm font-medium ${isSelected ? "text-[#27AE60]" : "text-[#374151]"}`}>{place.label}</span>
//                     {isSelected && <Check className="w-4 h-4 text-[#27AE60]" />}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         {errors.nearbyPlaces && <p className="text-red-500 text-xs mt-2 font-medium">{errors.nearbyPlaces}</p>}
//       </CardWrapper>

//       {/* Navigation */}
//       <div className="flex gap-3">
//         <button
//           onClick={back}
//           className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={handleContinue}
//           className="flex-1 py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 text-sm"
//         >
//           Continue →
//         </button>
//       </div>
//     </div>
//   );
// }