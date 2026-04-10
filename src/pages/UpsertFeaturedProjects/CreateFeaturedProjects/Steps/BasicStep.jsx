// src/pages/post-property/featured-create/steps/BasicStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const inp = (err) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
         : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";
const ERR   = "flex items-center gap-1 text-xs text-red-500 font-semibold mt-1.5";

const Field = ({ label, error, children }) => (
  <div>
    <label className={LABEL}>{label}</label>
    {children}
    {error && <p className={ERR}>⚠ {error}</p>}
  </div>
);

const BasicStep = forwardRef(({ payload, update }, ref) => {
  const titleRef    = useRef(null);
  const addressRef  = useRef(null);
  const cityRef     = useRef(null);
  const localityRef = useRef(null);
  const stateRef    = useRef(null);
  const currencyRef = useRef(null);
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!payload?.title?.trim())    e.title    = "Title is required";
      if (!payload?.address?.trim())  e.address  = "Address is required";
      if (!payload?.city?.trim())     e.city     = "City is required";
      if (!payload?.locality?.trim()) e.locality = "Locality is required";
      if (!payload?.state?.trim())    e.state    = "State is required";
      if (!payload?.currency?.trim()) e.currency = "Currency is required";
      setErrors(e);
      if (Object.keys(e).length) {
        const refMap = { title:titleRef, address:addressRef, city:cityRef, locality:localityRef, state:stateRef, currency:currencyRef };
        refMap[Object.keys(e)[0]]?.current?.scrollIntoView({ behavior:"smooth", block:"center" });
        refMap[Object.keys(e)[0]]?.current?.focus();
        return false;
      }
      return true;
    },
  }));

  const clr = (key) => setErrors((p) => { const c = { ...p }; delete c[key]; return c; });

  return (
    <div className="space-y-6">
      {/* Intro strip */}
      <div className="px-4 py-3 rounded-xl border border-[#27AE60]/20 bg-[#f0fdf6] text-[#1a7a42] text-sm font-semibold flex items-center gap-2">
        <span>💡</span>
        Fill in the core details that identify this property listing.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Property Title *" error={errors.title}>
          <input ref={titleRef} className={inp(errors.title)}
            value={payload?.title || ""} placeholder="e.g. Emerald Heights Phase 2"
            onChange={(e) => { update({ title: e.target.value }); clr("title"); }} />
        </Field>

        <Field label="Full Address *" error={errors.address}>
          <input ref={addressRef} className={inp(errors.address)}
            value={payload?.address || ""} placeholder="Street, Area, City"
            onChange={(e) => { update({ address: e.target.value }); clr("address"); }} />
        </Field>

        <Field label="City *" error={errors.city}>
          <input ref={cityRef} className={inp(errors.city)}
            value={payload?.city || ""} placeholder="e.g. Hyderabad"
            onChange={(e) => { update({ city: e.target.value }); clr("city"); }} />
        </Field>

        <Field label="Locality *" error={errors.locality}>
          <input ref={localityRef} className={inp(errors.locality)}
            value={payload?.locality || ""} placeholder="e.g. Gachibowli"
            onChange={(e) => { update({ locality: e.target.value }); clr("locality"); }} />
        </Field>

        <Field label="State *" error={errors.state}>
          <input ref={stateRef} className={inp(errors.state)}
            value={payload?.state || ""} placeholder="e.g. Telangana"
            onChange={(e) => { update({ state: e.target.value }); clr("state"); }} />
        </Field>

        <Field label="Currency *" error={errors.currency}>
          <input ref={currencyRef} className={inp(errors.currency)}
            value={payload?.currency || ""} placeholder="INR"
            onChange={(e) => { update({ currency: e.target.value }); clr("currency"); }} />
        </Field>

        <Field label="Listing Status">
          <select className={inp(false)} value={payload?.status || "active"}
            onChange={(e) => update({ status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
      </div>
    </div>
  );
});

export default BasicStep;