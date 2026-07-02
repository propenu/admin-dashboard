// D:\git_netlify_nunning\admin-dashboard\src\pages\Residential\ResidentialEdit\steps\StepLocationDetails.jsx
// Map: Mappls SDK | Geocoding: Nominatim (OSM) | Nearby: Photon + Overpass
import { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  MapPin, Building2, Globe2, Navigation, Landmark,
  Save, CheckCircle2, AlertCircle,
} from "lucide-react";
import MapplsPinMap from "../components/location/MapplsPinMap";
import NearbyPlacesInput from "../components/location/NearbyPlacesInput";


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
    <div className="min-w-0 flex-1 space-y-1.5">
      <label className="ml-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>
      <div className={`flex h-10 items-center gap-2 rounded-lg border px-3 transition-all ${
        error
          ? "border-red-300 bg-red-50/30 ring-2 ring-red-50"
          : readOnly
            ? "border-slate-200 bg-slate-100"
            : "border-slate-200 bg-slate-50/70 hover:border-emerald-300 focus-within:border-[#27AE60] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100"
      }`}>
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <input
          type="text"
          value={value || ""}
          maxLength={maxLength}
          readOnly={readOnly}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-300"
          style={{ caretColor: "#27AE60" }}
        />
      </div>
      {error && (
        <p className="ml-1 flex items-center gap-1 text-[9px] font-bold text-red-500">
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
  const handleLocalityChange = useCallback((value) => {
    geocodeSourceRef.current = null;
    upd("locality", value);
  }, [upd]);
  const handleCityChange = useCallback((value) => {
    geocodeSourceRef.current = null;
    upd("city", value);
  }, [upd]);
  const handleStateChange = useCallback((value) => {
    geocodeSourceRef.current = null;
    upd("state", value);
  }, [upd]);

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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#27AE60]">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#27AE60]">Property location</p>
            <h2 className="mt-0.5 text-sm font-black text-slate-900">Address, map pin and nearby landmarks</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500 sm:self-auto">
          <CheckCircle2 className="h-3 w-3 text-[#27AE60]" />
          Pincode auto-fills locality, city and state
        </div>
      </div>
      {/* ── Address card ── */}
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
        style={{
          border: "1.5px solid #fde68a40",
          background: "linear-gradient(135deg,#fffbeb08,#fff)",
        }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,#F59E0B80,#F59E0B20,transparent)" }} />
        <div className="space-y-3 p-3 sm:p-4">
          {/* Card header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <MapPin className="h-3.5 w-3.5" />
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2">
              <p className="text-[9px] font-semibold leading-4 text-amber-700">
                Use the correct spelling, or enter a pincode to auto-fill
                Locality, City, and State.
              </p>
            </div>

            <LocInput
              label="Locality"
              placeholder="Enter locality"
              value={data.locality}
              onChange={handleLocalityChange}
            />

            {/* City + State side by side — auto-filled (read-only) */}
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:col-span-2 md:col-span-1">
              <LocInput
                label="City"
                placeholder="Enter city"
                value={data.city}
                onChange={handleCityChange}
              />
              <LocInput
                label="State"
                placeholder="Enter state"
                value={data.state}
                onChange={handleStateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Map (Mappls SDK) ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Navigation className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">Map location</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click map to pin · pincode + locality + city + state auto-filled via OpenStreetMap
              </p>
            </div>
          </div>
          <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-blue-600">
            Mappls
          </span>
        </div>

        <div
          className="group relative h-[260px] overflow-hidden sm:h-[320px]"
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
        <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Landmark className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">Nearby Landmarks</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Photon live search (5 km) · Overpass 10 km lookup</p>
          </div>
        </div>

        <div className="space-y-3">
          <NearbyPlacesInput
            value={data.nearbyPlaces || []}
            onChange={handleNearbyChange}
            coordinates={pinnedCoordinates}
          />
          <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-[9px] font-medium leading-4 text-slate-500">
            <span className="text-base mt-0.5">💡</span>
            <span>
              Adding landmarks like "Metro Station" or "Hospital" significantly
              increases discoverability and lead quality.
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onSave}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_22px_rgba(39,174,96,0.22)] transition hover:bg-[#219653] active:scale-[0.98] sm:w-auto"
        >
          <Save className="w-4 h-4" /> Synchronize Location
        </button>
      </div>
    </div>
  );
}
