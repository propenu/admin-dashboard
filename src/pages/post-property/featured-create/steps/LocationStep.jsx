// src/pages/post-property/featured-create/steps/LocationStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Trash2, Navigation, Search, Crosshair, Info } from "lucide-react";

/* ── Design tokens ─────────────────────────────────────────── */
const inp = (err) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
   outline-none placeholder:text-gray-400 transition-all duration-200
   ${
     err
       ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
       : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"
   }`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

const PLACE_TYPES = [
  "School", "Hospital", "Mall", "Metro", "Airport",
  "Park", "Restaurant", "Bank", "Gym", "IT Park", "Pharmacy", "Temple",
];

/* ── Inject Leaflet CSS once ────────────────────────────────── */
function ensureLeafletCSS() {
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id   = "leaflet-css";
  link.rel  = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

/* ── MapPicker component ────────────────────────────────────── */
// mode: "project" | "place"
// onPick(lat, lng) callback
function MapPicker({ centerLat, centerLng, markerLat, markerLng, onPick, height = 340, readOnly = false }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);
  const leafletRef   = useRef(null);

  useEffect(() => {
    ensureLeafletCSS();

    let cancelled = false;

    async function init() {
      // Dynamically import Leaflet
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.onload  = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (cancelled || !containerRef.current) return;

      const L = window.L;
      leafletRef.current = L;

      // Default center: India
      const lat = parseFloat(centerLat) || 17.385;
      const lng = parseFloat(centerLng) || 78.4867;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Custom green icon
      const greenIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px; height:36px;
            background:linear-gradient(135deg,#27AE60,#1e8449);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 4px 12px rgba(39,174,96,0.5);
            display:flex; align-items:center; justify-content:center;
          ">
            <div style="
              transform:rotate(45deg);
              width:10px; height:10px;
              background:white;
              border-radius:50%;
            "></div>
          </div>
        `,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
        popupAnchor:[0, -36],
      });

      // Place existing marker if coords given
      const mLat = parseFloat(markerLat);
      const mLng = parseFloat(markerLng);
      if (!isNaN(mLat) && !isNaN(mLng)) {
        markerRef.current = L.marker([mLat, mLng], { icon: greenIcon, draggable: !readOnly }).addTo(map);
        map.setView([mLat, mLng], 14);

        if (!readOnly) {
          markerRef.current.on("dragend", (e) => {
            const pos = e.target.getLatLng();
            onPick?.(pos.lat.toFixed(6), pos.lng.toFixed(6));
          });
        }
      }

      // Click to place / move marker
      if (!readOnly) {
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: greenIcon, draggable: true }).addTo(map);
            markerRef.current.on("dragend", (ev) => {
              const pos = ev.target.getLatLng();
              onPick?.(pos.lat.toFixed(6), pos.lng.toFixed(6));
            });
          }
          onPick?.(lat.toFixed(6), lng.toFixed(6));
        });
      }
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current  = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // Update marker when external coords change (typed in inputs)
  useEffect(() => {
    const L   = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const lat = parseFloat(markerLat);
    const lng = parseFloat(markerLng);
    if (isNaN(lat) || isNaN(lng)) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const greenIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px;height:36px;
            background:linear-gradient(135deg,#27AE60,#1e8449);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 4px 12px rgba(39,174,96,0.5);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="transform:rotate(45deg);width:10px;height:10px;background:white;border-radius:50%;"></div>
          </div>
        `,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
      });
      markerRef.current = L.marker([lat, lng], { icon: greenIcon, draggable: !readOnly }).addTo(map);
      if (!readOnly) {
        markerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          onPick?.(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    }
    map.setView([lat, lng], map.getZoom() < 12 ? 14 : map.getZoom());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerLat, markerLng]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", zIndex: 0 }}
    />
  );
}

/* ── Main LocationStep ─────────────────────────────────────── */
const LocationStep = forwardRef(({ payload, update }, ref) => {
  const location = payload.location    || { type: "Point", coordinates: ["", ""] };
  const places   = payload.nearbyPlaces || [];

  const [newPlace, setNewPlace]   = useState({ name: "", type: "", coordinates: ["", ""] });
  const [errors,   setErrors]     = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searching,   setSearching]   = useState(false);
  const [addingPlace, setAddingPlace] = useState(false); 

  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearching, setPlaceSearching] = useState(false);

  const locationRef = useRef(null);

  const searchNearbyPlace = async () => {
    if (!placeSearchQuery.trim()) return;

    setPlaceSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeSearchQuery)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } },
      );

      const data = await res.json();

      if (data.length) {
        const { lat, lon } = data[0];

        setNewPlace((prev) => ({
          ...prev,
          coordinates: [
            String(parseFloat(lon).toFixed(6)),
            String(parseFloat(lat).toFixed(6)),
          ],
        }));

        clr("newPlaceLng");
        clr("newPlaceLat");
      } else {
        alert("Location not found. Try something more specific.");
      }
    } catch {
      alert("Search failed.");
    } finally {
      setPlaceSearching(false);
    }
  };

  /* ── Validation ── */
  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!location.coordinates[0]) e.mainLng = "Longitude is required";
      if (!location.coordinates[1]) e.mainLat = "Latitude is required";
      if (!places.length)           e.nearbyPlaces = "Please add at least one nearby place";
      places.forEach((p, i) => {
        if (!p.name)              e[`place-${i}-name`] = "Name required";
        if (!p.type)              e[`place-${i}-type`] = "Type required";
        if (!p.coordinates?.[0])  e[`place-${i}-lng`]  = "Longitude required";
        if (!p.coordinates?.[1])  e[`place-${i}-lat`]  = "Latitude required";
      });
      setErrors(e);
      if (Object.keys(e).length) {
        locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    },
  }));

  const clr = (key) =>
    setErrors((p) => { const c = { ...p }; delete c[key]; return c; });

  /* ── Project coordinate helpers ── */
  const updateLoc = (field, value) => {
    const coords = [...location.coordinates];
    if (field === "lng") { coords[0] = value; clr("mainLng"); }
    if (field === "lat") { coords[1] = value; clr("mainLat"); }
    update({ location: { ...location, coordinates: coords } });
  };

  const onProjectMapPick = useCallback((lat, lng) => {
    update({
      location: { type: "Point", coordinates: [String(lng), String(lat)] },
    });
    clr("mainLng");
    clr("mainLat");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Search address (Nominatim – free, no key) ── */
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length) {
        const { lat, lon } = data[0];
        update({
          location: { type: "Point", coordinates: [String(parseFloat(lon).toFixed(6)), String(parseFloat(lat).toFixed(6))] },
        });
        clr("mainLng");
        clr("mainLat");
      } else {
        alert("Location not found. Try a more specific query.");
      }
    } catch {
      alert("Search failed. Check your internet connection.");
    } finally {
      setSearching(false);
    }
  };

  /* ── Get browser geolocation ── */
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        update({ location: { type: "Point", coordinates: [String(lng), String(lat)] } });
        clr("mainLng");
        clr("mainLat");
      },
      () => alert("Could not get your location."),
    );
  };

  /* ── Nearby place helpers ── */
  const updPlace = (i, field, value) => {
    const u = places.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
    update({ nearbyPlaces: u });
    if (field === "name") clr(`place-${i}-name`);
    if (field === "type") clr(`place-${i}-type`);
  };

  const updPlaceCoords = (i, field, value) => {
    const u = places.map((p, idx) => {
      if (idx !== i) return p;
      const coords = [...(p.coordinates || ["", ""])];
      if (field === "lng") { coords[0] = value; clr(`place-${i}-lng`); }
      if (field === "lat") { coords[1] = value; clr(`place-${i}-lat`); }
      return { ...p, coordinates: coords };
    });
    update({ nearbyPlaces: u });
  };

  const deletePlace = (i) =>
    update({ nearbyPlaces: places.filter((_, idx) => idx !== i) });

  const onNewPlaceMapPick = useCallback((lat, lng) => {
    setNewPlace((prev) => ({ ...prev, coordinates: [String(lng), String(lat)] }));
    clr("newPlaceLng");
    clr("newPlaceLat");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewPlace = () => {
    const e = {};
    if (!newPlace.name.trim())    e.newPlaceName = "Required";
    if (!newPlace.type.trim())    e.newPlaceType = "Required";
    if (!newPlace.coordinates[0]) e.newPlaceLng  = "Required";
    if (!newPlace.coordinates[1]) e.newPlaceLat  = "Required";
    setErrors((p) => ({ ...p, ...e }));
    if (Object.keys(e).length) return;

    update({
      nearbyPlaces: [
        ...places,
        { name: newPlace.name.trim(), type: newPlace.type.trim(), coordinates: newPlace.coordinates },
      ],
    });
    clr("nearbyPlaces");
    setNewPlace({ name: "", type: "", coordinates: ["", ""] });
    setAddingPlace(false);
  };

  /* ── Render ── */
  return (
    <div className="space-y-6" ref={locationRef}>
      {/* ── Section 1: Project Coordinates ─────────────────── */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
              border: "2px solid #bbf7d0",
            }}
          >
            <Navigation size={17} style={{ color: "#27AE60" }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              GeoJSON · Point
            </p>
            <h3 className="text-sm font-black text-gray-900">
              Project Coordinates
            </h3>
          </div>
          {/* Use my location */}
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-xs font-black
              text-gray-600 hover:border-[#27AE60] hover:text-[#27AE60] hover:bg-[#f0fdf6] transition-all"
          >
            <Crosshair size={13} /> Use My Location
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                  font-semibold text-gray-900 placeholder:text-gray-400 outline-none
                  focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-[#27AE60]/10 transition-all"
                placeholder="Search address or place name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchAddress()}
              />
            </div>
            <button
              type="button"
              onClick={searchAddress}
              disabled={searching}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-black
                hover:opacity-90 transition-all shadow-md disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              {searching ? (
                <svg
                  className="animate-spin"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <Search size={15} />
              )}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 px-4 py-3 bg-[#f0fdf6] border border-[#27AE60]/20 rounded-xl">
            <Info size={14} className="text-[#27AE60] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#1a7a42] font-semibold leading-relaxed">
              Click anywhere on the map to drop the pin. You can also drag the
              pin to fine-tune the position, or type coordinates manually below.
            </p>
          </div>

          {/* ── MAP ── */}
          <div
            className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm"
            style={{ position: "relative" }}
          >
            <MapPicker
              centerLat={location.coordinates[1] || 17.385}
              centerLng={location.coordinates[0] || 78.4867}
              markerLat={location.coordinates[1]}
              markerLng={location.coordinates[0]}
              onPick={onProjectMapPick}
              height={360}
            />
            {/* Live coords overlay */}
            {location.coordinates[0] && location.coordinates[1] && (
              <div
                className="absolute bottom-3 left-3 px-3 py-2 rounded-xl text-xs font-black text-white z-10 shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                  pointerEvents: "none",
                }}
              >
                📍 {parseFloat(location.coordinates[1]).toFixed(5)},{" "}
                {parseFloat(location.coordinates[0]).toFixed(5)}
              </div>
            )}
          </div>

          {/* Manual coordinate inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Longitude (X) *</label>
              <input
                type="number"
                step="any"
                className={inp(errors.mainLng)}
                placeholder="78.4867"
                value={location.coordinates[0]}
                onChange={(e) => updateLoc("lng", e.target.value)}
              />
              {errors.mainLng && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">
                  ⚠ {errors.mainLng}
                </p>
              )}
            </div>
            <div>
              <label className={LABEL}>Latitude (Y) *</label>
              <input
                type="number"
                step="any"
                className={inp(errors.mainLat)}
                placeholder="17.3850"
                value={location.coordinates[1]}
                onChange={(e) => updateLoc("lat", e.target.value)}
              />
              {errors.mainLat && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">
                  ⚠ {errors.mainLat}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Existing Nearby Places ──────────────── */}
      {places.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Nearby Places
            </p>
            <span
              className="px-2 py-0.5 rounded-lg text-[10px] font-black text-white"
              style={{ background: "#27AE60" }}
            >
              {places.length}
            </span>
          </div>

          {places.map((p, i) => (
            <div
              key={i}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Place header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 text-xs font-black rounded-lg text-white"
                    style={{
                      background: "linear-gradient(135deg,#27AE60,#1e8449)",
                    }}
                  >
                    {p.type || "Place"}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {p.name || "Unnamed"}
                  </span>
                  {p.coordinates?.[0] && p.coordinates?.[1] && (
                    <span className="text-xs text-gray-400 font-semibold">
                      ({parseFloat(p.coordinates[1]).toFixed(4)},{" "}
                      {parseFloat(p.coordinates[0]).toFixed(4)})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deletePlace(i)}
                  className="p-2 text-red-500 hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={LABEL}>Name</label>
                  <input
                    className={inp(errors[`place-${i}-name`])}
                    placeholder="Place Name"
                    value={p.name}
                    onChange={(e) => updPlace(i, "name", e.target.value)}
                  />
                  {errors[`place-${i}-name`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Type</label>
                  <input
                    className={inp(errors[`place-${i}-type`])}
                    placeholder="e.g. School"
                    value={p.type}
                    onChange={(e) => updPlace(i, "type", e.target.value)}
                  />
                  {errors[`place-${i}-type`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className={inp(errors[`place-${i}-lng`])}
                    placeholder="78.48"
                    value={p.coordinates?.[0] ?? ""}
                    onChange={(e) => updPlaceCoords(i, "lng", e.target.value)}
                  />
                  {errors[`place-${i}-lng`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className={inp(errors[`place-${i}-lat`])}
                    placeholder="17.38"
                    value={p.coordinates?.[1] ?? ""}
                    onChange={(e) => updPlaceCoords(i, "lat", e.target.value)}
                  />
                  {errors[`place-${i}-lat`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section 3: Add Nearby Place ────────────────────── */}
      <div className="bg-[#f0fdf6] border-2 border-dashed border-[#27AE60]/30 rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: "#27AE60" }} />
            <h3 className="text-base font-black text-gray-900">
              Add Nearby Place
            </h3>
          </div>
          {errors.nearbyPlaces && (
            <p className="text-xs text-red-500 font-semibold">
              ⚠ {errors.nearbyPlaces}
            </p>
          )}
        </div>

        {/* Quick type chips */}
        <div>
          <p className={LABEL}>Quick Select Type</p>
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setNewPlace((prev) => ({ ...prev, type: t }));
                  clr("newPlaceType");
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                style={{
                  background: newPlace.type === t ? "#27AE60" : "white",
                  borderColor: newPlace.type === t ? "#27AE60" : "#e5e7eb",
                  color: newPlace.type === t ? "white" : "#4b5563",
                }}
              >
                {newPlace.type === t ? "✓ " : ""}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Name + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Place Name *</label>
            <input
              className={inp(errors.newPlaceName)}
              placeholder="e.g. DPS School"
              value={newPlace.name}
              onChange={(e) => {
                setNewPlace((p) => ({ ...p, name: e.target.value }));
                clr("newPlaceName");
              }}
            />
            {errors.newPlaceName && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">
                ⚠ {errors.newPlaceName}
              </p>
            )}
          </div>
          <div>
            <label className={LABEL}>Type *</label>
            <input
              className={inp(errors.newPlaceType)}
              placeholder="School, Hospital…"
              value={newPlace.type}
              onChange={(e) => {
                setNewPlace((p) => ({ ...p, type: e.target.value }));
                clr("newPlaceType");
              }}
            />
            {errors.newPlaceType && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">
                ⚠ {errors.newPlaceType}
              </p>
            )}
          </div>
        </div>

        {/* Toggle map picker for new place */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={LABEL}>
              Pin Location * &nbsp;
              <span className="text-gray-400 normal-case font-semibold tracking-normal">
                (click map or type manually)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setAddingPlace((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all"
              style={{
                background: addingPlace ? "#27AE60" : "white",
                borderColor: addingPlace ? "#27AE60" : "#e5e7eb",
                color: addingPlace ? "white" : "#374151",
              }}
            >
              <MapPin size={12} />
              {addingPlace ? "Hide Map" : "Open Map Picker"}
            </button>
          </div>

          {/* Place map picker */}
          {addingPlace && (
            <div
              className="rounded-2xl overflow-hidden border-2 border-[#27AE60]/30 shadow-sm mb-3"
              style={{ position: "relative" }}
            >
              {/* Nearby Place Search */}
              <div className="flex gap-2 mb-3 p-2">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
        font-semibold text-gray-900 placeholder:text-gray-400 outline-none
        focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-[#27AE60]/10 transition-all"
                    placeholder="Search nearby place location…"
                    value={placeSearchQuery}
                    onChange={(e) => setPlaceSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchNearbyPlace()}
                  />
                </div>

                <button
                  type="button"
                  onClick={searchNearbyPlace}
                  disabled={placeSearching}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-black
      hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#27AE60,#1e8449)",
                  }}
                >
                  {placeSearching ? "Searching…" : "Search"}
                </button>
              </div>
              <MapPicker
                centerLat={
                  newPlace.coordinates[1] || location.coordinates[1] || 17.385
                }
                centerLng={
                  newPlace.coordinates[0] || location.coordinates[0] || 78.4867
                }
                markerLat={newPlace.coordinates[1]}
                markerLng={newPlace.coordinates[0]}
                onPick={onNewPlaceMapPick}
                height={260}
              />
              {newPlace.coordinates[0] && newPlace.coordinates[1] && (
                <div
                  className="absolute bottom-3 left-3 px-3 py-2 rounded-xl text-xs font-black text-white z-10 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg,#27AE60,#1e8449)",
                    pointerEvents: "none",
                  }}
                >
                  📍 {parseFloat(newPlace.coordinates[1]).toFixed(5)},{" "}
                  {parseFloat(newPlace.coordinates[0]).toFixed(5)}
                </div>
              )}
            </div>
          )}

          {/* Manual coordinate inputs for new place */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Longitude *</label>
              <input
                type="number"
                step="any"
                className={inp(errors.newPlaceLng)}
                placeholder="78.4867"
                value={newPlace.coordinates[0]}
                onChange={(e) => {
                  setNewPlace((p) => ({
                    ...p,
                    coordinates: [e.target.value, p.coordinates[1]],
                  }));
                  clr("newPlaceLng");
                }}
              />
              {errors.newPlaceLng && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">
                  ⚠ {errors.newPlaceLng}
                </p>
              )}
            </div>
            <div>
              <label className={LABEL}>Latitude *</label>
              <input
                type="number"
                step="any"
                className={inp(errors.newPlaceLat)}
                placeholder="17.3850"
                value={newPlace.coordinates[1]}
                onChange={(e) => {
                  setNewPlace((p) => ({
                    ...p,
                    coordinates: [p.coordinates[0], e.target.value],
                  }));
                  clr("newPlaceLat");
                }}
              />
              {errors.newPlaceLat && (
                <p className="text-xs text-red-500 font-semibold mt-1.5">
                  ⚠ {errors.newPlaceLat}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={addNewPlace}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-black
            hover:opacity-90 transition-all shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
        >
          <Plus size={16} strokeWidth={3} /> Add Place
        </button>
      </div>
    </div>
  );
});

export default LocationStep;