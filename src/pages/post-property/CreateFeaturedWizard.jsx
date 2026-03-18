// // frontend/admin-dashboard/src/pages/post-property/CreateFeaturedWizard.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import Stepper from "./featured-create/Stepper";
// import BasicStep from "./featured-create/steps/BasicStep";
// import HeroStep from "./featured-create/steps/HeroStep";
// import BHKStep from "./featured-create/steps/BHKStep";
// import AmenitiesStep from "./featured-create/steps/AmenitiesStep";
// import GalleryStep from "./featured-create/steps/GalleryStep";
// import AboutStep from "./featured-create/steps/AboutStep";
// import LocationStep from "./featured-create/steps/LocationStep";
// import PropertyProfilesStep from "./featured-create/steps/PropertyProfilesStep";
// import SEOStep from "./featured-create/steps/SEOStep";
// import { fetchLoggedInUser } from "../../services/UserServices/userServices";
// import { createFeaturedProperty } from "../../services/PostAPropertyService";
// import { toast } from "sonner";
// import { ArrowLeft, ArrowRight, Sparkles, Loader2, Building2 } from "lucide-react";

// function buildFormData(payload) {
//   const fd = new FormData();
//   const bhkPlanFiles = [];

//   const bhkSummary = (payload.bhkSummary || []).map((b) => ({
//     bhk: Number(b.bhk || 0),
//     bhkLabel: b.bhkLabel,
//     units: (b.units || []).map((u) => {
//       if (u.planFile instanceof File) {
//         bhkPlanFiles.push(u.planFile);
//         return {
//           minSqft: Number(u.minSqft || 0),
//           maxPrice: Number(u.maxPrice || 0),
//           availableCount: Number(u.availableCount || 0),
//           planFileName: u.planFile.name,
//         };
//       }
//       return {
//         minSqft: Number(u.minSqft || 0),
//         maxPrice: Number(u.maxPrice || 0),
//         availableCount: Number(u.availableCount || 0),
//         planFileName: u.planFileName || undefined,
//       };
//     }),
//   }));

//   if (!payload.title?.trim() || !payload.address?.trim()) {
//     throw new Error("Title and Address are required");
//   }

//   fd.append("title", payload.title);
//   fd.append("address", payload.address);

//   ["heroTagline","heroSubTagline","heroDescription","city","state","locality",
//     "currency","color","metaTitle","metaDescription","metaKeywords","possessionDate",
//     "reraNumber","createdBy","status","mapEmbedUrl","redirectUrl",
//   ].forEach((key) => { if (payload[key]) fd.append(key, payload[key]); });

//   fd.append("isFeatured", payload.isFeatured ? "true" : "false");

//   if (payload.sqftRange) {
//     fd.append("sqftRange", JSON.stringify({
//       min: Number(payload.sqftRange.min || 0),
//       max: Number(payload.sqftRange.max || 0),
//     }));
//   }

//   fd.append("bhkSummary", JSON.stringify(bhkSummary));
//   if (payload.amenities?.length) fd.append("amenities", JSON.stringify(payload.amenities));
//   if (payload.specifications?.length) fd.append("specifications", JSON.stringify(payload.specifications));
//   if (payload.nearbyPlaces?.length) fd.append("nearbyPlaces", JSON.stringify(payload.nearbyPlaces));
//   if (payload.banksApproved?.length) fd.append("banksApproved", JSON.stringify(payload.banksApproved));
//   if (payload.gallerySummary?.length) fd.append("gallerySummary", JSON.stringify(payload.gallerySummary));
//   if (payload.aboutSummary?.length) fd.append("aboutSummary", JSON.stringify(payload.aboutSummary));
//   if (payload.leads?.length) fd.append("leads", JSON.stringify(payload.leads));
//   if (payload.relatedProjects?.length) fd.append("relatedProjects", JSON.stringify(payload.relatedProjects));

//   if (payload.location?.coordinates) {
//     fd.append("location", JSON.stringify({
//       type: "Point",
//       coordinates: [
//         Number(payload.location.coordinates[0]),
//         Number(payload.location.coordinates[1]),
//       ],
//     }));
//   }

//   if (payload.heroImage instanceof File) fd.append("heroImage", payload.heroImage);
//   if (payload.aboutImage instanceof File) fd.append("aboutImage", payload.aboutImage);
//   if (payload.brochure instanceof File) fd.append("brochure", payload.brochure);
//   if (Array.isArray(payload.galleryFiles)) {
//     payload.galleryFiles.forEach((f) => { if (f instanceof File) fd.append("galleryFiles", f); });
//   }
//   bhkPlanFiles.forEach((file) => fd.append("bhkPlanFiles", file));
//   if (payload.logo instanceof File) fd.append("logo", payload.logo);

//   if (payload.youtubeVideos?.length) {
//     fd.append("youtubeVideos", JSON.stringify(payload.youtubeVideos));
//   }

//   console.log("📦 FINAL FORMDATA:");
//   for (const pair of fd.entries()) console.log(pair[0], pair[1]);
//   return fd;
// }

// const ALL_STEPS = [
//   { id: "basic", title: "Basic" },
//   { id: "hero", title: "Hero" },
//   { id: "bhk", title: "BHK" },
//   { id: "amenities", title: "Amenities" },
//   { id: "gallery", title: "Gallery" },
//   { id: "about", title: "About" },
//   { id: "location", title: "Location" },
//   { id: "propertyProfiles", title: "Profiles" },
//   { id: "seo", title: "SEO" },
// ];

// const STEP_META = [
//   { icon: "🏷️", desc: "Property name, address & location basics" },
//   { icon: "🖼️", desc: "Hero banner, tagline & branding" },
//   { icon: "🏠", desc: "BHK types, sizes & pricing" },
//   { icon: "✨", desc: "Features, specs & lead info" },
//   { icon: "📸", desc: "Property gallery images" },
//   { icon: "📝", desc: "About section content & image" },
//   { icon: "📍", desc: "Map coordinates & nearby places" },
//   { icon: "📊", desc: "Towers, RERA, banks & documents" },
//   { icon: "🔍", desc: "Meta title, description & keywords" },
// ];

// const INITIAL_PAYLOAD = {
//   title: "",
//   logo: "",
//   description: "",
//   heroImage: null,
//   heroTagline: "",
//   heroSubTagline: "",
//   heroDescription: "",
//   color: "",
//   createdBy: "",
//   mapEmbedUrl: "",
//   metaTitle: "",
//   metaDescription: "",
//   metaKeywords: "",
//   address: "",
//   city: "",
//   location: { type: "Point", coordinates: ["", ""] },
//   state: "",
//   locality: "",
//   currency: "INR",
//   status: "active",
//   isFeatured:true,
//   sqftRange: { min: "", max: "" },
//   possessionDate: "",
//   totalTowers: "",
//   totalFloors: "",
//   projectArea: "",
//   totalUnits: "",
//   availableUnits: "",
//   reraNumber: "",
//   banksApproved: [],
//   brochure: null,
//   specifications: [],
//   gallerySummary: [],
//   galleryFiles: [],
//   aboutSummary: [],
//   aboutImage: null,
//   bhkSummary: [],
//   amenities: [],
//   nearbyPlaces: [],
//   leads: [],
//   relatedProjects: [],
//   youtubeVideos: [],
// };

// export default function CreateFeaturedWizard() {
//   const navigate = useNavigate();
//   const [current, setCurrent] = useState(0);
//   const [saving, setSaving] = useState(false);
//   const [progress, setProgress] = useState(0);
   
//   const [isSeoValid, setIsSeoValid] = useState(false);
//   const location = useLocation();
//   const projectType = location.state?.type || "featured";

//   const [payload, setPayload] = useState({
//     ...INITIAL_PAYLOAD,
//     isFeatured: projectType === "featured",
//   });

//   const basicRef = useRef();
//   const heroRef = useRef();
//   const bhkRef = useRef();
//   const amenitiesRef = useRef();
//   const galleryRef = useRef();
//   const aboutRef = useRef();
//   const locationRef = useRef();
//   const propertyProfilesRef = useRef();
//   const seoRef = useRef();

//   const updatePayload = (patch) => {
//     console.log("🔵 updatePayload:", patch);
//     setPayload((p) => ({ ...p, ...patch }));
//   };

//   const replacePayload = (key, value) => {
//     console.log(`🟡 replacePayload: ${key}`, value);
//     setPayload((p) => ({ ...p, [key]: value }));
//   };

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const user = await fetchLoggedInUser();
//         if (!user) return;
//         setPayload((prev) => ({ ...prev, createdBy: user.id ?? user._id ?? "" }));
//       } catch (err) { console.warn("User load failed", err); }
//     }
//     loadUser();
//   }, []);

//   async function handleSubmit() {
//     try {
//       setSaving(true);
//       setProgress(10);
//       const clean = { ...payload };
//       clean.isFeatured = projectType === "featured";

//       if (clean.location?.placeName) delete clean.location.placeName;
//       clean.location = {
//         type: "Point",
//         coordinates: [
//           Number(clean.location.coordinates?.[0] || 0),
//           Number(clean.location.coordinates?.[1] || 0),
//         ],
//       };

//       clean.nearbyPlaces = (clean.nearbyPlaces || [])
//         .filter((p) => p.name?.trim() && p.type?.trim())
//         .map((p) => ({
//           name: p.name, type: p.type,
//           coordinates: [Number(p.coordinates?.[0] || 0), Number(p.coordinates?.[1] || 0)],
//         }));

//       clean.bhkSummary?.forEach((b, bi) => {
//         b.units?.forEach((u, ui) => {
//           console.log(`BHK ${bi} UNIT ${ui}`, { hasPlanFile: u.planFile instanceof File, planFileName: u.planFileName });
//         });
//       });

//       clean.sqftRange = { min: Number(clean.sqftRange.min || 0), max: Number(clean.sqftRange.max || 0) };
//       clean.gallerySummary = (clean.gallerySummary || []).map((g) => { const e = { ...g }; if (!e.url) delete e.url; return e; });
//       if (clean.aboutSummary?.[0] && !clean.aboutSummary[0].url) delete clean.aboutSummary[0].url;
//       if (!clean.mapEmbedUrl?.trim()) delete clean.mapEmbedUrl;

//       console.log("📦 FINAL PAYLOAD:", clean);
//       const formData = buildFormData(clean);
//       const res = await createFeaturedProperty(formData, (p) => setProgress(p));
//       toast.success("Featured Property created!");
//       const newId = res?.data?._id ?? res?._id;
//       navigate(newId ? `/post-property/${newId}` : "/featured-properties");
//     } catch (err) {
//       console.error("❌ Create Error:", err);
//       toast.error("Failed: " + err?.message);
//     } finally {
//       setSaving(false);
//     }
//   }

//   const handleNext = () => {
//     const stepId = ALL_STEPS[current]?.id;
//     if (stepId === "basic" && !basicRef.current?.validate()) return;
//     if (stepId === "hero" && !heroRef.current?.validate()) return;
//     if (stepId === "bhk" && !bhkRef.current?.validate()) return;
//     if (stepId === "amenities" && !amenitiesRef.current?.validate()) return;
//     if (stepId === "gallery" && !galleryRef.current?.validate()) return;
//     if (stepId === "about" && !aboutRef.current?.validate()) return;
//     if (stepId === "location" && !locationRef.current?.validate()) return;
//     if (stepId === "propertyProfiles" && !propertyProfilesRef.current?.validate()) return;
//     if (stepId === "seo") {
//       const ok = seoRef.current?.validate();
//       setIsSeoValid(ok);
//       if (!ok) return;
//     }
//     setCurrent((i) => Math.min(i + 1, ALL_STEPS.length - 1));
//   };

//   const StepComponent = {
//     basic: <BasicStep ref={basicRef} payload={payload} update={updatePayload} />,
//     hero: <HeroStep ref={heroRef} payload={payload} update={updatePayload} replace={replacePayload} />,
//     bhk: <BHKStep ref={bhkRef} payload={payload} update={updatePayload} replace={replacePayload} />,
//     amenities: <AmenitiesStep ref={amenitiesRef} payload={payload} update={updatePayload} />,
//     gallery: <GalleryStep ref={galleryRef} payload={payload} update={updatePayload} />,
//     about: <AboutStep ref={aboutRef} payload={payload} update={updatePayload} />,
//     location: <LocationStep ref={locationRef} payload={payload} update={updatePayload} />,
//     propertyProfiles: <PropertyProfilesStep ref={propertyProfilesRef} payload={payload} update={updatePayload} />,
//     seo: <SEOStep ref={seoRef} payload={payload} update={updatePayload} />,
//   }[ALL_STEPS[current].id];

//   const isLastStep = current === ALL_STEPS.length - 1 && isSeoValid;
//   const progressPct = Math.round((current / (ALL_STEPS.length - 1)) * 100);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* ── Topbar ── */}
//       <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl flex items-center justify-center"
//               style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}>
//               <Building2 size={18} className="text-white" strokeWidth={2.5} />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold text-[#27AE60] leading-none">Create Featured Project</h1>
//             </div>
//           </div>
//           {/* Progress */}
//           <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs ml-auto">
//             <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
//               <div
//                 className="h-full rounded-full transition-all duration-500"
//                 style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#27AE60,#2ecc71)" }}
//               />
//             </div>
//             <span className="text-xs font-black text-gray-500 shrink-0">{progressPct}%</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5 ">
//         {/* Stepper */}
//         <Stepper steps={ALL_STEPS} current={current} onClickStep={setCurrent} />

//         {/* Step header card */}
//         <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
//           <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
//             style={{ background: "linear-gradient(135deg,#f0fdf6,#dcfce7)", border: "1.5px solid #bbf7d0" }}>
//             {STEP_META[current].icon}
//           </div>
//           <div>
//             <p className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
//               Step {current + 1} of {ALL_STEPS.length}
//             </p>
//             <h2 className="text-lg font-black text-gray-900">{ALL_STEPS[current].title}</h2>
//             <p className="text-xs text-gray-500 mt-0.5">{STEP_META[current].desc}</p>
//           </div>
//         </div>

//         {/* Main form card */}
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           {/* Green accent line */}
//           <div className="h-1" style={{ background: "linear-gradient(90deg,#27AE60,#2ecc71,transparent)" }} />

//           <div className="p-6 md:p-8">
//             {StepComponent}
//           </div>

//           {/* Footer */}
//           <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
//             <button
//               type="button"
//               onClick={() => setCurrent((i) => i - 1)}
//               disabled={current === 0}
//               className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600
//                 text-sm font-bold hover:border-gray-300 hover:bg-white transition-all
//                 disabled:opacity-30 disabled:cursor-not-allowed"
//             >
//               <ArrowLeft size={15} />
//               Back
//             </button>

//             {/* Dot indicators */}
//             <div className="flex items-center gap-1.5">
//               {ALL_STEPS.map((_, i) => (
//                 <button key={i} onClick={() => onClickStep?.(i)}
//                   className="transition-all duration-300 rounded-full"
//                   style={{
//                     width: i === current ? 20 : 8,
//                     height: 8,
//                     background: i < current ? "#27AE60" : i === current ? "#27AE60" : "#e5e7eb",
//                     opacity: i < current ? 0.5 : 1,
//                   }}
//                 />
//               ))}
//             </div>

//             {isLastStep ? (
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={saving}
//                 className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black
//                   transition-all disabled:opacity-60 shadow-lg"
//                 style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)", boxShadow: "0 4px 14px rgba(39,174,96,0.35)" }}
//               >
//                 {saving
//                   ? <><Loader2 size={16} className="animate-spin" /> Saving… {progress}%</>
//                   : <><Sparkles size={16} /> Publish Property</>}
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={handleNext}
//                 className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black
//                   transition-all hover:opacity-90 shadow-lg"
//                 style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)", boxShadow: "0 4px 14px rgba(39,174,96,0.3)" }}
//               >
//                 Next
//                 <ArrowRight size={15} />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// frontend/admin-dashboard/src/pages/post-property/CreateFeaturedWizard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stepper from "./featured-create/Stepper";
import BasicStep from "./featured-create/steps/BasicStep";
import HeroStep from "./featured-create/steps/HeroStep";
import BHKStep from "./featured-create/steps/BHKStep";
import AmenitiesStep from "./featured-create/steps/AmenitiesStep";
import GalleryStep from "./featured-create/steps/GalleryStep";
import AboutStep from "./featured-create/steps/AboutStep";
import LocationStep from "./featured-create/steps/LocationStep";
import PropertyProfilesStep from "./featured-create/steps/PropertyProfilesStep";
import SEOStep from "./featured-create/steps/SEOStep";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import { createFeaturedProperty } from "../../services/PostAPropertyService";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Building2, ChevronDown } from "lucide-react";

function buildFormData(payload) {
  const fd = new FormData();
  const bhkPlanFiles = [];

  const bhkSummary = (payload.bhkSummary || []).map((b) => ({
    bhk: Number(b.bhk || 0),
    bhkLabel: b.bhkLabel,
    units: (b.units || []).map((u) => {
      if (u.planFile instanceof File) {
        bhkPlanFiles.push(u.planFile);
        return {
          minSqft: Number(u.minSqft || 0),
          maxPrice: Number(u.maxPrice || 0),
          availableCount: Number(u.availableCount || 0),
          planFileName: u.planFile.name,
        };
      }
      return {
        minSqft: Number(u.minSqft || 0),
        maxPrice: Number(u.maxPrice || 0),
        availableCount: Number(u.availableCount || 0),
        planFileName: u.planFileName || undefined,
      };
    }),
  }));

  if (!payload.title?.trim() || !payload.address?.trim()) {
    throw new Error("Title and Address are required");
  }

  fd.append("title", payload.title);
  fd.append("address", payload.address);

  ["heroTagline","heroSubTagline","heroDescription","city","state","locality",
    "currency","color","metaTitle","metaDescription","metaKeywords","possessionDate",
    "reraNumber","createdBy","status","mapEmbedUrl","redirectUrl",
  ].forEach((key) => { if (payload[key]) fd.append(key, payload[key]); });

  fd.append("isFeatured", payload.isFeatured ? "true" : "false");

  if (payload.sqftRange) {
    fd.append("sqftRange", JSON.stringify({
      min: Number(payload.sqftRange.min || 0),
      max: Number(payload.sqftRange.max || 0),
    }));
  }

  fd.append("bhkSummary", JSON.stringify(bhkSummary));
  if (payload.amenities?.length) fd.append("amenities", JSON.stringify(payload.amenities));
  if (payload.specifications?.length) fd.append("specifications", JSON.stringify(payload.specifications));
  if (payload.nearbyPlaces?.length) fd.append("nearbyPlaces", JSON.stringify(payload.nearbyPlaces));
  if (payload.banksApproved?.length) fd.append("banksApproved", JSON.stringify(payload.banksApproved));
  if (payload.gallerySummary?.length) fd.append("gallerySummary", JSON.stringify(payload.gallerySummary));
  if (payload.aboutSummary?.length) fd.append("aboutSummary", JSON.stringify(payload.aboutSummary));
  if (payload.leads?.length) fd.append("leads", JSON.stringify(payload.leads));
  if (payload.relatedProjects?.length) fd.append("relatedProjects", JSON.stringify(payload.relatedProjects));

  if (payload.location?.coordinates) {
    fd.append("location", JSON.stringify({
      type: "Point",
      coordinates: [
        Number(payload.location.coordinates[0]),
        Number(payload.location.coordinates[1]),
      ],
    }));
  }

  if (payload.heroImage instanceof File) fd.append("heroImage", payload.heroImage);
  if (payload.aboutImage instanceof File) fd.append("aboutImage", payload.aboutImage);
  if (payload.brochure instanceof File) fd.append("brochure", payload.brochure);
  if (Array.isArray(payload.galleryFiles)) {
    payload.galleryFiles.forEach((f) => { if (f instanceof File) fd.append("galleryFiles", f); });
  }
  bhkPlanFiles.forEach((file) => fd.append("bhkPlanFiles", file));
  if (payload.logo instanceof File) fd.append("logo", payload.logo);

  if (payload.youtubeVideos?.length) {
    fd.append("youtubeVideos", JSON.stringify(payload.youtubeVideos));
  }

  console.log("📦 FINAL FORMDATA:");
  for (const pair of fd.entries()) console.log(pair[0], pair[1]);
  return fd;
}

const ALL_STEPS = [
  { id: "basic", title: "Basic" },
  { id: "hero", title: "Hero" },
  { id: "bhk", title: "BHK" },
  { id: "amenities", title: "Amenities" },
  { id: "gallery", title: "Gallery" },
  { id: "about", title: "About" },
  { id: "location", title: "Location" },
  { id: "propertyProfiles", title: "Profiles" },
  { id: "seo", title: "SEO" },
];

const STEP_META = [
  { icon: "🏷️", desc: "Property name, address & location basics" },
  { icon: "🖼️", desc: "Hero banner, tagline & branding" },
  { icon: "🏠", desc: "BHK types, sizes & pricing" },
  { icon: "✨", desc: "Features, specs & lead info" },
  { icon: "📸", desc: "Property gallery images" },
  { icon: "📝", desc: "About section content & image" },
  { icon: "📍", desc: "Map coordinates & nearby places" },
  { icon: "📊", desc: "Towers, RERA, banks & documents" },
  { icon: "🔍", desc: "Meta title, description & keywords" },
];

const INITIAL_PAYLOAD = {
  title: "",
  logo: "",
  description: "",
  heroImage: null,
  heroTagline: "",
  heroSubTagline: "",
  heroDescription: "",
  color: "",
  createdBy: "",
  mapEmbedUrl: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  address: "",
  city: "",
  location: { type: "Point", coordinates: ["", ""] },
  state: "",
  locality: "",
  currency: "INR",
  status: "active",
  isFeatured: true,
  sqftRange: { min: "", max: "" },
  possessionDate: "",
  totalTowers: "",
  totalFloors: "",
  projectArea: "",
  totalUnits: "",
  availableUnits: "",
  reraNumber: "",
  banksApproved: [],
  brochure: null,
  specifications: [],
  gallerySummary: [],
  galleryFiles: [],
  aboutSummary: [],
  aboutImage: null,
  bhkSummary: [],
  amenities: [],
  nearbyPlaces: [],
  leads: [],
  relatedProjects: [],
  youtubeVideos: [],
};

export default function CreateFeaturedWizard() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeoValid, setIsSeoValid] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false); // mobile stepper toggle
  const location = useLocation();
  const projectType = location.state?.type || "featured";

  const [payload, setPayload] = useState({
    ...INITIAL_PAYLOAD,
    isFeatured: projectType === "featured",
  });

  const basicRef = useRef();
  const heroRef = useRef();
  const bhkRef = useRef();
  const amenitiesRef = useRef();
  const galleryRef = useRef();
  const aboutRef = useRef();
  const locationRef = useRef();
  const propertyProfilesRef = useRef();
  const seoRef = useRef();

  const updatePayload = (patch) => {
    console.log("🔵 updatePayload:", patch);
    setPayload((p) => ({ ...p, ...patch }));
  };

  const replacePayload = (key, value) => {
    console.log(`🟡 replacePayload: ${key}`, value);
    setPayload((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchLoggedInUser();
        if (!user) return;
        setPayload((prev) => ({ ...prev, createdBy: user.id ?? user._id ?? "" }));
      } catch (err) { console.warn("User load failed", err); }
    }
    loadUser();
  }, []);

  // Close mobile stepper when step changes
  useEffect(() => {
    setStepperOpen(false);
  }, [current]);

  async function handleSubmit() {
    try {
      setSaving(true);
      setProgress(10);
      const clean = { ...payload };
      clean.isFeatured = projectType === "featured";

      if (clean.location?.placeName) delete clean.location.placeName;
      clean.location = {
        type: "Point",
        coordinates: [
          Number(clean.location.coordinates?.[0] || 0),
          Number(clean.location.coordinates?.[1] || 0),
        ],
      };

      clean.nearbyPlaces = (clean.nearbyPlaces || [])
        .filter((p) => p.name?.trim() && p.type?.trim())
        .map((p) => ({
          name: p.name, type: p.type,
          coordinates: [Number(p.coordinates?.[0] || 0), Number(p.coordinates?.[1] || 0)],
        }));

      clean.sqftRange = { min: Number(clean.sqftRange.min || 0), max: Number(clean.sqftRange.max || 0) };
      clean.gallerySummary = (clean.gallerySummary || []).map((g) => { const e = { ...g }; if (!e.url) delete e.url; return e; });
      if (clean.aboutSummary?.[0] && !clean.aboutSummary[0].url) delete clean.aboutSummary[0].url;
      if (!clean.mapEmbedUrl?.trim()) delete clean.mapEmbedUrl;

      const formData = buildFormData(clean);
      const res = await createFeaturedProperty(formData, (p) => setProgress(p));
      toast.success("Featured Property created!");
      const newId = res?.data?._id ?? res?._id;
      navigate(newId ? `/post-property/${newId}` : "/featured-properties");
    } catch (err) {
      console.error("❌ Create Error:", err);
      toast.error("Failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  }

  const handleNext = () => {
    const stepId = ALL_STEPS[current]?.id;
    if (stepId === "basic" && !basicRef.current?.validate()) return;
    if (stepId === "hero" && !heroRef.current?.validate()) return;
    if (stepId === "bhk" && !bhkRef.current?.validate()) return;
    if (stepId === "amenities" && !amenitiesRef.current?.validate()) return;
    if (stepId === "gallery" && !galleryRef.current?.validate()) return;
    if (stepId === "about" && !aboutRef.current?.validate()) return;
    if (stepId === "location" && !locationRef.current?.validate()) return;
    if (stepId === "propertyProfiles" && !propertyProfilesRef.current?.validate()) return;
    if (stepId === "seo") {
      const ok = seoRef.current?.validate();
      setIsSeoValid(ok);
      if (!ok) return;
    }
    setCurrent((i) => Math.min(i + 1, ALL_STEPS.length - 1));
  };

  const StepComponent = {
    basic: <BasicStep ref={basicRef} payload={payload} update={updatePayload} />,
    hero: <HeroStep ref={heroRef} payload={payload} update={updatePayload} replace={replacePayload} />,
    bhk: <BHKStep ref={bhkRef} payload={payload} update={updatePayload} replace={replacePayload} />,
    amenities: <AmenitiesStep ref={amenitiesRef} payload={payload} update={updatePayload} />,
    gallery: <GalleryStep ref={galleryRef} payload={payload} update={updatePayload} />,
    about: <AboutStep ref={aboutRef} payload={payload} update={updatePayload} />,
    location: <LocationStep ref={locationRef} payload={payload} update={updatePayload} />,
    propertyProfiles: <PropertyProfilesStep ref={propertyProfilesRef} payload={payload} update={updatePayload} />,
    seo: <SEOStep ref={seoRef} payload={payload} update={updatePayload} />,
  }[ALL_STEPS[current].id];

  const isLastStep = current === ALL_STEPS.length - 1 && isSeoValid;
  const progressPct = Math.round((current / (ALL_STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Topbar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">

          {/* Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              <Building2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-[#27AE60] leading-none whitespace-nowrap">
                Create Featured Project
              </h1>
              {/* Mobile step indicator in topbar */}
              <p className="text-[10px] text-gray-400 mt-0.5 sm:hidden">
                Step {current + 1} of {ALL_STEPS.length} · {ALL_STEPS[current].title}
              </p>
            </div>
          </div>

          {/* Progress bar — hidden on mobile, shown md+ */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs ml-auto">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#27AE60,#2ecc71)",
                }}
              />
            </div>
            <span className="text-xs font-black text-gray-500 shrink-0">{progressPct}%</span>
          </div>

          {/* Mobile progress pill */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: "#27AE60" }}
              />
            </div>
            <span className="text-[10px] font-black text-gray-400">{progressPct}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── Desktop Stepper (md+) ── */}
        <div className="hidden md:block">
          <Stepper steps={ALL_STEPS} current={current} onClickStep={setCurrent} />
        </div>

        {/* ── Mobile Stepper (collapsible) ── */}
        <div className="md:hidden">
          <button
            onClick={() => setStepperOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{STEP_META[current].icon}</span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                  Step {current + 1} of {ALL_STEPS.length}
                </p>
                <p className="text-xs font-bold text-gray-700">{ALL_STEPS[current].title}</p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${stepperOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown stepper on mobile */}
          {stepperOpen && (
            <div className="mt-1 bg-white rounded-xl border border-gray-200 shadow-md p-3 overflow-x-auto">
              <Stepper steps={ALL_STEPS} current={current} onClickStep={setCurrent} />
            </div>
          )}
        </div>

        {/* ── Step Header Card ── */}
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
            style={{ background: "linear-gradient(135deg,#f0fdf6,#dcfce7)", border: "1.5px solid #bbf7d0" }}
          >
            {STEP_META[current].icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
              Step {current + 1} of {ALL_STEPS.length}
            </p>
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
              {ALL_STEPS[current].title}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
              {STEP_META[current].desc}
            </p>
          </div>
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Green accent line */}
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg,#27AE60,#2ecc71,transparent)" }}
          />

          {/* Form content */}
          <div className="p-4 sm:p-6 md:p-8">
            {StepComponent}
          </div>

          {/* ── Footer Navigation ── */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">

            {/* Mobile: stack nav buttons full width, dots in between */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">

              {/* Back button */}
              <button
                type="button"
                onClick={() => setCurrent((i) => i - 1)}
                disabled={current === 0}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200
                  text-gray-600 text-xs sm:text-sm font-bold hover:border-gray-300 hover:bg-white
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <ArrowLeft size={14} />
                <span className="hidden xs:inline">Back</span>
              </button>

              {/* Dot indicators — hidden on very small, shown sm+ */}
              <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                {ALL_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === current ? 18 : 7,
                      height: 7,
                      background: i < current ? "#27AE60" : i === current ? "#27AE60" : "#e5e7eb",
                      opacity: i < current ? 0.5 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Mobile: compact step counter instead of dots */}
              <span className="sm:hidden text-[11px] font-black text-gray-400">
                {current + 1} / {ALL_STEPS.length}
              </span>

              {/* Next / Publish button */}
              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                    text-white text-xs sm:text-sm font-black transition-all disabled:opacity-60 shadow-lg shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#27AE60,#1e8449)",
                    boxShadow: "0 4px 14px rgba(39,174,96,0.35)",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="hidden xs:inline">Saving… {progress}%</span>
                      <span className="xs:hidden">{progress}%</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span className="hidden xs:inline">Publish Property</span>
                      <span className="xs:hidden">Publish</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                    text-white text-xs sm:text-sm font-black transition-all hover:opacity-90 shadow-lg shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#27AE60,#1e8449)",
                    boxShadow: "0 4px 14px rgba(39,174,96,0.3)",
                  }}
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

