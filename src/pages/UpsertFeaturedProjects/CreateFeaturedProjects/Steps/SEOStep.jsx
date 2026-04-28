// src/pages/post-property/featured-create/steps/SEOStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Search, TrendingUp } from "lucide-react";

const inp = (err) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200 resize-none
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

const SEOStep = forwardRef(({ payload, update }, ref) => {
  const [errors, setErrors] = useState({});
  const seoRef = useRef(null);

  const titleLen = (payload.metaTitle || "").trim().length;
  const descLen  = (payload.metaDescription || "").trim().length;
  const keywords = (payload.metaKeywords || "").split(",").map((k) => k.trim()).filter(Boolean);

  // useImperativeHandle(ref, () => ({
  //   validate() {
  //     const e = {};
  //     if (!payload.metaTitle || titleLen < 5)
  //       e.metaTitle = "Meta title is required (min 5 characters)";
  //     if (!payload.metaDescription || descLen < 20)
  //       e.metaDescription = "Meta description is required (min 20 characters)";
  //     if (keywords.length === 0)
  //       e.metaKeywords = "Enter at least one keyword";
  //     setErrors(e);
  //     return Object.keys(e).length === 0;
  //   },
  // }));
 

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (!payload.metaTitle || titleLen < 5)
        e.metaTitle = "Meta title is required (min 5 characters)";

      if (!payload.metaDescription || descLen < 20)
        e.metaDescription = "Meta description is required (min 20 characters)";

      if (keywords.length === 0) e.metaKeywords = "Enter at least one keyword";

      setErrors(e);

      return Object.keys(e).length === 0;
    },

    // ✅ ADD THIS (IMPORTANT)
    isValid() {
      return (
        payload.metaTitle &&
        payload.metaTitle.trim().length >= 5 &&
        payload.metaDescription &&
        payload.metaDescription.trim().length >= 20 &&
        (payload.metaKeywords || "")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean).length > 0
      );
    },
  }));


  const clr = (key) => setErrors((p) => { const c={...p}; delete c[key]; return c; });

  const getBarColor = (val, min, ideal) => {
    if (val >= ideal) return "#ef4444";
    if (val >= min)   return "#27AE60";
    return "#f59e0b";
  };

  return (
    <div className="space-y-6" ref={seoRef}>
      {/* SERP Preview */}
      {(payload.metaTitle || payload.metaDescription) && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#f0fdf6,#dcfce7)", border:"2px solid #bbf7d0" }}>
              <Search size={14} style={{ color:"#27AE60" }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Google Preview</p>
          </div>
          <div className="pl-4 border-l-4 space-y-1" style={{ borderColor:"#27AE60" }}>
            <p className="text-xs text-gray-400">https://yoursite.com › property</p>
            <p className="text-blue-600 text-base font-bold hover:underline cursor-pointer leading-tight">
              {payload.metaTitle || "Your Page Title"}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {payload.metaDescription?.substring(0, 160) || "Your meta description will appear here..."}
            </p>
          </div>
        </div>
      )}

      {/* Meta Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL}>Meta Title *</label>
          <span className="text-xs font-black" style={{ color: titleLen >= 5 ? "#27AE60" : "#9ca3af" }}>
            {titleLen} chars {titleLen >= 50 && titleLen <= 60 ? "· ideal ✓" : titleLen > 60 ? "· too long" : ""}
          </span>
        </div>
        <input className={inp(errors.metaTitle)}
          value={payload.metaTitle || ""}
          placeholder="Premium Apartments in Hyderabad | Project Name"
          onChange={(e) => { update({ metaTitle:e.target.value }); clr("metaTitle"); }} />
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width:`${Math.min(100,(titleLen/60)*100)}%`, background:getBarColor(titleLen,5,61) }} />
        </div>
        {errors.metaTitle && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.metaTitle}</p>}
      </div>

      {/* Meta Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL}>Meta Description *</label>
          <span className="text-xs font-black" style={{ color: descLen >= 20 ? "#27AE60" : "#9ca3af" }}>
            {descLen}/160 {descLen >= 150 && descLen <= 160 ? "· ideal ✓" : descLen > 160 ? "· too long" : ""}
          </span>
        </div>
        <textarea rows={4} className={inp(errors.metaDescription)}
          value={payload.metaDescription || ""}
          placeholder="Describe your property for search engines. Include key features, location, and unique selling points..."
          onChange={(e) => { update({ metaDescription:e.target.value }); clr("metaDescription"); }} />
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width:`${Math.min(100,(descLen/160)*100)}%`, background:getBarColor(descLen,20,161) }} />
        </div>
        {errors.metaDescription && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.metaDescription}</p>}
      </div>

      {/* Meta Keywords */}
      <div>
        <label className={LABEL}>Meta Keywords * (comma separated)</label>
        <input className={inp(errors.metaKeywords)}
          value={payload.metaKeywords || ""}
          placeholder="luxury apartments, Hyderabad real estate, 3BHK flats"
          onChange={(e) => { update({ metaKeywords:e.target.value }); clr("metaKeywords"); }} />
        {errors.metaKeywords && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.metaKeywords}</p>}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((kw, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border-2"
                style={{ background:"#f0fdf6", borderColor:"#bbf7d0", color:"#1a7a42" }}>
                <TrendingUp size={11} /> {kw}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{keywords.length} keyword{keywords.length !== 1 ? "s" : ""} added</p>
      </div>
    </div>
  );
});

export default SEOStep;