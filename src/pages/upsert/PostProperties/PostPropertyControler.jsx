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
//import { toast } from "sonner";
import Whatup from "../../../assets/whatsuplogo.svg";
// Import Store Actions & Services
import { actions } from "../../../store/newIndex";
import { fetchLoggedInUser } from "../../../services/UserServices/userServices";
import { getPropertyById } from "../../../services/Common/AllPropertyServices";

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

  useEffect(() => {
    if (!activeCategory) return;

    const run = async () => {
      try {
        setIsFetching(true);

        // 🔹 EDIT / RESUME
        if (id) {
          const response = await getPropertyById(activeCategory, id);

          if (response?.data) {
            dispatch(actions[activeCategory].hydrateForm(response.data));
            localStorage.setItem("propertyId", id);
            localStorage.setItem("activeCategory", activeCategory);
          }

          setIsDataLoaded(true);
          return;
        }

        // 🔹 CHECK EXISTING DRAFT
        const existingId = localStorage.getItem("propertyId");
        if (existingId) {
          setIsDataLoaded(true);
          return;
        }

        // 🔹 CREATE NEW DRAFT
        const response = await createPropertyDraft(activeCategory);
        console.log("response:", response);
        const draft = response?.data?.data || response?.data;

        if (!draft?._id) {
          console.error("Draft API response:", response);
          throw new Error("Draft ID missing from server");
        }

        localStorage.setItem("propertyId", draft._id);
        localStorage.setItem("activeCategory", activeCategory);

        dispatch(actions[activeCategory].hydrateForm(draft));
        setIsDataLoaded(true);
      } catch (err) {
        console.error("❌ Property init failed:", err);
        toast.error("Failed to initialize property");
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