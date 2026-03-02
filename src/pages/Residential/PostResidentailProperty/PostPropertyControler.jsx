//D:\propenu\frontend\admin-dashboard\src\pages\Residential\PostResidentailProperty\PostPropertyControler.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft,ChevronRight, CheckCircle2} from "lucide-react";
import { setActiveCategory } from "../../../store/Ui/uiSlice";
import { createPropertyDraft } from "../../../features/property/propertyService";
import { toast } from "sonner";

// Import Step Components
import Step1BasicDetails from "./Step1BasicDetails";
import Step2LocationDetails from "./Step2LocationDetails";
import MainContainer from "./Step3PropertyDetails/MainContainer";
import Step4VerifyPublish from "./Step4VerifyPublish";
import Whatup from "../../../assets/whatsuplogo.svg";
import { actions } from "../../../store/newIndex";
import { getPropertyById } from "../../../services/Common/AllPropertyServices";
import { apiClient } from "../../../api/apiClient";

const STEPS = [
  { label: "Basic Details", sub: "In progress" },
  { label: "Location Details", sub: "Pending" },
  { label: "Property Profile", sub: "Pending" },
  { label: "Verify & Publish", sub: "Pending" },
];

export default function PropertyController() {
  //const { id, category: urlCategory } = useParams();
  const { id } = useParams();
  //const [activeCategory, setActiveCategory] = useState("residential");

  const activeCategory = useSelector((state) => state.ui.activeCategory);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //const hasHydrated = useRef(false);
  const [step, setStep] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

 const [completedSteps, setCompletedSteps] = useState([]);

  const setStepFromDraft = (draft) => {
    const backendStep = draft?.completion?.step;

    if (!backendStep || backendStep < 1) {
      setStep(0);
      setCompletedSteps([]);
      return;
    }

    const frontendStep = backendStep - 1;

    setStep(frontendStep);

    setCompletedSteps(Array.from({ length: frontendStep }, (_, i) => i));
  };



  useEffect(() => {
    const storedCategory = localStorage.getItem("activeCategory");

    if (storedCategory && !activeCategory) {

      dispatch(setActiveCategory(storedCategory));
    }
  }, [activeCategory, dispatch]);


 

const isInitializing = useRef(false);

useEffect(() => {
  if (!activeCategory) return;
  if (isInitializing.current) return;

  isInitializing.current = true;

  const normalizeDraft = (draft) => ({
    ...draft,
    createdBy:
      typeof draft.createdBy === "object"
        ? draft.createdBy?._id
        : draft.createdBy || "",
  });

  const run = async () => {
    setIsFetching(true);
    setIsDataLoaded(false);

    try {
      if (id) {
        const response = await getPropertyById(activeCategory, id);
        const draft = response?.data;

        if (draft?._id) {
          dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));

          setStepFromDraft(draft);
          localStorage.setItem("propertyId", draft._id);
          setIsDataLoaded(true);
        }

        return;
      }

      const storedId = localStorage.getItem("propertyId");

      if (storedId) {
        try {
          const response = await getPropertyById(activeCategory, storedId);
          const draft = response?.data;

          if (draft?._id) {
            dispatch(
              actions[activeCategory].hydrateForm(normalizeDraft(draft)),
            );

            setStepFromDraft(draft);
            setIsDataLoaded(true);
            return;
          }
        } catch {
          localStorage.removeItem("propertyId");
        }
      }

      const response = await createPropertyDraft(activeCategory);
      const draft = response?.data?.data || response?.data;

      if (!draft?._id) throw new Error("Draft ID missing");

      dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));

      localStorage.setItem("propertyId", draft._id);

      setStep(0);
      setCompletedSteps([]);
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Initialization failed:", err);
      toast.error("Initialization failed");
      setIsDataLoaded(true);
    } finally {
      setIsFetching(false);
    }
  };

  run();
}, [activeCategory, id, dispatch]);



  const handleNext = useCallback(() => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });

    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);


  const handleBack = useCallback(() => {
    if (step === 0) navigate(-1);
    else {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, navigate]);

  const progressPercentage = (completedSteps.length / STEPS.length) * 100;

  if (isFetching || ( !isDataLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#27AE60]"></div>
      </div>
    );
  }

 

  return (
    <div className="relative  bottom-3  p-[5px] max-w-7xl max-h-[84vh] flex flex-col md:flex-row overflow-hidden bg-transparent w-[90%]  ">
      {/* 🟦 LEFT SIDEBAR */}
      <div className="w-full  md:w-[280px] h-[420px] m-[10px] p-4 flex flex-col rounded-md shadow-sm border border-[#EBECF0] bg-gradient-to-b from-[#E9F7EF] to-[#FFFFFF]  ">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-slate-400 text-xs mb-4 hover:text-slate-700 transition-all group"
        >
          <ChevronLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Go back
        </button>

        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-slate-900 mb-0.5 leading-tight">
            Post your property
          </h1>
          <p className="text-xs text-slate-500">Sell or rent your property</p>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#27AE60] transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 min-w-[24px]">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Vertical Stepper */}
        <div className="space-y-3 flex-1 mb-3 overflow-hidden">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-2.5 items-start relative">
              {/* Circle Indicator */}
              <div className="relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i === step
                      ? "bg-[#27AE60] shadow-md shadow-green-200"
                      : completedSteps.includes(i)
                        ? "bg-[#27AE60]"
                        : "bg-white border-2 border-slate-300"
                  }`}
                >
                  {completedSteps.includes(i) ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : i === step ? (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm font-semibold leading-tight mb-0.5 ${
                    i === step
                      ? "text-slate-900"
                      : completedSteps.includes(i)
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-[10px] ${
                    i === step ? "text-[#27AE60]" : "text-slate-400"
                  }`}
                >
                  {completedSteps.includes(i)
                    ? "Completed"
                    : i === step
                      ? "In progress"
                      : "Pending"}
                </p>
              </div>

              {/* Connector Line */}
              {i !== STEPS.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 w-[2px] h-6 ${
                    completedSteps.includes(i) ? "bg-[#27AE60]" : "bg-slate-300"
                  }`}
                  style={{ transform: "translateX(-1px)" }}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Help Box */}
        <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl  ">
          <p className="text-[12px] text-slate-600 leading-relaxed ">
            <span className="font-semibold">Need help?</span> Now you can
            directly
          </p>
          <div className="flex gap-4">
            <span className=" text-slate-600 font-weight text-[12px] leading-relaxed ">
              post property via
            </span>
            <button className="flex items-center gap-1 text-[#25D366] font-semibold text-[12px]  transition-all">
              <img src={Whatup} alt="whatsapp" className="w-4 h-4" />
              Whatsapp
              <span className="text-slate-400 ">
                <ChevronRight size={12} className="text-slate-400" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ⬜ RIGHT CONTENT AREA (The Form Workspace) */}
      <div className="flex-1 w-[1200px]  md:py-1 overflow-y-auto custom-scrollbar border-slate-500  from-slate-200 bg-none">
        <div className="max-w-4xl mx-auto">
          {/* Dynamic Components Based on Step */}
          {step === 0 && (
            <Step1BasicDetails
              category={activeCategory}
              setCategory={setActiveCategory}
              next={handleNext}
            />
          )}
          {step === 1 && (
            <Step2LocationDetails
              category={activeCategory}
              back={handleBack}
              next={handleNext}
            />
          )}
          {step === 2 && (
            <MainContainer
              category={activeCategory}
              back={handleBack}
              next={handleNext}
            />
          )}
          {step === 3 && (
            <Step4VerifyPublish
              category={activeCategory}
              back={handleBack}
              propertyId={id}
            />
          )}
        </div>
      </div>
    </div>
  );
}



///claud ai

//D:\propenu\frontend\admin-dashboard\src\pages\Residential\PostResidentailProperty\PostPropertyControler.jsx
// import { useEffect, useState, useCallback, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
// import { setActiveCategory } from "../../../store/Ui/uiSlice";
// import { createPropertyDraft } from "../../../features/property/propertyService";
// import { toast } from "sonner";
// import Step1BasicDetails from "./Step1BasicDetails";
// import Step2LocationDetails from "./Step2LocationDetails";
// import MainContainer from "./Step3PropertyDetails/MainContainer";
// import Step4VerifyPublish from "./Step4VerifyPublish";
// import Whatup from "../../../assets/whatsuplogo.svg";
// import { actions } from "../../../store/newIndex";
// import { getPropertyById } from "../../../services/Common/AllPropertyServices";

// const STEPS = [
//   { label: "Basic Details", icon: "01" },
//   { label: "Location", icon: "02" },
//   { label: "Property Profile", icon: "03" },
//   { label: "Verify & Publish", icon: "04" },
// ];

// export default function PropertyController() {
//   const { id } = useParams();
//   const activeCategory = useSelector((state) => state.ui.activeCategory);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [step, setStep] = useState(0);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);
//   const [completedSteps, setCompletedSteps] = useState([]);

//   const setStepFromDraft = (draft) => {
//     const backendStep = draft?.completion?.step;
//     if (!backendStep || backendStep < 1) { setStep(0); setCompletedSteps([]); return; }
//     const frontendStep = backendStep - 1;
//     setStep(frontendStep);
//     setCompletedSteps(Array.from({ length: frontendStep }, (_, i) => i));
//   };

//   useEffect(() => {
//     const storedCategory = localStorage.getItem("activeCategory");
//     if (storedCategory && !activeCategory) dispatch(setActiveCategory(storedCategory));
//   }, [activeCategory, dispatch]);

//   const isInitializing = useRef(false);

//   useEffect(() => {
//     if (!activeCategory || isInitializing.current) return;
//     isInitializing.current = true;

//     const normalizeDraft = (draft) => ({
//       ...draft,
//       createdBy: typeof draft.createdBy === "object" ? draft.createdBy?._id : draft.createdBy || "",
//     });

//     const run = async () => {
//       setIsFetching(true);
//       setIsDataLoaded(false);
//       try {
//         if (id) {
//           const response = await getPropertyById(activeCategory, id);
//           const draft = response?.data;
//           if (draft?._id) {
//             dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
//             setStepFromDraft(draft);
//             localStorage.setItem("propertyId", draft._id);
//             setIsDataLoaded(true);
//           }
//           return;
//         }
//         const storedId = localStorage.getItem("propertyId");
//         if (storedId) {
//           try {
//             const response = await getPropertyById(activeCategory, storedId);
//             const draft = response?.data;
//             if (draft?._id) {
//               dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
//               setStepFromDraft(draft);
//               setIsDataLoaded(true);
//               return;
//             }
//           } catch { localStorage.removeItem("propertyId"); }
//         }
//         const response = await createPropertyDraft(activeCategory);
//         const draft = response?.data?.data || response?.data;
//         if (!draft?._id) throw new Error("Draft ID missing");
//         dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
//         localStorage.setItem("propertyId", draft._id);
//         setStep(0); setCompletedSteps([]); setIsDataLoaded(true);
//       } catch (err) {
//         console.error("Initialization failed:", err);
//         toast.error("Initialization failed");
//         setIsDataLoaded(true);
//       } finally { setIsFetching(false); }
//     };
//     run();
//   }, [activeCategory, id, dispatch]);

//   const handleNext = useCallback(() => {
//     setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
//     setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [step]);

//   const handleBack = useCallback(() => {
//     if (step === 0) navigate(-1);
//     else { setStep((prev) => prev - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
//   }, [step, navigate]);

//   const progressPercentage = (completedSteps.length / STEPS.length) * 100;

//   if (isFetching || !isDataLoaded) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f0fdf4] to-white">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative w-16 h-16">
//             <div className="absolute inset-0 rounded-full border-4 border-[#dcfce7]" />
//             <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#27AE60] animate-spin" />
//             <div className="absolute inset-3 rounded-full bg-[#f0fdf4] flex items-center justify-center">
//               <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse" />
//             </div>
//           </div>
//           <p className="text-sm font-semibold text-[#27AE60] tracking-wide">Setting up your property...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-[#f8fffe]">
//       {/* ═══ SIDEBAR ═══ */}
//       <aside className="hidden lg:flex flex-col w-[400px] min-h-screen bg-[FFFFFF]  border-[#e6f4ec] sticky top-2  h-screen px-6 py-2 shadow-xl rounded-md">
//         <button
//           onClick={handleBack}
//           className="flex items-center gap-2 text-[#6b7280] text-xs font-semibold mb-1 group hover:text-[#27AE60] transition-colors w-fit"
//         >
//           <span className="w-5 h-5 rounded-lg bg-[#f0fdf4] flex items-center justify-center border border-[#dcfce7] group-hover:bg-[#dcfce7] transition-colors">
//             <ChevronLeft size={13} />
//           </span>
//           Go Back
//         </button>

//         <div className="mb-1">
//           {/* <p className="text-[10px] font-bold text-[#27AE60] uppercase tracking-[0.2em] mb-2">Propenu</p> */}
//           <h1 className="text-[22px] font-bold text-[#111827] leading-tight">Post Your Property</h1>
//           <p className="text-xs text-[#9ca3af] mt-1.5">Sell or rent your property</p>
//         </div>

//         {/* Progress bar */}
//         <div className="mb-3">
//           <div className="flex justify-between mb-2">
//             <span className="text-[11px] text-[#6b7280] font-medium">Overall Progress</span>
//             <span className="text-[11px] font-bold text-[#27AE60]">{Math.round(progressPercentage)}%</span>
//           </div>
//           <div className="h-2 bg-[#f0fdf4] rounded-full overflow-hidden border border-[#dcfce7]">
//             <div
//               className="h-full bg-gradient-to-r from-[#27AE60] to-[#4ade80] rounded-full transition-all duration-700 ease-out"
//               style={{ width: `${progressPercentage}%` }}
//             />
//           </div>
//         </div>

//         {/* Steps */}
//         <div className="flex-1 space-y-2">
//           {STEPS.map((s, i) => {
//             const isActive = i === step;
//             const isDone = completedSteps.includes(i);
//             return (
//               <div key={i} className="relative">
//                 <div className={`flex items-center gap-3 px-1 py-2 rounded-xl transition-all duration-200 cursor-default ${
//                   isActive ? "bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] shadow-sm" : ""
//                 }`}>
//                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs transition-all duration-300 ${
//                     isDone ? "bg-[#27AE60] text-white shadow-md shadow-green-200/60"
//                     : isActive ? "bg-[#27AE60] text-white shadow-lg shadow-green-300/50"
//                     : "bg-[#f9fafb] text-[#d1d5db] border border-[#f0f0f0]"
//                   }`}>
//                     {isDone ? <CheckCircle2 size={18} /> : s.icon}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className={`text-sm font-semibold leading-tight truncate ${
//                       isActive ? "text-[#111827]" : isDone ? "text-[#374151]" : "text-[#c9c9c9]"
//                     }`}>{s.label}</p>
//                     <p className={`text-[10px] mt-0.5 font-medium ${
//                       isActive ? "text-[#27AE60]" : isDone ? "text-[#86efac]" : "text-[#e5e7eb]"
//                     }`}>
//                       {isDone ? "✓ Completed" : isActive ? "In progress" : "Pending"}
//                     </p>
//                   </div>
//                 </div>
//                 {i < STEPS.length - 1 && (
//                   <div className={`absolute left-[31px] w-0.5 h-2 ${isDone ? "bg-[#86efac]" : "bg-[#f0f0f0]"}`} style={{ top: "calc(100% - 0px)" }} />
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Help box */}
//         <div className="mt-6 bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#d1fae5] rounded-2xl p-4">
//           <p className="text-[11px] text-[#374151] font-semibold mb-1">Need help posting?</p>
//           <p className="text-[10px] text-[#9ca3af] mb-3">Chat with us directly on WhatsApp</p>
//           <button className="flex items-center gap-1.5 text-[#25D366] font-bold text-xs group">
//             <img src={Whatup} alt="whatsapp" className="w-4 h-4" />
//             <span>Chat on WhatsApp</span>
//             <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
//           </button>
//         </div>
//       </aside>

//       {/* ═══ MOBILE HEADER ═══ */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#e6f4ec] px-4 py-3">
//         <div className="flex items-center justify-between mb-2">
//           <button onClick={handleBack} className="flex items-center gap-1.5 text-[#27AE60] text-sm font-semibold">
//             <ChevronLeft size={16} /> Back
//           </button>
//           <span className="text-xs text-[#6b7280] font-semibold">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</span>
//         </div>
//         <div className="h-1.5 bg-[#f0fdf4] rounded-full overflow-hidden">
//           <div
//             className="h-full bg-gradient-to-r from-[#27AE60] to-[#4ade80] rounded-full transition-all duration-500"
//             style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
//           />
//         </div>
//       </div>

//       {/* ═══ MAIN CONTENT ═══ */}
//       <main className="flex-1 overflow-y-auto lg:pt-0 pt-[72px]">
//         <div className="max-w-3xl mx-auto px-4 py-8">
//           {step === 0 && <Step1BasicDetails category={activeCategory} setCategory={setActiveCategory} next={handleNext} />}
//           {step === 1 && <Step2LocationDetails category={activeCategory} back={handleBack} next={handleNext} />}
//           {step === 2 && <MainContainer category={activeCategory} back={handleBack} next={handleNext} />}
//           {step === 3 && <Step4VerifyPublish category={activeCategory} back={handleBack} propertyId={id} />}
//         </div>
//       </main>
//     </div>
//   );
// }