
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

//import { State, City } from "country-state-city";
import { INDIAN_STATES, getCitiesByState } from "../../../../utils/countryStateCity";

/* ─── data ──────────────────────────────────────────────────────── */

const CATEGORY_TYPES = [
  {
    value: "residential",
    label: "Residential",
    icon: "🏠",
    desc: "Apartments, villas & homes",
  },

  {
    value: "land",
    label: "Land",
    icon: "🌍",
    desc: "Plots & open land",
  },

  {
    value: "commercial",
    label: "Commercial",
    icon: "🏢",
    desc: "Offices, shops & retail",
    disabled: true,
    disabledMessage: "Temporarily Disabled",
  },

  {
    value: "agricultural",
    label: "Agricultural",
    icon: "🌾",
    desc: "Farms & agri land",
    disabled: true,
    disabledMessage: "Temporarily Disabled",
  },
];

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment", icon: "🏗" },
    { label: "Villa", value: "villa", icon: "🏰" },    
    { label: "Duplex", value: "duplex", icon: "🏘" },
    { label: "Triplex", value: "triplex", icon: "🏚" },
    { label: "Farmhouse", value: "farmhouse", icon: "🌿" },
  ],

  land: [
    { label: "Plot", value: "plot", icon: "📌" },
    { label: "Residential Plot", value: "residential-plot", icon: "🏠" },
    { label: "Industrial Plot", value: "industrial-plot", icon: "🏭" },
    { label: "Agricultural Plot", value: "agricultural-plot", icon: "🌾" },
    { label: "Commercial Plot", value: "commercial-plot", icon: "🏢" },
  ],
};

/* ─── Floating Input ───── */


const FloatingInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  inputRef,
  icon,
  required,
  warning,
}) => {
  const [focused, setFocused] = useState(false);

  const hasVal = !!(value && value.length > 0);

  const lifted = focused || hasVal;

  return (
    <div className="relative">
      <div
        className={[
          "relative flex items-center rounded-2xl border-2 bg-white transition-all duration-300",

          error
            ? "border-red-400 shadow-sm shadow-red-100"
            : focused
              ? "border-[#27AE60] shadow-lg shadow-[#27AE60]/10"
              : "border-gray-100 hover:border-gray-200 shadow-sm",
        ].join(" ")}
      >
        <span
          className={[
            "pl-4 text-lg select-none flex-shrink-0 transition-opacity duration-200",
            focused ? "opacity-100" : "opacity-40",
          ].join(" ")}
        >
          {icon}
        </span>

        <div className="relative flex-1 px-3 pt-5 pb-2">
          <label
            className={[
              "absolute left-3 pointer-events-none font-semibold transition-all duration-200",

              lifted
                ? "top-1.5 text-[10px] tracking-widest uppercase"
                : "top-1/2 -translate-y-1/2 text-sm",

              error
                ? "text-red-400"
                : focused
                  ? "text-[#27AE60]"
                  : "text-gray-400",
            ].join(" ")}
          >
            <div className="flex items-center gap-1">
              <span>
                {label}
                {required && " *"}
              </span>

              {warning && <WarningTooltip />}
            </div>
          </label>

          <input
            ref={inputRef}
            value={value || ""}
            placeholder={lifted ? placeholder : ""}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={onChange}
            className="w-full bg-transparent text-gray-900 text-sm font-semibold outline-none placeholder:text-gray-300 mt-0.5"
          />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-1.5 pl-2">
          ⚠ Please enter Correct {label.toLowerCase()}
        </p>
      )}
    </div>
  );
};
/* ─── Floating Select ───────── */

const FloatingSelect = ({ label, value, onChange, options, required,warning , error,}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <div
        // className={[
        //   "relative rounded-2xl border-2 bg-white transition-all duration-300",

        //   focused
        //     ? "border-[#27AE60] shadow-lg shadow-[#27AE60]/10"
        //     : "border-gray-100 hover:border-gray-200 shadow-sm",
        // ].join(" ")}
        className={[
          "relative rounded-2xl border-2 bg-white transition-all duration-300",

          error
            ? "border-red-400 shadow-sm shadow-red-100"
            : focused
              ? "border-[#27AE60] shadow-lg shadow-[#27AE60]/10"
              : "border-gray-100 hover:border-gray-200 shadow-sm",
        ].join(" ")}
      >
        <label
          className={[
            "absolute left-4 font-semibold transition-all duration-200 z-10",

            value
              ? "top-1.5 text-[10px] tracking-widest uppercase text-[#27AE60]"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-400",
          ].join(" ")}
        >
          <div className="flex items-center gap-1">
            <span>
              {label}
              {required && " *"}
            </span>

            {warning && <WarningTooltip />}
          </div>
        </label>

        <select
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          className="w-full bg-transparent px-4 pt-5 pb-2 text-sm font-semibold text-gray-700 outline-none appearance-none"
        >
          <option value=""></option>

          {options.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-1.5 pl-2">
          ⚠ Please enter {label.toLowerCase()}
        </p>
      )}
    </div>
  );
};

/* ─── Section Label ────── */

const SectionLabel = ({ number, title }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-xl bg-[#27AE60] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[10px] font-black">{number}</span>
    </div>

    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">
      {title}
    </h3>

    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
  </div>
);


/* ─── Warning Tooltip ───── */

const WarningTooltip = () => {

  return (
    <div className="group relative inline-flex items-center ml-2">
      
      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black flex items-center justify-center cursor-pointer">
        !
      </span>

      <div
        className="
          absolute left-6 top-1/2 -translate-y-1/2
          w-64 p-3 rounded-xl
          bg-gray-900 text-white text-[11px]
          opacity-0 invisible
          group-hover:opacity-100
          group-hover:visible
          transition-all duration-200
          shadow-2xl z-50
        "
      >
        ⚠ Please use correct spelling.<br />
        Recommended: Enter pincode for accurate autofill.
      </div>

    </div>
  );
};

/* ─── Pincode Autofill ───── */

async function geocodePincode(pincode, signal) {

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=1`;

  const res = await fetch(url, {
    signal,
  });

  if (!res.ok) {
    throw new Error("Pincode fetch failed");
  }

  const data = await res.json();

  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const best = data[0];

  const a = best.address || {};

  return {
    locality: (a.suburb || a.neighbourhood || a.village || a.town || "")
      .replace(/^Ward\s*\d+\s*/i, "")
      .trim(),

    city: a.city || a.town || a.village || "",

    state: a.state || "",
  };
}


/* ─── Main Component ─────── */

const BasicStep = forwardRef(({ payload, update }, ref) => {
  const titleRef = useRef(null);
  const addressRef = useRef(null);
  const localityRef = useRef(null);
  const currencyRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [ptVisible, setPtVisible] = useState(!!payload?.categoryType);

  const [pincodeStatus, setPincodeStatus] = useState(null);

  const pincodeAbortRef = useRef(null);

  /* INDIA STATES */

  //const states = State.getStatesOfCountry("IN");
  const states = INDIAN_STATES;

  /* INDIA CITIES */

  // const selectedState = states.find((s) => s.name === payload?.state);

  // const cities = selectedState
  //   ? City.getCitiesOfState("IN", selectedState.isoCode)
  //   : [];


  const cities = getCitiesByState(payload?.state);

  /* ─── PINCODE AUTOFILL ───── */

  useEffect(() => {
    const pin = (payload?.pincode || "").replace(/\D/g, "");

    if (pin.length !== 6) {
      setPincodeStatus(null);
      return;
    }

    pincodeAbortRef.current?.abort();

    const ctrl = new AbortController();

    pincodeAbortRef.current = ctrl;

    const timer = setTimeout(async () => {
      try {
        const geo = await geocodePincode(pin, ctrl.signal);

        if (!geo) {
          setPincodeStatus("error");
          return;
        }

        update({
          locality: geo.locality,
          city: geo.city,
          state: geo.state,
        });

        setPincodeStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setPincodeStatus("error");
        }
      }
    }, 500);

    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [payload?.pincode]);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (!payload?.categoryType?.trim()) e.categoryType = true;

      if (!payload?.title?.trim()) e.title = true;
      if (!payload?.address?.trim()) e.address = true;
      if (!payload?.locality?.trim()) e.locality = true;
      if (!payload?.state?.trim()) e.state = true;
      if (!payload?.city?.trim()) e.city = true;
      if (!payload?.propertyType?.trim()) e.propertyType = true;
      if (!payload?.currency?.trim()) e.currency = true;

      setErrors(e);

      return Object.keys(e).length === 0;
    },
  }));

  const capitalizeFirst = (val) =>
    val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();

  const capitalizeWords = (val = "") =>
    val
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const clr = (key) =>
    setErrors((p) => {
      const c = { ...p };

      delete c[key];

      return c;
    });

  const handleCategoryChange = (val) => {
    const lower = val.toLowerCase();

    setPtVisible(false);

    update({
      categoryType: lower,
      propertyType: "",
    });

    clr("categoryType");

    if (lower) {
      setTimeout(() => setPtVisible(true), 150);
    }
  };

  const propertyOptions = PROPERTY_TYPES[payload?.categoryType] || [];

  return (
    <div className="space-y-8">
      {/* SECTION 01 */}

      <SectionLabel number="01" title="Category & Type" />

      {/* CATEGORY */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORY_TYPES.map((cat) => {
          const active = payload?.categoryType === cat.value;

          const disabled = cat.disabled;

          return (
            <button
              key={cat.value}
              type="button"
              disabled={disabled}
              title={disabled ? cat.disabledMessage : ""}
              onClick={() => {
                if (!disabled) {
                  handleCategoryChange(cat.value);
                }
              }}
              className={[
                "relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left",
                "transition-all duration-250 overflow-hidden select-none",

                disabled
                  ? "border-gray-300 bg-red-50 opacity-80 cursor-not-allowed"
                  : active
                    ? "border-[#27AE60] bg-gradient-to-br from-[#f0fdf6] to-[#e4f9ee] shadow-lg shadow-[#27AE60]/15 scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-[#27AE60]/40 hover:shadow-md shadow-sm hover:scale-[1.01]",
              ].join(" ")}
            >
              {disabled && (
                <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-400" />
              )}

              <span className="text-2xl leading-none">{cat.icon}</span>

              <span
                className={[
                  "text-sm font-black leading-tight",

                  active ? "text-[#1a7a42]" : "text-gray-700",
                ].join(" ")}
              >
                {cat.label}
              </span>

              <span className="text-[10px] font-medium text-gray-400 leading-snug">
                {disabled ? cat.disabledMessage : cat.desc}
              </span>
            </button>
          );
        })}
        {errors.categoryType && (
          <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-2 pl-1">
            ⚠ Please select category type
          </p>
        )}
      </div>

      {/* PROPERTY TYPE */}

      {ptVisible && propertyOptions.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
            Property Type
          </p>

          <div className="flex flex-wrap gap-2">
            {propertyOptions.map((opt) => {
              const selected = payload?.propertyType === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    update({
                      propertyType: opt.value,
                    });

                    clr("propertyType");
                  }}
                  className={[
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2",
                    "text-xs font-bold transition-all duration-200 select-none",

                    selected
                      ? "border-[#27AE60] bg-[#27AE60] text-white shadow-md"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#27AE60]/60",
                  ].join(" ")}
                >
                  <span>{opt.icon}</span>

                  {opt.label}
                </button>
              );
            })}
          </div>
          {errors.propertyType && (
            <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-2 pl-1">
              ⚠ Please select property type
            </p>
          )}
        </div>
      )}

      {/* SECTION 02 */}
      <SectionLabel number="02" title="Property Identity" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          required
          label="Property Title"
          placeholder="e.g. Emerald Heights"
          icon="🏷"
          value={payload?.title}
          error={errors.title}
          inputRef={titleRef}
          onChange={(e) => {
            update({
              title: capitalizeWords(e.target.value),
            });
            clr("title");
          }}
        />
        <FloatingInput
          required
          label="Full Address"
          placeholder="Street, Area"
          icon="📍"
          value={payload?.address}
          error={errors.address}
          inputRef={addressRef}
          onChange={(e) => {
            update({
              address: capitalizeFirst(e.target.value),
            });
            clr("address");
          }}
        />
        <FloatingInput
          required
          label="Pincode"
          placeholder="Enter 6-digit pincode"
          icon="📮"
          value={payload?.pincode}
          error={pincodeStatus === "error"}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);

            update({
              pincode: value,
            });
          }}
        />
        {/* STATE */}
        {/* <FloatingSelect
          required
          label="State"
          value={payload?.stateCode || ""}
          onChange={(e) => {
            const selectedState = states.find(
              (s) => s.isoCode === e.target.value,
            );
            update({
              state: selectedState?.name || "",
              stateCode: selectedState?.isoCode || "",
              city: "",
            });
          }}
          options={states.map((state) => ({
            label: state.name,
            value: state.isoCode,
          }))}
        /> */}
        <FloatingSelect
          required
          warning
          label="State"
          error={errors.state}
          value={payload?.state || ""}
          onChange={(e) =>
            update({
              state: e.target.value,
            })
          }
          options={states.map((state) => ({
            label: state.name,
            value: state.name,
          }))}
        />

        {/* CITY */}
        {/* <FloatingSelect
          required
          label="City"
          value={payload?.city || ""}
          onChange={(e) =>
            update({
              city: e.target.value,
            })
          }
          options={cities.map((city) => ({
            label: city.name,
            value: city.name,
          }))}
        /> */}
        {/* CITY */}
        <FloatingSelect
          required
          warning
          label="City"
          error={errors.city}
          value={payload?.city || ""}
          onChange={(e) =>
            update({
              city: e.target.value,
            })
          }
          options={cities.map((city) => ({
            label: city.name,
            value: city.name,
          }))}
        />
        {/* <FloatingInput
          required
          label="Locality"
          placeholder="e.g. Gachibowli"
          icon="📌"
          value={payload?.locality}
          error={errors.locality}
          inputRef={localityRef}
          onChange={(e) => {
            update({
              locality: capitalizeFirst(e.target.value),
            });

            clr("locality");
          }}
        /> */}
        {/* CITY */}
        <FloatingInput
          required
          label="Locality"
          error={errors.locality}
          warning
          placeholder="e.g. Gachibowli"
          icon="📌"
          value={payload?.locality}
          inputRef={localityRef}
          onChange={(e) => {
            update({
              locality: capitalizeFirst(e.target.value),
            });

            clr("locality");
          }}
        />

        <FloatingSelect
          required
          label="Currency"
          error={errors.currency}
          value={payload?.currency || ""}
          onChange={(e) => {
            update({
              currency: e.target.value,
            });

            clr("currency");
          }}
          options={[
            { label: "🇮🇳 INR - Indian Rupee", value: "INR" },
            { label: "🇺🇸 USD - US Dollar", value: "USD" },
            { label: "🇪🇺 EUR - Euro", value: "EUR" },
            { label: "🇦🇪 AED - UAE Dirham", value: "AED" },
            { label: "🇬🇧 GBP - British Pound", value: "GBP" },
            { label: "🇨🇦 CAD - Canadian Dollar", value: "CAD" },
            { label: "🇦🇺 AUD - Australian Dollar", value: "AUD" },
            { label: "🇸🇬 SGD - Singapore Dollar", value: "SGD" },
            { label: "🇯🇵 JPY - Japanese Yen", value: "JPY" },
            { label: "🇨🇳 CNY - Chinese Yuan", value: "CNY" },
          ]}
        />
      </div>
    </div>
  );
});

export default BasicStep;
