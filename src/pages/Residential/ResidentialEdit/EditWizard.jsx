// // EditWizard.jsx — FIXED VERSION with proper amenities saving
// import { useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "sonner";
// import debounce from "lodash/debounce";
// import { ChevronLeft, LayoutList, MapPin, SlidersHorizontal, ShieldCheck, Wifi } from "lucide-react";
// import CompletionHeader from "./components/editable/CompletionHeader";
// import { actions } from "../../../store/newIndex";
// import { savePropertyData } from "../../../store/common/propertyThunks";
// import StepBasicDetails from "./steps/StepBasicDetails";
// import StepLocationDetails from "./steps/StepLocationDetails";
// import StepPropertyDetails from "./steps/StepPropertyDetails";
// import StepVerifyPublish from "./steps/StepVerifyPublish";
// import { getPropertyById } from "../../../services/Common/AllPropertyServices";
// import { setActiveCategory } from "../../../store/Ui/uiSlice";

// const cleanData = (obj) => {
//   // ✅ Handle File
//   if (obj instanceof File) return obj;

//   // ✅ Handle FileList
//   if (obj instanceof FileList) return Array.from(obj);

//   // ✅ Handle Date
//   if (obj instanceof Date) return obj;

//   // ✅ Handle Array
//   if (Array.isArray(obj)) {
//     return obj
//       .map(cleanData)
//       .filter(
//         (v) =>
//           v !== undefined &&
//           v !== null &&
//           !(
//             typeof v === "object" &&
//             !(v instanceof File) &&
//             Object.keys(v).length === 0
//           ),
//       );
//   }

//   // ✅ Handle Object
//   if (obj && typeof obj === "object") {
//     const cleaned = {};

//     Object.keys(obj).forEach((key) => {
//       let value = obj[key];

//       // 🔥 Fix createdBy
//       if (key === "createdBy" && typeof value === "object") {
//         value = value?._id;
//       }

//       const cleanedValue = cleanData(value);

//       if (
//         cleanedValue !== "" &&
//         cleanedValue !== undefined &&
//         cleanedValue !== null &&
//         !(
//           typeof cleanedValue === "object" &&
//           !(cleanedValue instanceof File) &&
//           !(cleanedValue instanceof Date) &&
//           Object.keys(cleanedValue).length === 0
//         )
//       ) {
//         cleaned[key] = cleanedValue;
//       }
//     });

//     return cleaned;
//   }

//   return obj;
// };

// export default function EditWizard() {
//   const { id } = useParams();

//   const storedId = localStorage.getItem("editPropertyId");
//   const storedCategory = localStorage.getItem("editPropertyCategory");

 

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const category = useSelector((s) => s.ui.activeCategory) || storedCategory;
  
 
//   const propertyId = id || storedId; 

//   useEffect(() => {
//     if (storedCategory) {
//       dispatch(setActiveCategory(storedCategory));
//     }
//   }, [storedCategory, dispatch]);


//    useEffect(() => {
//      if (!category && storedCategory) {
//        dispatch(setActiveCategory(storedCategory));
//      }
//    }, [category, storedCategory, dispatch]);
//   const { form: current, loading } = useSelector((s) => s[category] || {});

// useEffect(() => {
//   if (!category || !propertyId) return;

  

//   const fetchData = async () => {
//     try {
//       const res = await getPropertyById(category, propertyId);

//       const property = res?.data;

      

//       if (!property) return;

//       dispatch(
//         actions[category].hydrateForm({
//           ...property,
//           galleryFiles: property.galleryFiles || [],
//           amenities: property.amenities || [],
//         }),
//       );
//     } catch (err) {
//       console.error("❌ FETCH ERROR:", err);
//     }
//   };

//   fetchData();
// }, [category, propertyId]);

 



//   const debouncedAutoSave = useMemo(
//     () =>
//       debounce(async (stepName) => {
        
//         try {
//           const payload = cleanData(current);
          
//           await dispatch(savePropertyData({ category, id: propertyId, step: stepName ,data:payload})).unwrap();
          
//         } catch (err) {
//           console.error("❌ Autosave failed:", err);
//         }
//       }, 1500),
//     [id, category, dispatch, current],
//   );

  

//  const handleFieldUpdate = (field, value, stepName) => {
//    if (!category || !actions[category]) {
//      console.error("❌ Category not ready:", category);
//      toast.error("Category not ready");
//      return;
//    }

//    dispatch(
//      actions[category].updateField({
//        key: field,
//        value: value,
//      }),
//    );

//    debouncedAutoSave(stepName);
//  };

  

//   const handleUploadDocument = async (files) => {
//     // update Redux
//     dispatch(actions[category].setDocumentsFiles(files));

//     // ✅ use latest data manually
//     const payload = cleanData({
//       ...current,
//       documentsFiles: files, // 🔥 FORCE latest files
//     });

//     await dispatch(
//       savePropertyData({
//         category,
//         id: propertyId,
//         step: "verification",
//         data: payload,
//       }),
//     ).unwrap();

//     toast.success("Documents uploaded");

//   };

//   const handleVerifyDocument = (index, status) => {
//     const serverDocs = [...(current.verificationDocuments || [])];
//     const localDocs = [...(current.documentsFiles || [])];

//     if (index < serverDocs.length) {
//       serverDocs[index] = { ...serverDocs[index], status };
//     } else {
//       const li = index - serverDocs.length;
//       if (localDocs[li]) {
//         localDocs[li] = { ...localDocs[li], status };
//       }
//     }

//     // update Redux
//     dispatch(actions[category].setDocumentsFiles(localDocs));

//     // ✅ FIX: use updated data
//     const payload = cleanData({
//       ...current,
//       documentsFiles: localDocs,
//       verificationDocuments: serverDocs,
//     });

//     dispatch(
//       savePropertyData({
//         category,
//         id: propertyId,
//         step: "verification",
//         data: payload,
//       }),
//     );
//   };
  
//   const handleStepSave = async (stepName) => {
//     const tid = toast.loading(`Saving ${stepName}...`);
//     try {
//       const payload = cleanData(current);
//       await dispatch(savePropertyData({ category, id, step: stepName, data: payload })).unwrap();
//       toast.success("Saved to cloud!", { id: tid });
//     } catch {
//       toast.error("Sync failed", { id: tid });
//     }
//   };

//   const handleSubmit = async () => {
//     const tid = toast.loading("Publishing...");
//     try {
//       const payload = cleanData(current);
//       await dispatch(savePropertyData({ category, id, step: "verification", data: payload })).unwrap();
//       toast.success("Property is Live!", { id: tid });
//       navigate(`/${category}`);
//     } catch (err) {
//       toast.error(err.message || "Failed to publish", { id: tid });
//     }
//   };


//   if (!category || !propertyId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] flex flex-col items-center justify-center gap-6 px-4">
//         <div className="flex flex-col items-center gap-5">
//           <div className="relative w-20 h-20">
//             <div className="absolute inset-0 rounded-3xl bg-[#27AE60]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
//             <div className="relative w-20 h-20 rounded-3xl bg-white shadow-2xl shadow-[#27AE60]/25 flex items-center justify-center border border-[#27AE60]/20">
//               <Wifi className="w-8 h-8 text-[#27AE60]" />
//             </div>
//           </div>
//           <div className="text-center space-y-1">
//             <p className="text-slate-800 font-black text-lg">Loading secure environment</p>
//             <p className="text-slate-400 text-sm">Fetching property data...</p>
//           </div>
//         </div>
//         <button
//           onClick={() => navigate(`/${category}`)}
//           className="px-8 py-3.5 bg-[#27AE60] text-white text-sm font-black rounded-2xl hover:bg-[#219653] transition-all active:scale-95 shadow-xl shadow-[#27AE60]/30"
//         >
//           ← Return to Dashboard
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background:
//           "linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #f8fffe 100%)",
//       }}
//     >
//       {/* HEADER */}
//       <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#27AE60]/12 shadow-sm">
//         <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 max-sm">
//           <div className="h-16 flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3 min-w-0">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#27AE60]/10 text-slate-500 hover:text-[#27AE60] transition-all border border-transparent hover:border-[#27AE60]/20"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <div className="w-px h-6 bg-slate-100 shrink-0 hidden sm:block" />
//               <div className="min-w-0">
//                 <div className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] hidden sm:inline-block" />
//                   <h1 className="text-sm  text-[#000000] truncate">
//                     Edit {category.charAt(0).toUpperCase() + category.slice(1)}
//                     <span className="text-[blue] font-normal text-xs ml-1.5 hidden sm:inline">
//                       #{id?.slice(-6)}
//                     </span>
//                   </h1>
//                 </div>
//                 <p className="text-[12px] text-[#27AE60] uppercase truncate hidden sm:block mt-0.5">
//                   {current.title || "Draft Property"}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2.5 shrink-0">
//               {loading && (
//                 <div className="hidden sm:flex items-center gap-2 bg-[#27AE60]/8 border border-[#27AE60]/15 px-3.5 py-1.5 rounded-full">
//                   <div
//                     className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce"
//                     style={{ animationDelay: "0ms" }}
//                   />
//                   <div
//                     className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce"
//                     style={{ animationDelay: "150ms" }}
//                   />
//                   <span className="text-[10px] text-[#27AE60] font-black uppercase tracking-widest ml-0.5">
//                     Saving
//                   </span>
//                 </div>
//               )}
//               <button
//                 onClick={() => navigate(`/${category}`)}
//                 className="text-xs font-bold text-slate-400 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
//               >
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-1 py-8 sm:py-12 space-y-8 sm:space-y-12 max-sm:w-[calc(100vw-32px)]">
//         <CompletionHeader completion={current?.completion?.percent || 0} />

//         <div className="space-y-8 sm:space-y-12">
//           <WizardSection
//             step="01"
//             title="Standard Information"
//             icon={<LayoutList className="w-4 h-4" />}
//             accentColor="#27AE60"
//           >
//             <StepBasicDetails
//               data={current}
//               onChange={(f, v) => handleFieldUpdate(f, v, "basic")}
//               onSave={() => handleStepSave("basic")}
//             />
//           </WizardSection>

//           <WizardSection
//             step="02"
//             title="Geographic Context"
//             icon={<MapPin className="w-4 h-4" />}
//             accentColor="#27AE60"
//           >
//             <StepLocationDetails
//               data={current}
//               onChange={(f, v) => handleFieldUpdate(f, v, "location")}
//               onSave={() => handleStepSave("location")}
//             />
//           </WizardSection>

//           <WizardSection
//             step="03"
//             title="Property Specifications"
//             icon={<SlidersHorizontal className="w-4 h-4" />}
//             accentColor="#27AE60"
//           >
//             <StepPropertyDetails
//               data={current}
//               onChange={(f, v) => handleFieldUpdate(f, v, "details")}
//               onSave={() => handleStepSave("details")}
//             />
//           </WizardSection>

//           <WizardSection
//             step="04"
//             title="Compliance & Publish"
//             icon={<ShieldCheck className="w-4 h-4" />}
//             accentColor="#27AE60"
//           >
//             <StepVerifyPublish
//               data={current}
//               onVerifyDocument={handleVerifyDocument}
//               onUploadDocument={handleUploadDocument}
//               onUpdateField={(f, v) => handleFieldUpdate(f, v, "verification")}
//               onSubmit={handleSubmit}
//             />
//           </WizardSection>
//         </div>
//         <div className="h-16" />
//       </main>
//     </div>
//   );
// }

// function WizardSection({ children, step, title, icon, accentColor }) {
//   return (
//     <section>
//       {/* Label row */}
//       <div className="flex items-center gap-1 mb-1">
//         <div
//           className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-2xl text-white text-[12px] font-bold uppercase tracking-wider shrink-0 shadow-lg"
//           style={{ background: accentColor, boxShadow: `0 6px 20px ${accentColor}35` }}
//         >
//           {icon}
//           <span className="hidden xs:inline sm:inline">{title}</span>
//         </div>
//         <span className="sm:hidden text-xs font-black text-slate-600 uppercase tracking-wide truncate">{title}</span>
//         <div className="h-px flex-1 bg-gradient-to-r from-green-900 to-transparent" />
//         <span className="text-[10px] font-black text-[#27AE60] shrink-0 tabular-nums">{step}/ 04</span>
//       </div>

//       {/* Panel */}
//       <div
//         className="bg-white rounded-3xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md"
//         style={{ border: `1.5px solid ${accentColor}18`, boxShadow: `0 2px 20px ${accentColor}08` }}
//       >
//         <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}60, ${accentColor}20, transparent)` }} />
//         <div className="p-5 sm:p-7 lg:p-9  max-sm:p-2">{children}</div>
//       </div>
//     </section>
//   );
// } 



// EditWizard.jsx — FIXED: handleUploadDocument now correctly passes verificationDocumentType
import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { ChevronLeft, LayoutList, MapPin, SlidersHorizontal, ShieldCheck, Wifi } from "lucide-react";
import CompletionHeader from "./components/editable/CompletionHeader";
import { actions } from "../../../store/newIndex";
import { savePropertyData } from "../../../store/common/propertyThunks";
import StepBasicDetails from "./steps/StepBasicDetails";
import StepLocationDetails from "./steps/StepLocationDetails";
import StepPropertyDetails from "./steps/StepPropertyDetails";
import StepVerifyPublish from "./steps/StepVerifyPublish";
import { getPropertyById } from "../../../services/Common/AllPropertyServices";
import { setActiveCategory } from "../../../store/Ui/uiSlice";

const cleanData = (obj) => {
  if (obj instanceof File) return obj;
  if (obj instanceof FileList) return Array.from(obj);
  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj
      .map(cleanData)
      .filter(
        (v) =>
          v !== undefined &&
          v !== null &&
          !(typeof v === "object" && !(v instanceof File) && Object.keys(v).length === 0),
      );
  }

  if (obj && typeof obj === "object") {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
      let value = obj[key];
      if (key === "createdBy" && typeof value === "object") {
        value = value?._id;
      }
      const cleanedValue = cleanData(value);
      if (
        cleanedValue !== "" &&
        cleanedValue !== undefined &&
        cleanedValue !== null &&
        !(
          typeof cleanedValue === "object" &&
          !(cleanedValue instanceof File) &&
          !(cleanedValue instanceof Date) &&
          Object.keys(cleanedValue).length === 0
        )
      ) {
        cleaned[key] = cleanedValue;
      }
    });
    return cleaned;
  }

  return obj;
};

export default function EditWizard() {
  const { id } = useParams();

  const storedId       = localStorage.getItem("editPropertyId");
  const storedCategory = localStorage.getItem("editPropertyCategory");

  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const category    = useSelector((s) => s.ui.activeCategory) || storedCategory;
  const propertyId  = id || storedId;

  useEffect(() => {
    if (storedCategory) dispatch(setActiveCategory(storedCategory));
  }, [storedCategory, dispatch]);

  useEffect(() => {
    if (!category && storedCategory) dispatch(setActiveCategory(storedCategory));
  }, [category, storedCategory, dispatch]);

  const { form: current, loading } = useSelector((s) => s[category] || {});

  useEffect(() => {
    if (!category || !propertyId) return;
    const fetchData = async () => {
      try {
        const res = await getPropertyById(category, propertyId);
        const property = res?.data;
        if (!property) return;
        dispatch(
          actions[category].hydrateForm({
            ...property,
            galleryFiles : property.galleryFiles || [],
            amenities    : property.amenities    || [],
          }),
        );
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      }
    };
    fetchData();
  }, [category, propertyId]);

  const debouncedAutoSave = useMemo(
    () =>
      debounce(async (stepName) => {
        try {
          const payload = cleanData(current);
          await dispatch(savePropertyData({ category, id: propertyId, step: stepName, data: payload })).unwrap();
        } catch (err) {
          console.error("❌ Autosave failed:", err);
        }
      }, 1500),
    [id, category, dispatch, current],
  );

  const handleFieldUpdate = (field, value, stepName) => {
    if (!category || !actions[category]) {
      console.error("❌ Category not ready:", category);
      toast.error("Category not ready");
      return;
    }
    dispatch(actions[category].updateField({ key: field, value }));
    debouncedAutoSave(stepName);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FIX: Build the payload here with EXPLICIT values instead of relying on
  // Redux state that may not have flushed yet.
  //
  // files = [{ file: File, docType: "ec"|"tax"|..., preview, source, status }]
  // ─────────────────────────────────────────────────────────────────────────
  const handleUploadDocument = async (files) => {
    if (!files?.length) return;

    // 1️⃣  Grab the docType from the first file (all files in one batch share
    //     the same type because the user picks ONE type then uploads)
    const docType = files[0]?.docType || current?.verificationDocumentType || "";

    // 2️⃣  Update Redux (non-blocking — we pass values explicitly below)
    dispatch(actions[category].setDocumentsFiles(files));
    dispatch(actions[category].updateField({ key: "verificationDocumentType", value: docType }));

    // 3️⃣  Build payload manually so we don't depend on Redux flush timing
    const mergedPayload = cleanData({
      ...current,
      verificationDocumentType : docType,   // ✅ EXPLICIT — not from stale Redux
      documentsFiles           : files,     // ✅ EXPLICIT — not from stale Redux
    });

    console.log("🔥 UPLOAD PAYLOAD verificationType:", docType);
    console.log("🔥 UPLOAD PAYLOAD files:", files);

    try {
      await dispatch(
        savePropertyData({
          category,
          id    : propertyId,
          step  : "verification",
          data  : mergedPayload,   // 🔥 pass explicit data, thunk uses this over Redux state
        }),
      ).unwrap();

      toast.success("Document saved successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error(err?.message || "Failed to save document");
    }
  };

  const handleVerifyDocument = (index, status) => {
    const serverDocs = [...(current.verificationDocuments || [])];
    const localDocs  = [...(current.documentsFiles        || [])];

    if (index < serverDocs.length) {
      serverDocs[index] = { ...serverDocs[index], status };
    } else {
      const li = index - serverDocs.length;
      if (localDocs[li]) localDocs[li] = { ...localDocs[li], status };
    }

    dispatch(actions[category].setDocumentsFiles(localDocs));

    const payload = cleanData({
      ...current,
      documentsFiles        : localDocs,
      verificationDocuments : serverDocs,
    });

    dispatch(savePropertyData({ category, id: propertyId, step: "verification", data: payload }));
  };

  const handleStepSave = async (stepName) => {
    const tid = toast.loading(`Saving ${stepName}...`);
    try {
      const payload = cleanData(current);
      await dispatch(savePropertyData({ category, id, step: stepName, data: payload })).unwrap();
      toast.success("Saved to cloud!", { id: tid });
    } catch {
      toast.error("Sync failed", { id: tid });
    }
  };

  const handleSubmit = async () => {
    const tid = toast.loading("Publishing...");
    try {
      const payload = cleanData(current);
      await dispatch(savePropertyData({ category, id, step: "verification", data: payload })).unwrap();
      toast.success("Property is Live!", { id: tid });
      navigate(`/${category}`);
    } catch (err) {
      toast.error(err.message || "Failed to publish", { id: tid });
    }
  };

  if (!category || !propertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-3xl bg-[#27AE60]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="relative w-20 h-20 rounded-3xl bg-white shadow-2xl shadow-[#27AE60]/25 flex items-center justify-center border border-[#27AE60]/20">
              <Wifi className="w-8 h-8 text-[#27AE60]" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-800 font-black text-lg">Loading secure environment</p>
            <p className="text-slate-400 text-sm">Fetching property data...</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/${category}`)}
          className="px-8 py-3.5 bg-[#27AE60] text-white text-sm font-black rounded-2xl hover:bg-[#219653] transition-all active:scale-95 shadow-xl shadow-[#27AE60]/30"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #f8fffe 100%)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#27AE60]/12 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 max-sm">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#27AE60]/10 text-slate-500 hover:text-[#27AE60] transition-all border border-transparent hover:border-[#27AE60]/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-100 shrink-0 hidden sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] hidden sm:inline-block" />
                  <h1 className="text-sm text-[#000000] truncate">
                    Edit {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span className="text-[blue] font-normal text-xs ml-1.5 hidden sm:inline">#{id?.slice(-6)}</span>
                  </h1>
                </div>
                <p className="text-[12px] text-[#27AE60] uppercase truncate hidden sm:block mt-0.5">
                  {current.title || "Draft Property"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {loading && (
                <div className="hidden sm:flex items-center gap-2 bg-[#27AE60]/8 border border-[#27AE60]/15 px-3.5 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="text-[10px] text-[#27AE60] font-black uppercase tracking-widest ml-0.5">Saving</span>
                </div>
              )}
              <button
                onClick={() => navigate(`/${category}`)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-1 py-8 sm:py-12 space-y-8 sm:space-y-12 max-sm:w-[calc(100vw-32px)]">
        <CompletionHeader completion={current?.completion?.percent || 0} />

        <div className="space-y-8 sm:space-y-12">
          <WizardSection step="01" title="Standard Information" icon={<LayoutList className="w-4 h-4" />} accentColor="#27AE60">
            <StepBasicDetails
              data={current}
              onChange={(f, v) => handleFieldUpdate(f, v, "basic")}
              onSave={() => handleStepSave("basic")}
            />
          </WizardSection>

          <WizardSection step="02" title="Geographic Context" icon={<MapPin className="w-4 h-4" />} accentColor="#27AE60">
            <StepLocationDetails
              data={current}
              onChange={(f, v) => handleFieldUpdate(f, v, "location")}
              onSave={() => handleStepSave("location")}
            />
          </WizardSection>

          <WizardSection step="03" title="Property Specifications" icon={<SlidersHorizontal className="w-4 h-4" />} accentColor="#27AE60">
            <StepPropertyDetails
              data={current}
              onChange={(f, v) => handleFieldUpdate(f, v, "details")}
              onSave={() => handleStepSave("details")}
            />
          </WizardSection>

          <WizardSection step="04" title="Compliance & Publish" icon={<ShieldCheck className="w-4 h-4" />} accentColor="#27AE60">
            <StepVerifyPublish
              data={current}
              onVerifyDocument={handleVerifyDocument}
              onUploadDocument={handleUploadDocument}
              onUpdateField={(f, v) => handleFieldUpdate(f, v, "verification")}
              onSubmit={handleSubmit}
            />
          </WizardSection>
        </div>
        <div className="h-16" />
      </main>
    </div>
  );
}

function WizardSection({ children, step, title, icon, accentColor }) {
  return (
    <section>
      <div className="flex items-center gap-1 mb-1">
        <div
          className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-2xl text-white text-[12px] font-bold uppercase tracking-wider shrink-0 shadow-lg"
          style={{ background: accentColor, boxShadow: `0 6px 20px ${accentColor}35` }}
        >
          {icon}
          <span className="hidden xs:inline sm:inline">{title}</span>
        </div>
        <span className="sm:hidden text-xs font-black text-slate-600 uppercase tracking-wide truncate">{title}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-green-900 to-transparent" />
        <span className="text-[10px] font-black text-[#27AE60] shrink-0 tabular-nums">{step}/ 04</span>
      </div>

      <div
        className="bg-white rounded-3xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md"
        style={{ border: `1.5px solid ${accentColor}18`, boxShadow: `0 2px 20px ${accentColor}08` }}
      >
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}60, ${accentColor}20, transparent)` }} />
        <div className="p-5 sm:p-7 lg:p-9 max-sm:p-2">{children}</div>
      </div>
    </section>
  );
}