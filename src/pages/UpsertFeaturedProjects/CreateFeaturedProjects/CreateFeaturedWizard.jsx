// frontend/admin-dashboard/src/pages/post-property/CreateFeaturedWizard.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stepper from "./Constants/Stepper";
import { fetchLoggedInUser } from "../../../services/UserServices/userServices";
import { useFeaturedProject } from "./hook/useFeaturedProject";
import { ALL_STEPS, STEP_META } from "./Constants/constants";
import { StepRenderer } from "./Components/StepRenderer";
import { Header } from "./Components/Header";
import { StepHeaderCard } from "./Components/StepHeaderCard";
import { MainFormCard } from "./Components/MainFormCard";
import { ChevronDown } from "lucide-react";


export default function CreateFeaturedWizard() {
  const navigate = useNavigate();
const [current, setCurrent] = useState(0);
  const [isSeoValid, setIsSeoValid] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false); 
  const location = useLocation();
  const projectType = location.state?.type || "featured";

  const {
    payload,
    setPayload,
    updatePayload,
    replacePayload,
    submit,
    isLoading,
    progress,
  } = useFeaturedProject(projectType);

  const basicRef = useRef();
  const heroRef = useRef();
  const bhkRef = useRef();
  const amenitiesRef = useRef();
  const galleryRef = useRef();
  const aboutRef = useRef();
  const locationRef = useRef();
  const propertyProfilesRef = useRef();
  const seoRef = useRef();

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

  const handleSubmit = () => {
    submit();
  };

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

  const StepComponent = (
    <StepRenderer
      step={ALL_STEPS[current].id}
      refs={{
        basic: basicRef,
        hero: heroRef,
        bhk: bhkRef,
        amenities: amenitiesRef,
        gallery: galleryRef,
        about: aboutRef,
        location: locationRef,
        propertyProfiles: propertyProfilesRef,
        seo: seoRef,
      }}
      payload={payload}
      update={updatePayload}
      replace={replacePayload}
    />
  );

  const isLastStep = current === ALL_STEPS.length - 1 && isSeoValid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Topbar ── */}
      <Header current={current} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* ── Desktop Stepper (md+) ── */}
        <div className="hidden md:block">
          <Stepper
            steps={ALL_STEPS}
            current={current}
            onClickStep={setCurrent}
          />
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
                <p className="text-xs font-bold text-gray-700">
                  {ALL_STEPS[current].title}
                </p>
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
              <Stepper
                steps={ALL_STEPS}
                current={current}
                onClickStep={setCurrent}
              />
            </div>
          )}
        </div>

        {/* ── Step Header Card ── */}
        <StepHeaderCard current={current} />

        {/* ── Main Form Card ── */}
        <MainFormCard
          StepComponent={StepComponent}
          current={current}
          setCurrent={setCurrent}
          isLastStep={isLastStep}
          handleNext ={handleNext}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          progress={progress}
        />
      </div>
    </div>
  );
}

