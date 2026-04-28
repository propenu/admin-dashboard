// // // src/pages/post-property/featured-create/steps/BasicStep.jsx
// // import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// // const inp = (err) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
// //   outline-none placeholder:text-gray-400 transition-all duration-200
// //   ${err ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
// //          : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

// // const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";
// // const ERR   = "flex items-center gap-1 text-xs text-red-500 font-semibold mt-1.5";

// // const Field = ({ label, error, children }) => (
// //   <div>
// //     <label className={LABEL}>{label}</label>
// //     {children}
// //     {error && <p className={ERR}>⚠ {error}</p>}
// //   </div>
// // );

// // const BasicStep = forwardRef(({ payload, update }, ref) => {
// //   const titleRef    = useRef(null);
// //   const addressRef  = useRef(null);
// //   const cityRef     = useRef(null);
// //   const localityRef = useRef(null);
// //   const stateRef    = useRef(null);
// //   const currencyRef = useRef(null);
// //   const [errors, setErrors] = useState({});

// //   useImperativeHandle(ref, () => ({
// //     validate() {
// //       const e = {};
// //       if (!payload?.title?.trim())    e.title    = "Title is required";
// //       if (!payload?.address?.trim())  e.address  = "Address is required";
// //       if (!payload?.city?.trim())     e.city     = "City is required";
// //       if (!payload?.locality?.trim()) e.locality = "Locality is required";
// //       if (!payload?.state?.trim())    e.state    = "State is required";
// //       if (!payload?.currency?.trim()) e.currency = "Currency is required";
// //       setErrors(e);
// //       if (Object.keys(e).length) {
// //         const refMap = { title:titleRef, address:addressRef, city:cityRef, locality:localityRef, state:stateRef, currency:currencyRef };
// //         refMap[Object.keys(e)[0]]?.current?.scrollIntoView({ behavior:"smooth", block:"center" });
// //         refMap[Object.keys(e)[0]]?.current?.focus();
// //         return false;
// //       }
// //       return true;
// //     },
// //   }));

// //   const clr = (key) => setErrors((p) => { const c = { ...p }; delete c[key]; return c; });

// //   return (
// //     <div className="space-y-6">
// //       {/* Intro strip */}
// //       <div className="px-4 py-3 rounded-xl border border-[#27AE60]/20 bg-[#f0fdf6] text-[#1a7a42] text-sm font-semibold flex items-center gap-2">
// //         <span>💡</span>
// //         Fill in the core details that identify this property listing.
// //       </div>

// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
// //         <Field label="Property Title *" error={errors.title}>
// //           <input ref={titleRef} className={inp(errors.title)}
// //             value={payload?.title || ""} placeholder="e.g. Emerald Heights Phase 2"
// //             onChange={(e) => { update({ title: e.target.value }); clr("title"); }} />
// //         </Field>

// //         <Field label="Full Address *" error={errors.address}>
// //           <input ref={addressRef} className={inp(errors.address)}
// //             value={payload?.address || ""} placeholder="Street, Area, City"
// //             onChange={(e) => { update({ address: e.target.value }); clr("address"); }} />
// //         </Field>

// //         <Field label="City *" error={errors.city}>
// //           <input ref={cityRef} className={inp(errors.city)}
// //             value={payload?.city || ""} placeholder="e.g. Hyderabad"
// //             onChange={(e) => { update({ city: e.target.value }); clr("city"); }} />
// //         </Field>

// //         <Field label="Locality *" error={errors.locality}>
// //           <input ref={localityRef} className={inp(errors.locality)}
// //             value={payload?.locality || ""} placeholder="e.g. Gachibowli"
// //             onChange={(e) => { update({ locality: e.target.value }); clr("locality"); }} />
// //         </Field>

// //         <Field label="State *" error={errors.state}>
// //           <input ref={stateRef} className={inp(errors.state)}
// //             value={payload?.state || ""} placeholder="e.g. Telangana"
// //             onChange={(e) => { update({ state: e.target.value }); clr("state"); }} />
// //         </Field>

// //         <Field label="Currency *" error={errors.currency}>
// //           <input ref={currencyRef} className={inp(errors.currency)}
// //             value={payload?.currency || ""} placeholder="INR"
// //             onChange={(e) => { update({ currency: e.target.value }); clr("currency"); }} />
// //         </Field>

// //         <Field label="Listing Status">
// //           <select className={inp(false)} value={payload?.status || "active"}
// //             onChange={(e) => update({ status: e.target.value })}>
// //             <option value="active">Active</option>
// //             <option value="inactive">Inactive</option>
// //             <option value="draft">Draft</option>
// //           </select>
// //         </Field>
// //       </div>
// //     </div>
// //   );
// // });

// // export default BasicStep; 


// // src/pages/post-property/featured-create/steps/BasicStep.jsx
// import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// const CATEGORY_TYPES = [
//   { value: "residential",  label: "Residential"  },
//   { value: "commercial",   label: "Commercial"   },
//   { value: "land",         label: "Land"         },
//   { value: "agricultural", label: "Agricultural" },
// ];

// const PROPERTY_TYPES = {
//   residential: [
//     { label: "Flat / Apartment",           value: "apartment"                },
//     { label: "Independent House",          value: "independent-house"        },
//     { label: "Villa",                       value: "villa"                    },
//     { label: "Penthouse",                  value: "penthouse"                },
//     { label: "Studio",                     value: "studio"                   },
//     { label: "Duplex",                     value: "duplex"                   },
//     { label: "Triplex",                    value: "triplex"                  },
//     { label: "Farmhouse",                  value: "farmhouse"                },
//     { label: "Independent Builder Floor",  value: "independent-builder-floor"},
//   ],
//   commercial: [
//     { label: "Office",           value: "office"     },
//     { label: "Retail",           value: "retail"     },
//     { label: "Shop",             value: "shop"       },
//     { label: "Showroom",         value: "showroom"   },
//     { label: "Warehouse",        value: "warehouse"  },
//     { label: "Industrial",       value: "industrial" },
//     { label: "Co-working Space", value: "coworking"  },
//     { label: "Restaurant",       value: "restaurant" },
//     { label: "Clinic",           value: "clinic"     },
//     { label: "Land",             value: "land"       },
//     { label: "Other",            value: "other"      },
//   ],
//   land: [
//     { label: "Plot",              value: "plot"              },
//     { label: "Residential Plot",  value: "residential-plot"  },
//     { label: "Industrial Plot",   value: "industrial-plot"   },
//     { label: "Agricultural Plot", value: "agricultural-plot" },
//     { label: "Commercial Plot",   value: "commercial-plot"   },
//     { label: "Investment Plot",   value: "investment-plot"   },
//     { label: "Corner Plot",       value: "corner-plot"       },
//     { label: "NA Plot",           value: "na-plot"           },
//   ],
//   agricultural: [
//     { label: "Dry Land",          value: "dry-land"          },
//     { label: "Wet Land",          value: "wet-land"          },
//     { label: "Farm Land",         value: "farm-land"         },
//     { label: "Orchard Land",      value: "orchard-land"      },
//     { label: "Plantation",        value: "plantation"        },
//     { label: "Agricultural Land", value: "agricultural-land" },
//     { label: "Dairy Farm",        value: "dairy-farm"        },
//     { label: "Ranch",             value: "ranch"             },
//   ],
// };

// /* ── helpers ─────────────────────────────────────────────────── */
// const inp = (err) =>
//   `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
//   outline-none placeholder:text-gray-400 transition-all duration-200
//   ${err
//     ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
//     : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

// const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";
// const ERR   = "flex items-center gap-1 text-xs text-red-500 font-semibold mt-1.5";

// const Field = ({ label, error, children }) => (
//   <div>
//     <label className={LABEL}>{label}</label>
//     {children}
//     {error && <p className={ERR}>⚠ {error}</p>}
//   </div>
// );

// /* ── component ───────────────────────────────────────────────── */
// const BasicStep = forwardRef(({ payload, update }, ref) => {
//   const titleRef        = useRef(null);
//   const addressRef      = useRef(null);
//   const cityRef         = useRef(null);
//   const localityRef     = useRef(null);
//   const stateRef        = useRef(null);
//   const currencyRef     = useRef(null);
//   const categoryTypeRef = useRef(null);

//   const [errors,   setErrors]   = useState({});
//   const [ptVisible, setPtVisible] = useState(!!payload?.categoryType);

//   useImperativeHandle(ref, () => ({
//     validate() {
//       const e = {};
//       if (!payload?.title?.trim())        e.title        = "Title is required";
//       if (!payload?.address?.trim())      e.address      = "Address is required";
//       if (!payload?.city?.trim())         e.city         = "City is required";
//       if (!payload?.locality?.trim())     e.locality     = "Locality is required";
//       if (!payload?.state?.trim())        e.state        = "State is required";
//       if (!payload?.currency?.trim())     e.currency     = "Currency is required";
//       if (!payload?.categoryType?.trim()) e.categoryType = "Category is required";
//       setErrors(e);
//       if (Object.keys(e).length) {
//         const refMap = {
//           title: titleRef, address: addressRef, city: cityRef,
//           locality: localityRef, state: stateRef, currency: currencyRef,
//           categoryType: categoryTypeRef,
//         };
//         const first = Object.keys(e)[0];
//         refMap[first]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
//         refMap[first]?.current?.focus();
//         return false;
//       }
//       return true;
//     },
//   }));

//   const clr = (key) => setErrors((p) => { const c = { ...p }; delete c[key]; return c; });

//   /* when category changes, clear propertyType and animate in the new list */
//   const handleCategoryChange = (val) => {
//     const lower = val.toLowerCase();
//     setPtVisible(false);
//     update({ categoryType: lower, propertyType: "" });
//     clr("categoryType");
//     // tiny delay so the collapse animation runs before re-open
//     if (lower) setTimeout(() => setPtVisible(true), 120);
//   };

//   const propertyOptions = PROPERTY_TYPES[payload?.categoryType] || [];

//   return (
//     <div className="space-y-6">
//       {/* Intro strip */}
//       <div className="px-4 py-3 rounded-xl border border-[#27AE60]/20 bg-[#f0fdf6] text-[#1a7a42] text-sm font-semibold flex items-center gap-2">
//         <span>💡</span>
//         Fill in the core details that identify this property listing.
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//         {/* Title */}
//         <Field label="Property Title *" error={errors.title}>
//           <input ref={titleRef} className={inp(errors.title)}
//             value={payload?.title || ""} placeholder="e.g. Emerald Heights Phase 2"
//             onChange={(e) => { update({ title: e.target.value }); clr("title"); }} />
//         </Field>

//         {/* Address */}
//         <Field label="Full Address *" error={errors.address}>
//           <input ref={addressRef} className={inp(errors.address)}
//             value={payload?.address || ""} placeholder="Street, Area, City"
//             onChange={(e) => { update({ address: e.target.value }); clr("address"); }} />
//         </Field>

//         {/* City */}
//         <Field label="City *" error={errors.city}>
//           <input ref={cityRef} className={inp(errors.city)}
//             value={payload?.city || ""} placeholder="e.g. Hyderabad"
//             onChange={(e) => { update({ city: e.target.value }); clr("city"); }} />
//         </Field>

//         {/* Locality */}
//         <Field label="Locality *" error={errors.locality}>
//           <input ref={localityRef} className={inp(errors.locality)}
//             value={payload?.locality || ""} placeholder="e.g. Gachibowli"
//             onChange={(e) => { update({ locality: e.target.value }); clr("locality"); }} />
//         </Field>

//         {/* State */}
//         <Field label="State *" error={errors.state}>
//           <input ref={stateRef} className={inp(errors.state)}
//             value={payload?.state || ""} placeholder="e.g. Telangana"
//             onChange={(e) => { update({ state: e.target.value }); clr("state"); }} />
//         </Field>

//         {/* Currency */}
//         <Field label="Currency *" error={errors.currency}>
//           <input ref={currencyRef} className={inp(errors.currency)}
//             value={payload?.currency || ""} placeholder="INR"
//             onChange={(e) => { update({ currency: e.target.value }); clr("currency"); }} />
//         </Field>

//         {/* Listing Status */}
//         <Field label="Listing Status">
//           <select className={inp(false)} value={payload?.status || "active"}
//             onChange={(e) => update({ status: e.target.value })}>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//             <option value="draft">Draft</option>
//           </select>
//         </Field>

//         {/* ── Category Type ─────────────────────────────────────── */}
//         <Field label="Category Type *" error={errors.categoryType}>
//           <select
//             ref={categoryTypeRef}
//             className={inp(errors.categoryType)}
//             value={payload?.categoryType || ""}
//             onChange={(e) => handleCategoryChange(e.target.value)}
//           >
//             <option value="">Select category…</option>
//             {CATEGORY_TYPES.map((c) => (
//               <option key={c.value} value={c.value}>{c.label}</option>
//             ))}
//           </select>
//         </Field>

//       </div>

//       {/* ── Property Type – animated reveal ───────────────────── */}
//       <div
//         style={{
//           display:       "grid",
//           gridTemplateRows: ptVisible && propertyOptions.length ? "1fr" : "0fr",
//           opacity:       ptVisible && propertyOptions.length ? 1 : 0,
//           transition:    "grid-template-rows 300ms ease, opacity 250ms ease",
//         }}
//       >
//         {/* inner wrapper must have overflow:hidden for grid-rows trick */}
//         <div style={{ overflow: "hidden" }}>
//           <div className="pt-1">
//             <Field label="Property Type">
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
//                 {propertyOptions.map((opt, i) => {
//                   const selected = payload?.propertyType === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => update({ propertyType: opt.value })}
//                       style={{
//                         animationDelay: ptVisible ? `${i * 35}ms` : "0ms",
//                         animationFillMode: "both",
//                       }}
//                       className={[
//                         "px-3 py-2.5 rounded-xl border-2 text-xs font-bold text-left",
//                         "transition-all duration-200 animate-fadeSlideUp",
//                         selected
//                           ? "border-[#27AE60] bg-[#f0fdf6] text-[#1a7a42] shadow-sm shadow-[#27AE60]/20"
//                           : "border-gray-200 bg-white text-gray-600 hover:border-[#27AE60]/50 hover:bg-[#f0fdf6]/60",
//                       ].join(" ")}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </Field>
//           </div>
//         </div>
//       </div>

//       {/* keyframes injected once */}
//       <style>{`
//         @keyframes fadeSlideUp {
//           from { opacity: 0; transform: translateY(8px); }
//           to   { opacity: 1; transform: translateY(0);   }
//         }
//         .animate-fadeSlideUp {
//           animation: fadeSlideUp 220ms ease both;
//         }
//       `}</style>
//     </div>
//   );
// });

// export default BasicStep; 



// src/pages/post-property/featured-create/steps/BasicStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from "react";

/* ─── data ──────────────────────────────────────────────────────── */
const CATEGORY_TYPES = [
  { value: "residential",  label: "Residential",  icon: "🏠", desc: "Apartments, villas & homes"  },
  { value: "commercial",   label: "Commercial",   icon: "🏢", desc: "Offices, shops & retail"      },
  { value: "land",         label: "Land",          icon: "🌍", desc: "Plots & open land"           },
  { value: "agricultural", label: "Agricultural", icon: "🌾", desc: "Farms & agri land"            },
];

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment",  value: "apartment",                icon: "🏗" },
    { label: "Independent House", value: "independent-house",        icon: "🏡" },
    { label: "Villa",             value: "villa",                    icon: "🏰" },
    { label: "Penthouse",         value: "penthouse",                icon: "🌆" },
    { label: "Studio",            value: "studio",                   icon: "📐" },
    { label: "Duplex",            value: "duplex",                   icon: "🏘" },
    { label: "Triplex",           value: "triplex",                  icon: "🏚" },
    { label: "Farmhouse",         value: "farmhouse",                icon: "🌿" },
    { label: "Builder Floor",     value: "independent-builder-floor",icon: "🧱" },
  ],
  commercial: [
    { label: "Office",     value: "office",     icon: "💼" },
    { label: "Retail",     value: "retail",     icon: "🛍" },
    { label: "Shop",       value: "shop",       icon: "🏪" },
    { label: "Showroom",   value: "showroom",   icon: "🚗" },
    { label: "Warehouse",  value: "warehouse",  icon: "📦" },
    { label: "Industrial", value: "industrial", icon: "🏭" },
    { label: "Co-working", value: "coworking",  icon: "🤝" },
    { label: "Restaurant", value: "restaurant", icon: "🍽" },
    { label: "Clinic",     value: "clinic",     icon: "🏥" },
    { label: "Land",       value: "land",       icon: "🌍" },
    { label: "Other",      value: "other",      icon: "➕" },
  ],
  land: [
    { label: "Plot",              value: "plot",              icon: "📌" },
    { label: "Residential Plot",  value: "residential-plot",  icon: "🏠" },
    { label: "Industrial Plot",   value: "industrial-plot",   icon: "🏭" },
    { label: "Agricultural Plot", value: "agricultural-plot", icon: "🌾" },
    { label: "Commercial Plot",   value: "commercial-plot",   icon: "🏢" },
    { label: "Investment Plot",   value: "investment-plot",   icon: "📈" },
    { label: "Corner Plot",       value: "corner-plot",       icon: "📐" },
    { label: "NA Plot",           value: "na-plot",           icon: "🗺" },
  ],
  agricultural: [
    { label: "Dry Land",          value: "dry-land",          icon: "🏜" },
    { label: "Wet Land",          value: "wet-land",          icon: "💧" },
    { label: "Farm Land",         value: "farm-land",         icon: "🚜" },
    { label: "Orchard Land",      value: "orchard-land",      icon: "🍎" },
    { label: "Plantation",        value: "plantation",        icon: "🌴" },
    { label: "Agricultural Land", value: "agricultural-land", icon: "🌾" },
    { label: "Dairy Farm",        value: "dairy-farm",        icon: "🐄" },
    { label: "Ranch",             value: "ranch",             icon: "🤠" },
  ],
};

const STATUS_OPTIONS = [
  { value: "active",   label: "Active",   icon: "🟢", desc: "Live & visible",      color: "#27AE60", bg: "#f0fdf6", border: "#27AE60" },
  { value: "draft",    label: "Draft",    icon: "🟡", desc: "Saved, not published", color: "#D97706", bg: "#fffbeb", border: "#F59E0B" },
  { value: "inactive", label: "Inactive", icon: "🔴", desc: "Hidden from listings", color: "#DC2626", bg: "#fef2f2", border: "#EF4444" },
];

/* ─── StatusSlider ──────────────────────────────────────────────── */
const StatusSlider = ({ value, onChange }) => {
  const trackRef  = useRef(null);
  const isDragging = useRef(false);
  const currentIdx = STATUS_OPTIONS.findIndex(s => s.value === value) ?? 0;
  const active = STATUS_OPTIONS[currentIdx] || STATUS_OPTIONS[0];

  const getIdxFromX = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (STATUS_OPTIONS.length - 1));
  }, []);

  const handleMove = useCallback((clientX) => {
    if (!isDragging.current) return;
    const idx = getIdxFromX(clientX);
    if (STATUS_OPTIONS[idx].value !== value) onChange(STATUS_OPTIONS[idx].value);
  }, [value, onChange, getIdxFromX]);

  const onMouseDown = (e) => {
    isDragging.current = true;
    const idx = getIdxFromX(e.clientX);
    onChange(STATUS_OPTIONS[idx].value);
    const onMove = (ev) => handleMove(ev.clientX);
    const onUp   = () => { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e) => {
    isDragging.current = true;
    const onMove = (ev) => { isDragging.current = true; handleMove(ev.touches[0].clientX); };
    const onEnd  = () => { isDragging.current = false; window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  const thumbPct = (currentIdx / (STATUS_OPTIONS.length - 1)) * 100;

  return (
    <div
      className="rounded-2xl border-2 bg-white shadow-sm p-4 transition-all duration-300"
      style={{ borderColor: active.border }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Listing Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base leading-none">{active.icon}</span>
            <span className="text-sm font-black" style={{ color: active.color }}>{active.label}</span>
            <span className="text-xs text-gray-400 font-medium">— {active.desc}</span>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-black transition-all duration-300"
          style={{ backgroundColor: active.bg, color: active.color }}
        >
          {active.label}
        </div>
      </div>

      {/* track */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* track bg */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${thumbPct}%`,
              background: `linear-gradient(to right, #27AE60, ${active.color})`,
            }}
          />
        </div>

        {/* notch marks */}
        {STATUS_OPTIONS.map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white border-2 transition-all duration-200"
            style={{
              left: `calc(${(i / (STATUS_OPTIONS.length - 1)) * 100}% - 4px)`,
              borderColor: i <= currentIdx ? active.color : "#e5e7eb",
              transform: i === currentIdx ? "scale(1)" : "scale(0.8)",
            }}
          />
        ))}

        {/* thumb */}
        <div
          className="absolute w-7 h-7 rounded-full bg-white border-[3px] shadow-lg flex items-center justify-center transition-all duration-300 z-10"
          style={{
            left: `calc(${thumbPct}% - 14px)`,
            borderColor: active.color,
            boxShadow: `0 2px 12px 0 ${active.color}40`,
          }}
        >
          <div className="w-2 h-2 rounded-full transition-all duration-300" style={{ backgroundColor: active.color }} />
        </div>
      </div>

      {/* labels */}
      <div className="flex justify-between mt-2 px-0.5">
        {STATUS_OPTIONS.map((s, i) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className="text-[10px] font-bold transition-all duration-200 select-none"
            style={{
              color: i === currentIdx ? active.color : "#9ca3af",
              transform: i === currentIdx ? "scale(1.05)" : "scale(1)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── FloatingInput ─────────────────────────────────────────────── */
const FloatingInput = ({ label, value, onChange, placeholder, error, inputRef, icon, required }) => {
  const [focused, setFocused] = useState(false);
  const hasVal = !!(value && value.length > 0);
  const lifted = focused || hasVal;

  return (
    <div className="relative">
      <div className={[
        "relative flex items-center rounded-2xl border-2 bg-white transition-all duration-300",
        error    ? "border-red-400 shadow-sm shadow-red-100"
        : focused ? "border-[#27AE60] shadow-lg shadow-[#27AE60]/10"
                  : "border-gray-100 hover:border-gray-200 shadow-sm",
      ].join(" ")}>
        <span className={["pl-4 text-lg select-none flex-shrink-0 transition-opacity duration-200", focused ? "opacity-100" : "opacity-40"].join(" ")}>{icon}</span>
        <div className="relative flex-1 px-3 pt-5 pb-2">
          <label className={[
            "absolute left-3 pointer-events-none font-semibold transition-all duration-200",
            lifted ? "top-1.5 text-[10px] tracking-widest uppercase" : "top-1/2 -translate-y-1/2 text-sm",
            error ? "text-red-400" : focused ? "text-[#27AE60]" : "text-gray-400",
          ].join(" ")}>
            {label}{required && " *"}
          </label>
          <input
            ref={inputRef} value={value || ""} placeholder={lifted ? placeholder : ""}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={onChange}
            className="w-full bg-transparent text-gray-900 text-sm font-semibold outline-none placeholder:text-gray-300 mt-0.5"
          />
        </div>
        {hasVal && !error && <span className="pr-4 text-[#27AE60] text-sm font-bold animate-popIn">✓</span>}
        {error && <span className="pr-4 text-red-400 font-bold">!</span>}
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-1.5 pl-2 animate-slideDown">⚠ {error}</p>}
    </div>
  );
};

/* ─── SectionLabel ──────────────────────────────────────────────── */
const SectionLabel = ({ number, title }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-xl bg-[#27AE60] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[10px] font-black">{number}</span>
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">{title}</h3>
    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
  </div>
);

/* ─── BasicStep ─────────────────────────────────────────────────── */
const BasicStep = forwardRef(({ payload, update }, ref) => {
  const titleRef        = useRef(null);
  const addressRef      = useRef(null);
  const cityRef         = useRef(null);
  const localityRef     = useRef(null);
  const stateRef        = useRef(null);
  const currencyRef     = useRef(null);
  const categoryTypeRef = useRef(null);

  const [errors,    setErrors]    = useState({});
  const [ptVisible, setPtVisible] = useState(!!payload?.categoryType);

  // useImperativeHandle(ref, () => ({
  //   validate() {
  //     const e = {};
  //     if (!payload?.title?.trim())        e.title        = "Title is required";
  //     if (!payload?.address?.trim())      e.address      = "Address is required";
  //     if (!payload?.city?.trim())         e.city         = "City is required";
  //     if (!payload?.locality?.trim())     e.locality     = "Locality is required";
  //     if (!payload?.state?.trim())        e.state        = "State is required";
  //     if (!payload?.currency?.trim())     e.currency     = "Currency is required";
  //     if (!payload?.categoryType?.trim()) e.categoryType = "Category is required";
  //     setErrors(e);
  //     if (Object.keys(e).length) {
  //       const refMap = { title: titleRef, address: addressRef, city: cityRef, locality: localityRef, state: stateRef, currency: currencyRef, categoryType: categoryTypeRef };
  //       const first = Object.keys(e)[0];
  //       refMap[first]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  //       refMap[first]?.current?.focus();
  //       return false;
  //     }
  //     return true;
  //   },
  // }));
 

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (!payload?.title?.trim()) e.title = true;
      if (!payload?.address?.trim()) e.address = true;
      if (!payload?.city?.trim()) e.city = true;
      if (!payload?.locality?.trim()) e.locality = true;
      if (!payload?.state?.trim()) e.state = true;
      if (!payload?.currency?.trim()) e.currency = true;
      if (!payload?.categoryType?.trim()) e.categoryType = true;

      setErrors(e);

      if (Object.keys(e).length) {
        const refMap = {
          title: titleRef,
          address: addressRef,
          city: cityRef,
          locality: localityRef,
          state: stateRef,
          currency: currencyRef,
          categoryType: categoryTypeRef,
        };
        const first = Object.keys(e)[0];
        refMap[first]?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        refMap[first]?.current?.focus();
        return false;
      }

      return true;
    },

    // ✅ NEW FUNCTION (IMPORTANT)
    isValid() {
      return (
        payload?.title?.trim() &&
        payload?.address?.trim() &&
        payload?.city?.trim() &&
        payload?.locality?.trim() &&
        payload?.state?.trim() &&
        payload?.currency?.trim() &&
        payload?.categoryType?.trim()
      );
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

  const clr = (key) => setErrors(p => { const c = { ...p }; delete c[key]; return c; });

  const handleCategoryChange = (val) => {
    const lower = val.toLowerCase();
    setPtVisible(false);
    update({ categoryType: lower, propertyType: "" });
    clr("categoryType");
    if (lower) setTimeout(() => setPtVisible(true), 150);
  };

  const propertyOptions = PROPERTY_TYPES[payload?.categoryType] || [];

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes popIn    { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chipPop  { from{opacity:0;transform:scale(.82) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .animate-popIn     { animation: popIn 280ms cubic-bezier(.34,1.56,.64,1) both; }
        .animate-slideDown { animation: slideDown 200ms ease both; }
        .animate-chipPop   { animation: chipPop 220ms cubic-bezier(.34,1.56,.64,1) both; }
        select option { background: white; color: #111; }
      `}</style>


      {/* section 01*/}
      <SectionLabel number="01" title="Category & Type" />

      {/* Category cards */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Category Type <span className="text-red-400">*</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORY_TYPES.map((cat, i) => {
            const active = payload?.categoryType === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                ref={i === 0 ? categoryTypeRef : undefined}
                onClick={() => handleCategoryChange(cat.value)}
                className={[
                  "relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left",
                  "transition-all duration-250 overflow-hidden select-none",
                  active
                    ? "border-[#27AE60] bg-gradient-to-br from-[#f0fdf6] to-[#e4f9ee] shadow-lg shadow-[#27AE60]/15 scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-[#27AE60]/40 hover:shadow-md shadow-sm hover:scale-[1.01]",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#27AE60] animate-popIn" />
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
                  {cat.desc}
                </span>
              </button>
            );
          })}
        </div>
        {errors.categoryType && (
          <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold mt-2 pl-1 animate-slideDown">
            ⚠ {errors.categoryType}
          </p>
        )}
      </div>

      {/* Property type chip reveal */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: ptVisible && propertyOptions.length ? "1fr" : "0fr",
          opacity: ptVisible && propertyOptions.length ? 1 : 0,
          transition:
            "grid-template-rows 350ms cubic-bezier(.4,0,.2,1), opacity 280ms ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Property Type
            </p>
            <div className="flex flex-wrap gap-2">
              {propertyOptions.map((opt, i) => {
                const selected = payload?.propertyType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ propertyType: opt.value })}
                    style={{
                      animationDelay: ptVisible ? `${i * 28}ms` : "0ms",
                      animationFillMode: "both",
                    }}
                    className={[
                      "animate-chipPop flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2",
                      "text-xs font-bold transition-all duration-200 select-none",
                      selected
                        ? "border-[#27AE60] bg-[#27AE60] text-white shadow-md shadow-[#27AE60]/30 scale-105"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#27AE60]/60 hover:bg-[#f0fdf6] hover:text-[#1a7a42]",
                    ].join(" ")}
                  >
                    <span className="text-sm leading-none">{opt.icon}</span>
                    {opt.label}
                    {selected && (
                      <span className="text-[10px] ml-0.5 font-black">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* section 02 */}
      <SectionLabel number="02" title="Property Identity" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          required
          label="Property Title"
          placeholder="e.g. Emerald Heights Phase 2"
          icon="🏷"
          value={payload?.title}
          error={errors.title}
          inputRef={titleRef}
          onChange={(e) => {
            update({ title: capitalizeWords(e.target.value) });
            clr("title");
          }}
        />

        <FloatingInput
          required
          label="Full Address"
          placeholder="Street, Area, City"
          icon="📍"
          value={payload?.address}
          error={errors.address}
          inputRef={addressRef}
          onChange={(e) => {
            update({ address: capitalizeFirst(e.target.value) });
            clr("address");
          }}
        />

        <FloatingInput
          required
          label="City"
          placeholder="e.g. Hyderabad"
          icon="🌆"
          value={payload?.city}
          error={errors.city}
          inputRef={cityRef}
          onChange={(e) => {
            update({ city: capitalizeFirst(e.target.value) });
            clr("city");
          }}
        />

        <FloatingInput
          required
          label="Locality"
          placeholder="e.g. Gachibowli"
          icon="📌"
          value={payload?.locality}
          error={errors.locality}
          inputRef={localityRef}
          onChange={(e) => {
            update({ locality: capitalizeFirst(e.target.value) });
            clr("locality");
          }}
        />

        <FloatingInput
          required
          label="State"
          placeholder="e.g. Telangana"
          icon="🗺"
          value={payload?.state}
          error={errors.state}
          inputRef={stateRef}
          onChange={(e) => {
            update({ state: capitalizeFirst(e.target.value) });
            clr("state");
          }}
        />

        <FloatingInput
          required
          label="Currency"
          placeholder="INR"
          icon="💰"
          value={payload?.currency}
          error={errors.currency}
          inputRef={currencyRef}
          onChange={(e) => {
            update({ currency: e.target.value });
            clr("currency");
          }}
        />
      </div>

      {/* Status slider — full width */}
      {/* <StatusSlider
        value={payload?.status || "active"}
        onChange={(val) => update({ status: val })}
      /> */}
    </div>
  );
});

export default BasicStep;