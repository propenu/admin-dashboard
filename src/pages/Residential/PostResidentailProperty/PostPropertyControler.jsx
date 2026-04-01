//D:\propenu\frontend\admin-dashboard\src\pages\Residential\PostResidentailProperty\PostPropertyControler.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { setActiveCategory } from "../../../store/Ui/uiSlice";
import { createPropertyDraft } from "../../../features/property/propertyService";
import { toast } from "sonner";
import Step1BasicDetails from "./Step1BasicDetails";
import Step2LocationDetails from "./Step2LocationDetails";
import MainContainer from "./Step3PropertyDetails/MainContainer";
import Step4VerifyPublish from "./Step4VerifyPublish";
import Whatup from "../../../assets/whatsuplogo.svg";
import { actions } from "../../../store/newIndex";
import { getPropertyById } from "../../../services/Common/AllPropertyServices";
import { getMyPropertyDrafts } from "../../../features/property/propertyService";
import { Toaster } from "sonner";

const STEPS = [
  { label: "Basic Details", icon: "01" },
  { label: "Location", icon: "02" },
  { label: "Property Profile", icon: "03" },
  { label: "Verify & Publish", icon: "04" },
];

export default function PropertyController() {
  const { id } = useParams();
  const activeCategory = useSelector((state) => state.ui.activeCategory);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  


  const setStepFromDraft = (draft) => {
    const backendStep = draft?.completion?.step ?? 1;

    const frontendStep = Math.min(
      Math.max(backendStep - 1, 0),
      STEPS.length - 1,
    );

    setStep(frontendStep);
    setCompletedSteps(Array.from({ length: frontendStep }, (_, i) => i));
  };

  useEffect(() => {
    
    const storedCategory = localStorage.getItem("activeCategory");

    if (storedCategory && !activeCategory) dispatch(setActiveCategory(storedCategory));
  }, [activeCategory, dispatch]);



  const isInitializing = useRef(false);

  useEffect(() => {
  
    console.log("ACTIVE CATEGORY:", activeCategory);
   
    console.log("INIT FLAG:", isInitializing.current);
  }, [activeCategory]);

  useEffect(() => {

    if (!activeCategory || isInitializing.current) return;
    isInitializing.current = true;

    
   const normalizeDraft = (draft, currentForm) => ({
     ...draft,

     createdBy:
       typeof draft.createdBy === "object"
         ? draft.createdBy?._id
         : draft.createdBy || "",

     galleryFiles: currentForm?.galleryFiles?.length
       ? currentForm.galleryFiles
       : draft.gallery || [],
   });

     


    const run = async () => {
      setIsFetching(true);
      setIsDataLoaded(false);
      try {
        if (id) {
          const response = await getMyPropertyDrafts(activeCategory);
          const draft = response?.data;
          console.log("DRAFT:", draft);
          if (draft?._id) {

            // dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
            const currentForm = store.getState()[activeCategory]?.form;

            dispatch(
              actions[activeCategory].hydrateForm(
                normalizeDraft(draft, currentForm),
              ),
            );
            setStepFromDraft(draft);
            // localStorage.setItem("propertyId", draft._id);
            localStorage.setItem(`${activeCategory}_propertyId`, draft._id);
            localStorage.setItem("activeCategory", activeCategory);
            console.log(`${activeCategory}_propertyId`, draft._id);
            setIsDataLoaded(true);
          }
          return;
        }
        console.log("LOCAL STORAGE:", localStorage);
        const storedId = localStorage.getItem(`${activeCategory}_propertyId`);
        console.log("STORED ID:", storedId);

        if (storedId) {
          try {
            const response = await getPropertyById(activeCategory, storedId);

            const draft = response?.data;
            console.log("DRAFT:", draft);
            if (draft?._id) {
              dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
              console.log("Property ID:", draft._id);
              setStepFromDraft(draft);
              setIsDataLoaded(true);
              return;
            }
          } catch { localStorage.removeItem(`${activeCategory}_propertyId`); }
        }

        const response = await createPropertyDraft(activeCategory);

        const draft = response?.data?.data || response?.data;
        
        if (!draft?._id) throw new Error("Draft ID missing");
        dispatch(actions[activeCategory].hydrateForm(normalizeDraft(draft)));
        localStorage.setItem(`${activeCategory}_propertyId`, draft._id);
        localStorage.setItem("activeCategory", activeCategory);
        setStep(0); setCompletedSteps([]); setIsDataLoaded(true);
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Initialization failed");
        setIsDataLoaded(true);
      } finally { setIsFetching(false); }
    };

    
    run();
  }, [activeCategory, id, dispatch]);

  const handleNext = useCallback(() => {
    setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
    console.log("COMPLETED STEPS:", completedSteps);
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    console.log("NEXT STEP:", step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleBack = useCallback(() => {
    if (step === 0) navigate(-1);
    else { setStep((prev) => prev - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }, [step, navigate]);

  const progressPercentage = (completedSteps.length / STEPS.length) * 100;
  console.log("PROGRESS PERCENTAGE:", progressPercentage);

  if (isFetching || !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f0fdf4] to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#dcfce7]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#27AE60] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[#f0fdf4] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-semibold text-[#27AE60] tracking-wide">Setting up your property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="hidden lg:flex flex-col w-[350px] max-h-[414px]  lg:max-h-[455px]  bg-[FFFFFF]   sticky top-[80px]  h-screen px-6 py-2 shadow-xl rounded-md border border-[#EBECF0] bg-gradient-to-b from-[#E9F7EF] to-[#FFFFFF] ">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#6b7280] text-xs font-semibold mb-1 group hover:text-[#27AE60] transition-colors w-fit"
        >
          <span className="w-5 h-5 rounded-lg bg-[#f0fdf4] flex items-center justify-center border border-[#dcfce7] group-hover:bg-[#dcfce7] transition-colors">
            <ChevronLeft size={13} />
          </span>
          Go Back
        </button>

        <div className="mb-1">
         
          <h1 className="text-[22px] font-bold text-[#27AE60] leading-tight">
            Post Your Property
          </h1>
          <p className="text-xs text-[#000000] mt-1.5">
            Sell or rent your property
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-[11px] text-[#27AE60] font-medium">
              Overall Progress
            </span>
            <span className="text-[11px] font-bold  text-[#27AE60]">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-2 bg-[#f0fdf4] rounded-full overflow-hidden border  border-[#27AE60]">
            <div
              className="h-full bg-gradient-to-r from-[#27AE60] to-[#4ade80] rounded-full  transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-1">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isDone = completedSteps.includes(i);
            return (
              <div key={i} className="flex items-start gap-3 relative">
                {/* ICON COLUMN */}
                <div className="relative flex flex-col items-center">
                  {/* ICON */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300
              ${
                isDone
                  ? "bg-[#27AE60] text-white shadow-md shadow-green-200/60"
                  : isActive
                    ? "bg-[#27AE60] text-white shadow-lg shadow-green-300/50"
                    : "bg-[#f9fafb] text-[#d1d5db] border border-[#f0f0f0]"
              }`}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : s.icon}
                  </div>

                  {/* CONNECTOR LINE */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-[3px] h-8 mt-1 ${
                        isDone ? "bg-[#27AE60]" : "bg-[#e5e7eb]"
                      }`}
                    />
                  )}
                </div>

                {/* STEP CARD */}
                <div
                  className={`flex-1 w-[80%] flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200
          ${
            isActive
              ? "bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] shadow-xl"
              : ""
          }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* TITLE */}
                    <p
                      className={`text-sm font-semibold leading-tight truncate
              ${
                isActive
                  ? "text-[#111827]"
                  : isDone
                    ? "text-[#374151]"
                    : "text-[#c9c9c9]"
              }`}
                    >
                      {s.label}
                    </p>

                    {/* STATUS */}
                    <p
                      className={`text-[10px] mt-1 font-medium rounded-2xl w-fit px-2 py-[2px]
              ${
                isDone
                  ? "text-[#27AE60] border border-[#27AE60]"
                  : isActive
                    ? "text-[#27AE60]"
                    : "text-[#e5e7eb]"
              }`}
                    >
                      {isDone
                        ? "✓ Completed"
                        : isActive
                          ? "In progress"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help box */}
        {/* <div className="mt-6 bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#d1fae5] rounded-2xl p-4">
          <p className="text-[11px] text-[#374151] font-semibold mb-1">Need help posting?</p>
          <p className="text-[10px] text-[#9ca3af] mb-3">Chat with us directly on WhatsApp</p>
          <button className="flex items-center gap-1.5 text-[#25D366] font-bold text-xs group">
            <img src={Whatup} alt="whatsapp" className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div> */}
      </aside>

      {/* ═══ MOBILE HEADER ═══ */}
      <div className="lg:hidden  fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#e6f4ec] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#27AE60] text-sm font-semibold"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span className="text-xs text-[#6b7280] font-semibold">
            Step {step + 1} of {STEPS.length} · {STEPS[step].label}
          </span>
        </div>
        <div className="h-1.5 bg-[#f0fdf4] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#27AE60] to-[#4ade80] rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-[72px]  max-sm:pt-0">
        <div className="max-w-3xl mx-auto px-4 py-1 lg:max-w-full  xl:max-w-full">
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
      </main>
    </div>
  );
}